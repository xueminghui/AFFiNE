export * from './context';
export * from './engine';
export * from './factory';
export * from './global-schema';
export * from './list';
export * from './manager';
export * from './metadata';
export * from './service-scope';
export * from './storage';
export * from './testing';
export * from './upgrade';
export * from './workspace';

import type { Framework } from '../di';
import { FrameworkProvider } from '../di';
import { CleanupService } from '../lifecycle';
import { GlobalCache, GlobalState, MemoryMemento } from '../storage';
import {
  BlockSuiteWorkspaceContext,
  RootYDocContext,
  WorkspaceMetadataContext,
} from './context';
import {
  AwarenessEngine,
  AwarenessProvider,
  BlobEngine,
  DocEngine,
  DocServerImpl,
  DocStorageImpl,
  LocalBlobStorage,
  RemoteBlobStorage,
  WorkspaceEngine,
} from './engine';
import { WorkspaceFactory } from './factory';
import { WorkspaceListProvider, WorkspaceListService } from './list';
import { WorkspaceManager } from './manager';
import { WorkspaceScope } from './service-scope';
import { WorkspaceLocalState } from './storage';
import {
  TestingLocalWorkspaceFactory,
  TestingLocalWorkspaceListProvider,
} from './testing';
import { WorkspaceUpgradeController } from './upgrade';
import { Workspace } from './workspace';

export function configureWorkspaceServices(services: Framework) {
  // global scope
  services
    .service(WorkspaceManager, [
      WorkspaceListService,
      [WorkspaceFactory],
      FrameworkProvider,
    ])
    .service(WorkspaceListService, [[WorkspaceListProvider], GlobalCache]);

  // workspace scope
  services
    .scope(WorkspaceScope)
    .service(CleanupService)
    .service(Workspace, [
      WorkspaceMetadataContext,
      WorkspaceEngine,
      BlockSuiteWorkspaceContext,
      WorkspaceUpgradeController,
      FrameworkProvider,
    ])
    .service(WorkspaceEngine, [
      BlobEngine,
      DocEngine,
      AwarenessEngine,
      RootYDocContext,
    ])
    .service(AwarenessEngine, [[AwarenessProvider]])
    .service(BlobEngine, [LocalBlobStorage, [RemoteBlobStorage]])
    .impl(DocEngine, services => {
      return new DocEngine(
        services.get(DocStorageImpl),
        services.getOptional(DocServerImpl)
      );
    })
    .service(WorkspaceUpgradeController, [
      BlockSuiteWorkspaceContext,
      DocEngine,
      WorkspaceMetadataContext,
    ]);
}

export function configureTestingWorkspaceServices(services: Framework) {
  services
    .override(WorkspaceListProvider('affine-cloud'), null)
    .override(WorkspaceFactory('affine-cloud'), null)
    .override(
      WorkspaceListProvider('local'),
      TestingLocalWorkspaceListProvider,
      [GlobalState]
    )
    .override(WorkspaceFactory('local'), TestingLocalWorkspaceFactory, [
      GlobalState,
    ])
    .scope(WorkspaceScope)
    .override(WorkspaceLocalState, MemoryMemento);
}
