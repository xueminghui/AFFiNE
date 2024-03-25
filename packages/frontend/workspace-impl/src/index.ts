import type { Framework } from '@toeverything/infra';
import {
  GlobalState,
  Workspace,
  WorkspaceFactory,
  WorkspaceListProvider,
  WorkspaceLocalState,
  WorkspaceScope,
} from '@toeverything/infra';

import { CloudWorkspaceFactory, CloudWorkspaceListProvider } from './cloud';
import { LocalWorkspaceFactory, LocalWorkspaceListProvider } from './local';
import { LOCAL_WORKSPACE_LOCAL_STORAGE_KEY } from './local/consts';
import { WorkspaceLocalStateImpl } from './local-state';

export * from './cloud';
export * from './local';

export function configureWorkspaceImplServices(services: Framework) {
  services
    .impl(WorkspaceListProvider('affine-cloud'), CloudWorkspaceListProvider)
    .impl(WorkspaceFactory('affine-cloud'), CloudWorkspaceFactory)
    .impl(WorkspaceListProvider('local'), LocalWorkspaceListProvider)
    .impl(WorkspaceFactory('local'), LocalWorkspaceFactory)
    .scope(WorkspaceScope)
    .impl(WorkspaceLocalState, WorkspaceLocalStateImpl, [
      Workspace,
      GlobalState,
    ]);
}

/**
 * a hack for directly add local workspace to workspace list
 * Used after copying sqlite database file to appdata folder
 */
export function _addLocalWorkspace(id: string) {
  const allWorkspaceIDs: string[] = JSON.parse(
    localStorage.getItem(LOCAL_WORKSPACE_LOCAL_STORAGE_KEY) ?? '[]'
  );
  allWorkspaceIDs.push(id);
  localStorage.setItem(
    LOCAL_WORKSPACE_LOCAL_STORAGE_KEY,
    JSON.stringify(allWorkspaceIDs)
  );
}
