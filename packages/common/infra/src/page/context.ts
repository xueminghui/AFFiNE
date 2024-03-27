import type { Doc as BlockSuiteDoc } from '@blocksuite/store';

import type { Framework } from '../framework';
import { createIdentifier } from '../framework';
import type { PageRecord } from './record';
import { PageScope } from './service-scope';

export const BlockSuitePageContext = createIdentifier<BlockSuiteDoc>(
  'BlockSuitePageContext'
);

export const PageRecordContext =
  createIdentifier<PageRecord>('PageRecordContext');

export function configurePageContext(
  services: Framework,
  blockSuitePage: BlockSuiteDoc,
  pageRecord: PageRecord
) {
  services
    .scope(PageScope)
    .impl(PageRecordContext, pageRecord)
    .impl(BlockSuitePageContext, blockSuitePage);
}
