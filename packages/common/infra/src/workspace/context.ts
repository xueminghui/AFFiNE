/**
 * This module contains the context of the workspace scope.
 * You can use those context when declare workspace service.
 *
 * Is helpful when implement workspace low level providers, like `SyncEngine`,
 * which need to access workspace low level components.
 *
 * Normally, business service should depend on `Workspace` service, not workspace context.
 *
 * @example
 * ```ts
 * import { declareWorkspaceService } from '@toeverything/infra';
 * declareWorkspaceService(XXXService, {
 *    factory: declareFactory(
 *      [BlockSuiteWorkspaceContext, RootYDocContext],   // <== inject workspace context
 *      (bs, rootDoc) => new XXXService(bs.value, rootDoc.value)
 *    ),
 *  })
 */

import { DocCollection } from '@blocksuite/store';
import { nanoid } from 'nanoid';
import type { Awareness } from 'y-protocols/awareness.js';
import type { Doc as YDoc } from 'yjs';

import type { Framework } from '../framework';
import { createIdentifier } from '../framework';
import { BlobEngine } from './engine/blob';
import { globalBlockSuiteSchema } from './global-schema';
import type { WorkspaceMetadata } from './metadata';
import { WorkspaceScope } from './service-scope';

export const BlockSuiteWorkspaceContext = createIdentifier<DocCollection>(
  'BlockSuiteWorkspaceContext'
);

export const RootYDocContext = createIdentifier<YDoc>('RootYDocContext');

export const AwarenessContext = createIdentifier<Awareness>('AwarenessContext');

export const WorkspaceMetadataContext = createIdentifier<WorkspaceMetadata>(
  'WorkspaceMetadataContext'
);

export const WorkspaceIdContext =
  createIdentifier<string>('WorkspaceIdContext');

export function configureWorkspaceContext(
  services: Framework,
  workspaceMetadata: WorkspaceMetadata
) {
  services
    .scope(WorkspaceScope)
    .impl(WorkspaceMetadataContext, workspaceMetadata)
    .impl(WorkspaceIdContext, workspaceMetadata.id)
    .impl(BlockSuiteWorkspaceContext, provider => {
      return new DocCollection({
        id: workspaceMetadata.id,
        blobStorages: [
          () => ({
            crud: provider.get(BlobEngine),
          }),
        ],
        idGenerator: () => nanoid(),
        schema: globalBlockSuiteSchema,
      });
    })
    .impl(
      AwarenessContext,
      provider =>
        provider.get(BlockSuiteWorkspaceContext).awarenessStore.awareness
    )
    .impl(
      RootYDocContext,
      provider => provider.get(BlockSuiteWorkspaceContext).doc
    );
}
