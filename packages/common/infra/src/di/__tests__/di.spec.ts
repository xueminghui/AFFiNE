import { describe, expect, test } from 'vitest';

import {
  CircularDependencyError,
  createIdentifier,
  DuplicateServiceDefinitionError,
  Framework,
  FrameworkProvider,
  MissingDependencyError,
  RecursionLimitError,
  ServiceNotFoundError,
} from '../';
import { Entity } from '../core/components/entity';
import { Service } from '../core/components/service';

describe('di', () => {
  test('basic', () => {
    const serviceCollection = new Framework();
    class TestService extends Service {
      a = 'b';
    }

    serviceCollection.service(TestService);

    const provider = serviceCollection.provider();
    expect(provider.get(TestService).a).toBe('b');
  });

  test('entity', () => {
    const serviceCollection = new Framework();
    class TestService extends Service {
      a = 'b';
    }

    class TestEntity extends Entity<{ name: string }> {
      constructor(readonly test: TestService) {
        super();
      }
    }

    serviceCollection.service(TestService).entity(TestEntity, [TestService]);

    const provider = serviceCollection.provider();
    const entity = provider.createEntity(TestEntity, '123', { name: 'test' });
    expect(entity.id).toBe('123');
    expect(entity.test.a).toBe('b');
    expect(entity.props.name).toBe('test');
  });

  test('size', () => {
    const serviceCollection = new Framework();
    class TestService extends Service {
      a = 'b';
    }

    serviceCollection.service(TestService);

    expect(serviceCollection.componentCount).toEqual(1);
  });

  test('dependency', () => {
    const serviceCollection = new Framework();

    class A extends Service {
      value = 'hello world';
    }

    class B extends Service {
      constructor(public a: A) {
        super();
      }
    }

    class C extends Service {
      constructor(public b: B) {
        super();
      }
    }

    serviceCollection.service(A).service(B, [A]).service(C, [B]);

    const provider = serviceCollection.provider();

    expect(provider.get(C).b.a.value).toEqual('hello world');
  });

  test('identifier', () => {
    interface Animal extends Service {
      name: string;
    }
    const Animal = createIdentifier<Animal>('Animal');

    class Cat extends Service {
      name = 'cat';
    }

    class Zoo extends Service {
      constructor(public animal: Animal) {
        super();
      }
    }

    const serviceCollection = new Framework();
    serviceCollection.impl(Animal, Cat).service(Zoo, [Animal]);

    const provider = serviceCollection.provider();
    expect(provider.get(Zoo).animal.name).toEqual('cat');
  });

  test('variant', () => {
    const serviceCollection = new Framework();

    interface USB extends Service {
      speed: number;
    }

    const USB = createIdentifier<USB>('USB');

    class TypeA extends Service implements USB {
      speed = 100;
    }
    class TypeC extends Service implements USB {
      speed = 300;
    }

    class PC extends Service {
      constructor(
        public typeA: USB,
        public ports: USB[]
      ) {
        super();
      }
    }

    serviceCollection
      .impl(USB('A'), TypeA)
      .impl(USB('C'), TypeC)
      .service(PC, [USB('A'), [USB]]);

    const provider = serviceCollection.provider();
    expect(provider.get(USB('A')).speed).toEqual(100);
    expect(provider.get(USB('C')).speed).toEqual(300);
    expect(provider.get(PC).typeA.speed).toEqual(100);
    expect(provider.get(PC).ports.length).toEqual(2);
  });

  test('lazy initialization', () => {
    const serviceCollection = new Framework();
    interface Command {
      shortcut: string;
      callback: () => void;
    }
    const Command = createIdentifier<Command>('command');

    let pageSystemInitialized = false;

    class PageSystem extends Service {
      mode = 'page';
      name = 'helloworld';

      constructor() {
        super();
        pageSystemInitialized = true;
      }

      switchToEdgeless() {
        this.mode = 'edgeless';
      }

      rename() {
        this.name = 'foobar';
      }
    }

    class CommandSystem extends Service {
      constructor(public commands: Command[]) {
        super();
      }

      execute(shortcut: string) {
        const command = this.commands.find(c => c.shortcut === shortcut);
        if (command) {
          command.callback();
        }
      }
    }

    serviceCollection.service(PageSystem);
    serviceCollection.service(CommandSystem, [[Command]]);
    serviceCollection.impl(Command('switch'), p => ({
      shortcut: 'option+s',
      callback: () => p.get(PageSystem).switchToEdgeless(),
    }));
    serviceCollection.impl(Command('rename'), p => ({
      shortcut: 'f2',
      callback: () => p.get(PageSystem).rename(),
    }));

    const provider = serviceCollection.provider();
    const commandSystem = provider.get(CommandSystem);

    expect(
      pageSystemInitialized,
      "PageSystem won't be initialized until command executed"
    ).toEqual(false);

    commandSystem.execute('option+s');
    expect(pageSystemInitialized).toEqual(true);
    expect(provider.get(PageSystem).mode).toEqual('edgeless');

    expect(provider.get(PageSystem).name).toEqual('helloworld');
    expect(commandSystem.commands.length).toEqual(2);
    commandSystem.execute('f2');
    expect(provider.get(PageSystem).name).toEqual('foobar');
  });

  test('duplicate, override', () => {
    const serviceCollection = new Framework();

    const something = createIdentifier<any>('USB');

    class A {
      a = 'i am A';
    }

    class B {
      b = 'i am B';
    }

    serviceCollection.impl(something, A).override(something, B);

    const provider = serviceCollection.provider();
    expect(provider.get(something)).toEqual({ b: 'i am B' });
  });

  test('scope', () => {
    const services = new Framework();

    class System extends Service {
      appName = 'affine';
    }

    services.service(System);

    class Workspace extends Entity {
      static readonly layer = 'workspace';
      constructor(public system: System) {
        super();
      }
    }

    services.layer(Workspace).entity(Workspace, [System]);
    class Page extends Entity {
      static readonly layer = 'workspace';
      constructor(
        public system: System,
        public workspace: Workspace
      ) {
        super();
      }
    }

    services.layer(Page).entity(Page, [System, Workspace]);

    class Editor {
      name = 'editor';
      constructor(public page: Page) {}
    }

    services.scope(editorScope).service(Editor, [Page]);

    const root = services.provider();
    expect(root.get(System).appName).toEqual('affine');
    expect(() => root.get(Workspace)).toThrowError(ServiceNotFoundError);

    const workspace = services.provider(workspaceScope, root);
    expect(workspace.get(Workspace).name).toEqual('workspace');
    expect(workspace.get(System).appName).toEqual('affine');
    expect(() => root.get(Page)).toThrowError(ServiceNotFoundError);

    const page = services.provider(pageScope, workspace);
    expect(page.get(Page).name).toEqual('page');
    expect(page.get(Workspace).name).toEqual('workspace');
    expect(page.get(System).appName).toEqual('affine');

    const editor = services.provider(editorScope, page);
    expect(editor.get(Editor).name).toEqual('editor');
  });

  test('service not found', () => {
    const serviceCollection = new Framework();

    const provider = serviceCollection.provider();
    expect(() => provider.get(createIdentifier('SomeService'))).toThrowError(
      ServiceNotFoundError
    );
  });

  test('missing dependency', () => {
    const serviceCollection = new Framework();

    class A {
      value = 'hello world';
    }

    class B {
      constructor(public a: A) {}
    }

    serviceCollection.service(B, [A]);

    const provider = serviceCollection.provider();
    expect(() => provider.get(B)).toThrowError(MissingDependencyError);
  });

  test('circular dependency', () => {
    const serviceCollection = new Framework();

    class A {
      constructor(public c: C) {}
    }

    class B {
      constructor(public a: A) {}
    }

    class C {
      constructor(public b: B) {}
    }

    serviceCollection.service(A, [C]).service(B, [A]).service(C, [B]);

    const provider = serviceCollection.provider();
    expect(() => provider.get(A)).toThrowError(CircularDependencyError);
    expect(() => provider.get(B)).toThrowError(CircularDependencyError);
    expect(() => provider.get(C)).toThrowError(CircularDependencyError);
  });

  test('duplicate service definition', () => {
    const serviceCollection = new Framework();

    class A {}

    serviceCollection.service(A);
    expect(() => serviceCollection.service(A)).toThrowError(
      DuplicateServiceDefinitionError
    );

    class B {}
    const Something = createIdentifier('something');
    serviceCollection.impl(Something, A);
    expect(() => serviceCollection.impl(Something, B)).toThrowError(
      DuplicateServiceDefinitionError
    );
  });

  test('recursion limit', () => {
    // maxmium resolve depth is 100
    const serviceCollection = new Framework();
    const Something = createIdentifier('something');
    let i = 0;
    for (; i < 100; i++) {
      const next = i + 1;

      class Test {
        constructor(_next: any) {}
      }

      serviceCollection.impl(Something(i.toString()), Test, [
        Something(next.toString()),
      ]);
    }

    class Final {
      a = 'b';
    }
    serviceCollection.impl(Something(i.toString()), Final);
    const provider = serviceCollection.provider();
    expect(() => provider.get(Something('0'))).toThrowError(
      RecursionLimitError
    );
  });

  test('self resolve', () => {
    const serviceCollection = new Framework();
    const provider = serviceCollection.provider();
    expect(provider.get(FrameworkProvider)).toEqual(provider);
  });
});
