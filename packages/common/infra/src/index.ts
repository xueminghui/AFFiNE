export * from './app-config-storage';
export * from './atom';
export * from './blocksuite';
export * from './command';
export * from './framework';
export * from './initialization';
export * from './livedata';
export * from './modules/doc';
export * from './modules/storage';
export * from './modules/workspace';
export * from './storage';
export * from './sync';
export * from './utils';

import type { Framework } from './framework';
import { configureDocModule } from './modules/doc';
import { configureTestingGlobalStorage } from './modules/storage';
import {
  configureTestingWorkspaceProvider,
  configureWorkspaceModule,
} from './modules/workspace';

export function configureInfraModules(services: Framework) {
  configureWorkspaceModule(services);
  configureDocModule(services);
}

export function configureTestingInfraModules(services: Framework) {
  configureTestingGlobalStorage(services);
  configureTestingWorkspaceProvider(services);
}
