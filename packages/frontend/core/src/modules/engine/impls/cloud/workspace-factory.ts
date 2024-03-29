import { WorkspaceFlavour } from '@affine/env/workspace';
import type { Framework, WorkspaceFactory } from '@toeverything/infra';
import {
  AwarenessContext,
  AwarenessProvider,
  DocServerImpl,
  RemoteBlobStorage,
  WorkspaceIdContext,
  WorkspaceScope,
} from '@toeverything/infra';

import { LocalWorkspaceFactory } from '../local';
import { IndexedDBBlobStorage } from '../local/blob-indexeddb';
import { SQLiteBlobStorage } from '../local/blob-sqlite';
import { AffineCloudAwarenessProvider } from './awareness';
import { AffineCloudBlobStorage } from './blob';
import { AffineCloudDocEngineServer } from './doc';

export class CloudWorkspaceFactory implements WorkspaceFactory {
  name = WorkspaceFlavour.AFFINE_CLOUD;
  configureWorkspace(services: Framework): void {
    // configure local-first providers
    new LocalWorkspaceFactory().configureWorkspace(services);

    services
      .scope(WorkspaceScope)
      .impl(RemoteBlobStorage('affine-cloud'), AffineCloudBlobStorage, [
        WorkspaceIdContext,
      ])
      .impl(DocServerImpl, AffineCloudDocEngineServer, [WorkspaceIdContext])
      .impl(AwarenessProvider('affine-cloud'), AffineCloudAwarenessProvider, [
        WorkspaceIdContext,
        AwarenessContext,
      ]);
  }
  async getWorkspaceBlob(id: string, blobKey: string): Promise<Blob | null> {
    // try to get blob from local storage first
    const localBlobStorage = environment.isDesktop
      ? new SQLiteBlobStorage(id)
      : new IndexedDBBlobStorage(id);

    const localBlob = await localBlobStorage.get(blobKey);
    if (localBlob) {
      return localBlob;
    }

    const blobStorage = new AffineCloudBlobStorage(id);
    return await blobStorage.get(blobKey);
  }
}
