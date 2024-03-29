import {
  type BlobStorage,
  createIdentifier,
  type DocStorage,
} from '@toeverything/infra';

export interface EngineStorageProvider {
  getDocStorage(workspaceId: string): DocStorage;
  getBlobStorage(workspaceId: string): BlobStorage;
}

export const EngineStorageProvider = createIdentifier<EngineStorageProvider>(
  'EngineStorageProvider'
);
