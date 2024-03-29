export { DocRecord } from './entities/record';
export { DocRecordList } from './entities/record-list';
export { Doc } from './layer/doc';
export { DocService } from './services/doc';

import type { Framework } from '../../framework';
import { Workspace, WorkspaceLocalState } from '../workspace';
import { DocRecord } from './entities/record';
import { DocRecordList } from './entities/record-list';
import { Doc } from './layer/doc';
import { DocService } from './services/doc';

export function configureDocModule(framework: Framework) {
  framework
    .layer(Workspace)
    .service(DocService, [Workspace])
    .entity(DocRecord, [Workspace, WorkspaceLocalState])
    .entity(DocRecordList, [Workspace])
    .layer(Doc)
    .entity(Doc);
}
