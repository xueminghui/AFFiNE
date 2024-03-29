import type { Framework, WorkspaceFactory } from '@toeverything/infra';
import {
  AwarenessContext,
  AwarenessProvider,
  DocStorageImpl,
  LocalBlobStorage,
  RemoteBlobStorage,
  WorkspaceIdContext,
  WorkspaceScope,
} from '@toeverything/infra';

import { BroadcastChannelAwarenessProvider } from './awareness';
import { IndexedDBBlobStorage } from './blob-indexeddb';
import { SQLiteBlobStorage } from './blob-sqlite';
import { StaticBlobStorage } from './blob-static';
import { IndexedDBDocStorage } from './doc-indexeddb';
import { SqliteDocStorage } from './doc-sqlite';

export class LocalWorkspaceFactory implements WorkspaceFactory {
  name = 'local';
  configureWorkspace(services: Framework): void {
    if (environment.isDesktop) {
      services
        .scope(WorkspaceScope)
        .impl(LocalBlobStorage, SQLiteBlobStorage, [WorkspaceIdContext])
        .impl(DocStorageImpl, SqliteDocStorage, [WorkspaceIdContext]);
    } else {
      services
        .scope(WorkspaceScope)
        .impl(LocalBlobStorage, IndexedDBBlobStorage, [WorkspaceIdContext])
        .impl(DocStorageImpl, IndexedDBDocStorage, [WorkspaceIdContext]);
    }

    services
      .scope(WorkspaceScope)
      .impl(RemoteBlobStorage('static'), StaticBlobStorage)
      .impl(
        AwarenessProvider('broadcast-channel'),
        BroadcastChannelAwarenessProvider,
        [WorkspaceIdContext, AwarenessContext]
      );
  }
  async getWorkspaceBlob(id: string, blobKey: string): Promise<Blob | null> {
    const blobStorage = environment.isDesktop
      ? new SQLiteBlobStorage(id)
      : new IndexedDBBlobStorage(id);

    return await blobStorage.get(blobKey);
  }
}
