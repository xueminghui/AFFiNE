import type { Framework } from '@toeverything/infra';
import {
  GlobalCache,
  GlobalState,
  PageRecordList,
  Workspace,
  WorkspaceScope,
} from '@toeverything/infra';

import { CollectionService } from './collection';
import {
  LocalStorageGlobalCache,
  LocalStorageGlobalState,
} from './infra-web/storage';
import { Navigator } from './navigation';
import { RightSidebar } from './right-sidebar/entities/right-sidebar';
import { TagService } from './tag';
import { Workbench } from './workbench';
import {
  CurrentWorkspaceService,
  FavoriteItemsAdapter,
  WorkspaceLegacyProperties,
  WorkspacePropertiesAdapter,
} from './workspace';

export function configureBusinessServices(services: Framework) {
  services.service(CurrentWorkspaceService);
  services
    .scope(WorkspaceScope)
    .add(Workbench)
    .add(Navigator, [Workbench])
    .add(RightSidebar, [GlobalState])
    .add(WorkspacePropertiesAdapter, [Workspace])
    .add(FavoriteItemsAdapter, [WorkspacePropertiesAdapter])
    .add(CollectionService, [Workspace])
    .add(WorkspaceLegacyProperties, [Workspace])
    .add(TagService, [WorkspaceLegacyProperties, PageRecordList]);
}

export function configureWebInfraServices(services: Framework) {
  services
    .impl(GlobalCache, LocalStorageGlobalCache)
    .impl(GlobalState, LocalStorageGlobalState);
}
