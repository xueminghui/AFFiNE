export { DocRecord } from './entities/record';
export { DocRecordList } from './entities/record-list';
export { Doc } from './scopes/doc';
export { DocService } from './services/doc';

import type { Framework } from '../../framework';
import { Workspace, WorkspaceLocalState } from '../workspace';
import { DocRecord } from './entities/record';
import { DocRecordList } from './entities/record-list';
import { Doc } from './scopes/doc';
import { DocService } from './services/doc';

export function configureDocModule(framework: Framework) {
  framework
    .scope(Workspace)
    .service(DocService, [Workspace])
    .entity(DocRecord, [Workspace, WorkspaceLocalState])
    .entity(DocRecordList, [Workspace])
    .scope(Doc)
    .entity(Doc);
}
