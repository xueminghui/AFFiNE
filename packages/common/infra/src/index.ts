export * from './app-config-storage';
export * from './atom';
export * from './blocksuite';
export * from './command';
export * from './di';
export * from './initialization';
export * from './lifecycle';
export * from './livedata';
export * from './page';
export * from './storage';
export * from './utils';
export * from './workspace';

import type { Framework } from './di';
import { CleanupService } from './lifecycle';
import { configurePageServices } from './page';
import { GlobalCache, GlobalState, MemoryMemento } from './storage';
import {
  configureTestingWorkspaceServices,
  configureWorkspaceServices,
} from './workspace';

export function configureInfraServices(services: Framework) {
  services.service(CleanupService);
  configureWorkspaceServices(services);
  configurePageServices(services);
}

export function configureTestingInfraServices(services: Framework) {
  configureTestingWorkspaceServices(services);
  services.override(GlobalCache, MemoryMemento);
  services.override(GlobalState, MemoryMemento);
}
