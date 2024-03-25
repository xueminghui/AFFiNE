import React, { useContext } from 'react';

import type { FrameworkProvider,GeneralServiceIdentifier } from '../core';
import { Framework } from '../core';

export const ServiceProviderContext = React.createContext(
  Framework.EMPTY.provider()
);

export function useService<T>(
  identifier: GeneralServiceIdentifier<T>,
  { provider }: { provider?: FrameworkProvider } = {}
): T {
  const contextServiceProvider = useContext(ServiceProviderContext);

  const serviceProvider = provider ?? contextServiceProvider;

  return serviceProvider.get(identifier);
}

export function useServiceOptional<T>(
  identifier: GeneralServiceIdentifier<T>,
  { provider }: { provider?: FrameworkProvider } = {}
): T | null {
  const contextServiceProvider = useContext(ServiceProviderContext);

  const serviceProvider = provider ?? contextServiceProvider;

  return serviceProvider.getOptional(identifier);
}
