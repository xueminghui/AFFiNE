import type { Framework } from './collection';
import {
  CircularDependencyError,
  MissingDependencyError,
  RecursionLimitError,
  ServiceNotFoundError,
} from './error';
import { parseIdentifier } from './identifier';
import type {
  ComponentVariant,
  GeneralServiceIdentifier,
  IdentifierValue,
} from './types';

export interface ResolveOptions {
  sameScope?: boolean;
  optional?: boolean;
}

export abstract class FrameworkProvider {
  abstract collection: Framework;
  abstract getRaw(identifier: IdentifierValue, options?: ResolveOptions): any;
  abstract getAllRaw(
    identifier: IdentifierValue,
    options?: ResolveOptions
  ): Map<ComponentVariant, any>;

  get<T>(identifier: GeneralServiceIdentifier<T>, options?: ResolveOptions): T {
    return this.getRaw(parseIdentifier(identifier), {
      ...options,
      optional: false,
    });
  }

  getAll<T>(
    identifier: GeneralServiceIdentifier<T>,
    options?: ResolveOptions
  ): Map<ComponentVariant, T> {
    return this.getAllRaw(parseIdentifier(identifier), {
      ...options,
    });
  }

  getOptional<T>(
    identifier: GeneralServiceIdentifier<T>,
    options?: ResolveOptions
  ): T | null {
    return this.getRaw(parseIdentifier(identifier), {
      ...options,
      optional: true,
    });
  }
}

export class ServiceCachePool {
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

export class ServiceResolver extends FrameworkProvider {
  constructor(
    public readonly provider: BasicServiceProvider,
    public readonly depth = 0,
    public readonly stack: IdentifierValue[] = []
  ) {
    super();
  }

  collection = this.provider.collection;

  getRaw(
    identifier: IdentifierValue,
    { sameScope = false, optional = false }: ResolveOptions = {}
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
        });
      }

      if (optional) {
        return undefined;
      }
      throw new ServiceNotFoundError(identifier);
    }

    return this.provider.cache.getOrInsert(identifier, () => {
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
    });
  }

  getAllRaw(
    identifier: IdentifierValue,
    { sameScope = false }: ResolveOptions = {}
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
      const service = this.provider.cache.getOrInsert(
        { identifierName: identifier.identifierName, variant },
        () => {
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
        }
      );
      result.set(variant, service);
    }

    return result;
  }

  track(identifier: IdentifierValue): ServiceResolver {
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

    return new ServiceResolver(this.provider, depth, [
      ...this.stack,
      identifier,
    ]);
  }
}

export class BasicServiceProvider extends FrameworkProvider {
  public readonly cache = new ServiceCachePool();
  public readonly collection: Framework;

  constructor(
    collection: Framework,
    public readonly scope: string[],
    public readonly parent: FrameworkProvider | null
  ) {
    super();
    this.collection = collection.clone();
    this.collection.addValue(FrameworkProvider, this, {
      scope: scope,
      override: true,
    });
  }

  getRaw(identifier: IdentifierValue, options?: ResolveOptions) {
    const resolver = new ServiceResolver(this);
    return resolver.getRaw(identifier, options);
  }

  getAllRaw(
    identifier: IdentifierValue,
    options?: ResolveOptions
  ): Map<ComponentVariant, any> {
    const resolver = new ServiceResolver(this);
    return resolver.getAllRaw(identifier, options);
  }
}
