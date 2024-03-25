export * from './manager';
export * from './page';
export * from './record';
export * from './record-list';
export * from './service-scope';

import type { Framework } from '../di';
import { FrameworkProvider } from '../di';
import { CleanupService } from '../lifecycle';
import { Workspace, WorkspaceLocalState, WorkspaceScope } from '../workspace';
import { BlockSuitePageContext, PageRecordContext } from './context';
import { PageManager } from './manager';
import { Doc } from './page';
import { PageRecordList } from './record-list';
import { PageScope } from './service-scope';

export function configurePageServices(services: Framework) {
  services
    .scope(WorkspaceScope)
    .service(PageManager, [Workspace, PageRecordList, FrameworkProvider])
    .service(PageRecordList, [Workspace, WorkspaceLocalState]);

  services
    .scope(PageScope)
    .service(CleanupService)
    .service(Doc, [
      PageRecordContext,
      BlockSuitePageContext,
      FrameworkProvider,
    ]);
}
