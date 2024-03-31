export type { WorkspaceProfileInfo } from './entities/profile';
export { globalBlockSuiteSchema } from './global-schema';
export type { WorkspaceMetadata } from './metadata';
export type { WorkspaceOpenOptions } from './open-options';
export type { WorkspaceEngineProvider } from './providers/flavour';
export { WorkspaceFlavourProvider } from './providers/flavour';
export { WorkspaceLocalState } from './providers/storage';
export { WorkspaceScope as Workspace } from './scopes/workspace';
export { WorkspacesService as WorkspaceService } from './services/workspaces';

import type { Framework } from '../../framework';
import { GlobalCache, GlobalState } from '../storage';
import { WorkspaceEngine } from './entities/engine';
import { WorkspaceList } from './entities/list';
import { WorkspaceProfile } from './entities/profile';
import { WorkspaceUpgrade } from './entities/upgrade';
import { WorkspaceFlavourProvider } from './providers/flavour';
import { WorkspaceScope } from './scopes/workspace';
import { WorkspaceDestroyService } from './services/destroy';
import { WorkspaceEngineService } from './services/engine';
import { WorkspaceFactory } from './services/factory';
import { WorkspaceListService } from './services/list';
import { WorkspaceProfileRepository } from './services/profile-repo';
import { WorkspaceRepository } from './services/repo';
import { WorkspaceTransformService } from './services/transform';
import { WorkspaceUpgradeService } from './services/upgrade';
import { WorkspacesService } from './services/workspaces';
import { TestingWorkspaceLocalProvider } from './testing/testing-provider';

export function configureWorkspaceModule(framework: Framework) {
  framework
    .service(WorkspacesService, [
      WorkspaceListService,
      WorkspaceProfileRepository,
      WorkspaceTransformService,
      WorkspaceRepository,
      WorkspaceFactory,
      WorkspaceDestroyService,
    ])
    .service(WorkspaceDestroyService, [[WorkspaceFlavourProvider]])
    .service(WorkspaceListService)
    .entity(WorkspaceList, [[WorkspaceFlavourProvider], GlobalCache])
    .service(WorkspaceProfileRepository)
    .entity(WorkspaceProfile, [GlobalCache, [WorkspaceFlavourProvider]])
    .service(WorkspaceFactory, [[WorkspaceFlavourProvider]])
    .service(WorkspaceTransformService, [
      WorkspaceFactory,
      WorkspaceDestroyService,
    ])
    .service(WorkspaceRepository, [
      [WorkspaceFlavourProvider],
      WorkspaceProfileRepository,
    ])
    .scope(WorkspaceScope)
    .root(WorkspaceScope)
    .service(WorkspaceEngineService, [WorkspaceScope])
    .entity(WorkspaceEngine)
    .service(WorkspaceUpgradeService)
    .entity(WorkspaceUpgrade, [
      WorkspaceScope,
      WorkspaceFactory,
      WorkspaceDestroyService,
    ]);
}

export function configureTestingWorkspaceProvider(framework: Framework) {
  framework.impl(
    WorkspaceFlavourProvider('LOCAL'),
    TestingWorkspaceLocalProvider,
    [GlobalState]
  );
}
