import { stableHash } from '../../utils';
import type { Framework } from './collection';
import type { Entity } from './components/entity';
import type { LayerRoot } from './components/layer-root';
import { withContext } from './context';
import {
  CircularDependencyError,
  MissingDependencyError,
  RecursionLimitError,
  ServiceNotFoundError,
} from './error';
import { parseIdentifier } from './identifier';
import type {
  ComponentVariant,
  FrameworkLayer,
  GeneralIdentifier,
  IdentifierValue,
} from './types';

export interface ResolveOptions {
  sameScope?: boolean;
  optional?: boolean;
  noCache?: boolean;
}

export abstract class FrameworkProvider {
  abstract collection: Framework;
  abstract scope: FrameworkLayer;
  abstract getRaw(identifier: IdentifierValue, options?: ResolveOptions): any;
  abstract getAllRaw(
    identifier: IdentifierValue,
    options?: ResolveOptions
  ): Map<ComponentVariant, any>;

  get<T>(identifier: GeneralIdentifier<T>, options?: ResolveOptions): T {
    return this.getRaw(parseIdentifier(identifier), {
      ...options,
      optional: false,
    });
  }

  getAll<T>(
    identifier: GeneralIdentifier<T>,
    options?: ResolveOptions
  ): Map<ComponentVariant, T> {
    return this.getAllRaw(parseIdentifier(identifier), {
      ...options,
    });
  }

  getOptional<T>(
    identifier: GeneralIdentifier<T>,
    options?: ResolveOptions
  ): T | null {
    return this.getRaw(parseIdentifier(identifier), {
      ...options,
      optional: true,
    });
  }

  createEntity<T extends Entity, Props = T extends Entity<infer P> ? P : never>(
    identifier: GeneralIdentifier<T>,
    id: string,
    ...[props]: Props extends undefined ? [] : [Props]
  ): T {
    return withContext(
      () =>
        this.getRaw(parseIdentifier(identifier), {
          noCache: true,
          sameScope: true,
        }),
      {
        entityId: id,
        entityProps: props,
      }
    );
  }

  createLayer<T extends Entity, Props = T extends Entity<infer P> ? P : never>(
    root: GeneralIdentifier<LayerRoot>,
    id: string,
    ...[props]: Props extends undefined ? [] : [Props]
  ): T {
    const newProvider = this.collection.provider([
      ...this.scope,
      stableHash(root),
    ]);
    return withContext(
      () =>
        newProvider.getRaw(parseIdentifier(root), {
          noCache: true,
          sameScope: true,
        }),
      {
        entityId: id,
        entityProps: props,
      }
    );
  }
}

export class ComponentCachePool {
  cache: Map<string, Map<ComponentVariant, any>> = new Map();

  getOrInsert(identifier: IdentifierValue, insert: () => any) {
    const cache = this.cache.get(identifier.identifierName) ?? new Map();
    if (!cache.has(identifier.variant)) {
      cache.set(identifier.variant, insert());
    }
    const cached = cache.get(identifier.variant);
    this.cache.set(identifier.identifierName, cache);
    return cached;
  }
}

class Resolver extends FrameworkProvider {
  constructor(
    public readonly provider: BasicServiceProvider,
    public readonly depth = 0,
    public readonly stack: IdentifierValue[] = []
  ) {
    super();
  }

  scope = this.provider.scope;
  collection = this.provider.collection;

  getRaw(
    identifier: IdentifierValue,
    {
      sameScope = false,
      optional = false,
      noCache = false,
    }: ResolveOptions = {}
  ) {
    const factory = this.provider.collection.getFactory(
      identifier,
      this.provider.scope
    );
    if (!factory) {
      if (this.provider.parent && !sameScope) {
        return this.provider.parent.getRaw(identifier, {
          sameScope,
          optional,
          noCache,
        });
      }

      if (optional) {
        return undefined;
      }
      throw new ServiceNotFoundError(identifier);
    }

    const runFactory = () => {
      const nextResolver = this.track(identifier);
      try {
        return withContext(() => factory(nextResolver), {
          provider: this.provider,
        });
      } catch (err) {
        if (err instanceof ServiceNotFoundError) {
          throw new MissingDependencyError(
            identifier,
            err.identifier,
            this.stack
          );
        }
        throw err;
      }
    };

    if (noCache) {
      return runFactory();
    }

    return this.provider.cache.getOrInsert(identifier, runFactory);
  }

  getAllRaw(
    identifier: IdentifierValue,
    { sameScope = false, noCache }: ResolveOptions = {}
  ): Map<ComponentVariant, any> {
    const vars = this.provider.collection.getFactoryAll(
      identifier,
      this.provider.scope
    );

    if (vars === undefined) {
      if (this.provider.parent && !sameScope) {
        return this.provider.parent.getAllRaw(identifier);
      }

      return new Map();
    }

    const result = new Map<ComponentVariant, any>();

    for (const [variant, factory] of vars) {
      const runFactory = () => {
        const nextResolver = this.track(identifier);
        try {
          return factory(nextResolver);
        } catch (err) {
          if (err instanceof ServiceNotFoundError) {
            throw new MissingDependencyError(
              identifier,
              err.identifier,
              this.stack
            );
          }
          throw err;
        }
      };
      let service;
      if (noCache) {
        service = runFactory();
      } else {
        service = this.provider.cache.getOrInsert(
          {
            identifierName: identifier.identifierName,
            variant,
          },
          runFactory
        );
      }
      result.set(variant, service);
    }

    return result;
  }

  track(identifier: IdentifierValue): Resolver {
    const depth = this.depth + 1;
    if (depth >= 100) {
      throw new RecursionLimitError();
    }
    const circular = this.stack.find(
      i =>
        i.identifierName === identifier.identifierName &&
        i.variant === identifier.variant
    );
    if (circular) {
      throw new CircularDependencyError([...this.stack, identifier]);
    }

    return new Resolver(this.provider, depth, [...this.stack, identifier]);
  }
}

export class BasicServiceProvider extends FrameworkProvider {
  public readonly cache = new ComponentCachePool();
  public readonly collection: Framework;

  constructor(
    collection: Framework,
    public readonly scope: string[],
    public readonly parent: FrameworkProvider | null
  ) {
    super();
    this.collection = collection;
  }

  getRaw(identifier: IdentifierValue, options?: ResolveOptions) {
    const resolver = new Resolver(this);
    return resolver.getRaw(identifier, options);
  }

  getAllRaw(
    identifier: IdentifierValue,
    options?: ResolveOptions
  ): Map<ComponentVariant, any> {
    const resolver = new Resolver(this);
    return resolver.getAllRaw(identifier, options);
  }
}
