import type { Doc as BlockSuiteDoc } from '@blocksuite/store';

import { Scope } from '../../../framework';
import type { DocMode, DocRecord } from '../entities/record';

export class Doc extends Scope<{
  record: DocRecord;
  blockSuiteDoc: BlockSuiteDoc;
}> {
  public readonly blockSuiteDoc = this.props.blockSuiteDoc;
  public readonly record = this.props.record;

  readonly mete$ = this.record.meta$;
  readonly mode$ = this.record.mode$;
  readonly title$ = this.record.title$;

  setMode(mode: DocMode) {
    this.record.setMode(mode);
  }

  toggleMode() {
    this.record.toggleMode();
  }
}
