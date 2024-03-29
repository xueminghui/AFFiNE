import type { Doc as BlockSuiteDoc } from '@blocksuite/store';
import { LayerRoot, type PageMode } from '@toeverything/infra';

import type { DocRecord } from '../entities/record';

export class Doc extends LayerRoot<{
  record: DocRecord;
  blockSuiteDoc: BlockSuiteDoc;
}> {
  public readonly blockSuiteDoc = this.props.blockSuiteDoc;
  public readonly record = this.props.record;

  readonly mete$ = this.record.meta$;
  readonly mode$ = this.record.mode$;
  readonly title$ = this.record.title$;

  setMode(mode: PageMode) {
    this.record.setMode(mode);
  }

  toggleMode() {
    this.record.toggleMode();
  }
}
