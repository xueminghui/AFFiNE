import type { ListedBlobRecord } from '@affine/nbstore';
import {
  effect,
  Entity,
  fromPromise,
  LiveData,
  onComplete,
  onStart,
} from '@toeverything/infra';
import { fileTypeFromBuffer } from 'file-type';
import { EMPTY, mergeMap, switchMap } from 'rxjs';

import type { DocsSearchService } from '../../docs-search';
import type { WorkspaceService } from '../../workspace';
import type { WorkspaceFlavoursService } from '../../workspace/services/flavours';

interface HydratedBlobRecord extends ListedBlobRecord, Disposable {
  url: string;
  extension?: string;
  type?: string;
}

export class UnusedBlobs extends Entity {
  constructor(
    private readonly flavoursService: WorkspaceFlavoursService,
    private readonly workspaceService: WorkspaceService,
    private readonly docsSearchService: DocsSearchService
  ) {
    super();
  }

  isLoading$ = new LiveData(false);
  unusedBlobs$ = new LiveData<ListedBlobRecord[]>([]);

  readonly revalidate = effect(
    switchMap(() =>
      fromPromise(async () => {
        return await this.getUnusedBlobs();
      }).pipe(
        mergeMap(data => {
          this.unusedBlobs$.setValue(data);
          return EMPTY;
        }),
        onStart(() => this.isLoading$.setValue(true)),
        onComplete(() => this.isLoading$.setValue(false))
      )
    )
  );

  private get flavourProvider() {
    return this.flavoursService.flavours$.value.find(
      f => f.flavour === this.workspaceService.workspace.flavour
    );
  }

  private get localFlavourProvider() {
    return this.flavoursService.flavours$.value.find(
      f => f.flavour === 'local'
    );
  }

  async listBlobs() {
    const blobs = await this.flavourProvider?.listBlobs(
      this.workspaceService.workspace.id
    );
    return blobs;
  }

  async getBlob(blobKey: string) {
    const blob = await this.flavourProvider?.getWorkspaceBlob(
      this.workspaceService.workspace.id,
      blobKey
    );
    return blob;
  }

  async deleteBlob(blob: string, permanent: boolean) {
    await this.flavourProvider?.deleteBlob(
      this.workspaceService.workspace.id,
      blob,
      permanent
    );

    if (this.localFlavourProvider !== this.flavourProvider) {
      await this.localFlavourProvider?.deleteBlob(
        this.workspaceService.workspace.id,
        blob,
        permanent
      );
    }
  }

  async getUnusedBlobs(abortSignal?: AbortSignal) {
    // wait for the indexer to finish
    await this.docsSearchService.indexer.status$.waitFor(
      status => status.remaining === undefined || status.remaining === 0,
      abortSignal
    );

    const [blobs, usedBlobs] = await Promise.all([
      this.listBlobs(),
      this.getUsedBlobs(),
    ]);

    // ignore the workspace avatar
    const workspaceAvatar = this.workspaceService.workspace.avatar$.value;

    return (
      blobs?.filter(
        blob => !usedBlobs.includes(blob.key) && blob.key !== workspaceAvatar
      ) ?? []
    );
  }

  private async getUsedBlobs(): Promise<string[]> {
    const result = await this.docsSearchService.indexer.blockIndex.aggregate(
      {
        type: 'boolean',
        occur: 'must',
        queries: [
          {
            type: 'exists',
            field: 'blob',
          },
        ],
      },
      'blob'
    );
    return result.buckets.map(bucket => bucket.key);
  }

  async hydrateBlob(
    record: ListedBlobRecord,
    abortSignal?: AbortSignal
  ): Promise<HydratedBlobRecord | null> {
    const blob = await this.getBlob(record.key);

    if (!blob || abortSignal?.aborted) {
      return null;
    }

    const fileType = await fileTypeFromBuffer(await blob.arrayBuffer());

    if (abortSignal?.aborted) {
      return null;
    }

    const url = URL.createObjectURL(new Blob([blob]));
    const mime = record.mime || fileType?.mime || 'unknown';
    // todo(@pengx17): the following may not be sufficient
    const extension = fileType?.ext;
    const type = extension ?? (mime?.startsWith('text/') ? 'txt' : 'unknown');
    return {
      ...record,
      url,
      extension,
      type,
      mime,
      [Symbol.dispose]: () => {
        URL.revokeObjectURL(url);
      },
    };
  }
}