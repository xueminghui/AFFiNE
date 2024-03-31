import { Service } from '../../../framework';
import { ObjectPool } from '../../../utils';
import type { Workspace } from '../../workspace';
import { DocRecordList } from '../entities/record-list';
import { Doc } from '../scopes/doc';

export class DocService extends Service {
  docRecordList = this.framework.createEntity(DocRecordList, '1');

  pool = new ObjectPool<string, Doc>({});

  constructor(private readonly workspace: Workspace) {
    super();
  }

  open(docId: string) {
    const docRecord = this.docRecordList.record$(docId).value;
    if (!docRecord) {
      throw new Error('Page record not found');
    }
    const blockSuiteDoc = this.workspace.docCollection.getDoc(docId);
    if (!blockSuiteDoc) {
      throw new Error('Page not found');
    }

    const exists = this.pool.get(docId);
    if (exists) {
      return { page: exists.obj, release: exists.release };
    }

    const doc = this.framework.createScope(Doc, docId, {
      blockSuiteDoc,
      record: docRecord,
    });

    const { obj, release } = this.pool.put(docId, doc);

    return { doc: obj, release };
  }
}
