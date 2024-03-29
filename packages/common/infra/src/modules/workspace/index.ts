export type { WorkspaceProfileInfo } from './entities/profile';
export { globalBlockSuiteSchema } from './global-schema';
export { Workspace } from './layer/workspace';
export type { WorkspaceMetadata } from './metadata';
export type { WorkspaceOpenOptions } from './open-options';
export type { WorkspaceEngineProvider } from './providers/flavour';
export { WorkspaceFlavourProvider } from './providers/flavour';
export { WorkspaceLocalState } from './providers/storage';
export { WorkspaceService } from './services/workspace';

import type { Framework } from '../../framework';
import { GlobalCache, GlobalState } from '../storage';
import { WorkspaceEngine } from './entities/engine';
import { WorkspaceList } from './entities/list';
import { WorkspaceProfile } from './entities/profile';
import { WorkspaceUpgrade } from './entities/upgrade';
import { Workspace } from './layer/workspace';
import { WorkspaceFlavourProvider } from './providers/flavour';
import { WorkspaceDestroyService } from './services/destroy';
import { WorkspaceEngineService } from './services/engine';
import { WorkspaceListService } from './services/list';
import { WorkspaceProfileRepository } from './services/profile-repo';
import { WorkspaceTransformService } from './services/transform';
import { WorkspaceUpgradeService } from './services/upgrade';
import { WorkspaceService } from './services/workspace';
import { WorkspaceFactory } from './services/workspace-factory';
import { WorkspaceRepository } from './services/workspace-repo';
import { TestingWorkspaceLocalProvider } from './testing/testing-provider';

export function configureWorkspaceModule(framework: Framework) {
  framework
    .service(WorkspaceService, [
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
    .layer(Workspace)
    .root(Workspace)
    .service(WorkspaceEngineService, [Workspace])
    .entity(WorkspaceEngine)
    .service(WorkspaceUpgradeService)
    .entity(WorkspaceUpgrade, [
      Workspace,
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
