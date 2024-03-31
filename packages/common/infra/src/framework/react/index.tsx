import React, { useContext, useMemo } from 'react';

import type { FrameworkProvider, Scope, Service } from '../core';
import { ComponentNotFoundError, Framework } from '../core';
import { parseIdentifier } from '../core/identifier';
import type { Type } from '../core/types';

export const FrameworkStackContext = React.createContext<FrameworkProvider[]>([
  Framework.EMPTY.provider(),
]);

export function useService<T extends Service>(identifier: Type<T>): T {
  const stack = useContext(FrameworkStackContext);

  let service: T | null = null;

  for (let i = stack.length - 1; i >= 0; i--) {
    service = stack[i].get(identifier, {
      sameScope: true,
      optional: true,
    });

    if (service) {
      break;
    }
  }

  if (!service) {
    throw new ComponentNotFoundError(parseIdentifier(identifier));
  }

  return service;
}

export function useServiceOptional<T extends Service>(
  identifier: Type<T>
): T | null {
  const stack = useContext(FrameworkStackContext);

  let service: T | null = null;

  for (let i = stack.length - 1; i >= 0; i--) {
    service = stack[i].get(identifier, {
      sameScope: true,
      optional: true,
    });

    if (service) {
      break;
    }
  }

  return service;
}

export function useScope<T extends Scope>(identifier: Type<T>) {
  const stack = useContext(FrameworkStackContext);

  let scope: T | null = null;

  for (let i = stack.length - 1; i >= 0; i--) {
    scope = stack[i].get(identifier, {
      optional: true,
    });

    if (scope) {
      break;
    }
  }

  if (!scope) {
    throw new ComponentNotFoundError(parseIdentifier(identifier));
  }

  return scope;
}

export const Root = ({
  framework,
  children,
}: React.PropsWithChildren<{ framework: FrameworkProvider }>) => {
  return (
    <FrameworkStackContext.Provider value={[framework]}>
      {children}
    </FrameworkStackContext.Provider>
  );
};

export const Scope = ({
  scope,
  children,
}: React.PropsWithChildren<{ scope: Scope }>) => {
  const stack = useContext(FrameworkStackContext);

  const nextStack = useMemo(() => {
    return [...stack, scope.framework];
  }, [stack, scope]);

  return (
    <FrameworkStackContext.Provider value={nextStack}>
      {children}
    </FrameworkStackContext.Provider>
  );
};
