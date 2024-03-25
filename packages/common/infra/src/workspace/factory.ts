import type { Framework } from '../di';
import { createIdentifier } from '../di';

export interface WorkspaceFactory {
  name: string;

  configureWorkspace(services: Framework): void;

  /**
   * get blob without open workspace
   */
  getWorkspaceBlob(id: string, blobKey: string): Promise<Blob | null>;
}

export const WorkspaceFactory =
  createIdentifier<WorkspaceFactory>('WorkspaceFactory');
