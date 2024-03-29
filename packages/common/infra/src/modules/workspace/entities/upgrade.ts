import { Unreachable } from '@affine/env/constant';
import { WorkspaceFlavour } from '@affine/env/workspace';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate } from 'yjs';

import {
  checkWorkspaceCompatibility,
  forceUpgradePages,
  migrateGuidCompatibility,
  MigrationPoint,
  upgradeV1ToV2,
} from '../../../blocksuite';
import { Entity } from '../../../framework';
import { LiveData } from '../../../livedata';
import type { Workspace } from '../layer/workspace';
import type { WorkspaceMetadata } from '../metadata';
import type { WorkspaceDestroyService } from '../services/destroy';
import type { WorkspaceFactory } from '../services/workspace-factory';

export class WorkspaceUpgrade extends Entity {
  needUpgrade$ = new LiveData(false);
  upgrading$ = new LiveData(false);

  constructor(
    private readonly workspace: Workspace,
    private readonly workspaceFactory: WorkspaceFactory,
    private readonly workspaceDestroy: WorkspaceDestroyService
  ) {
    super();
    workspace.docCollection.doc.on('update', () => {
      this.checkIfNeedUpgrade();
    });
  }

  checkIfNeedUpgrade() {
    const needUpgrade = !!checkWorkspaceCompatibility(
      this.workspace.docCollection,
      this.workspace.flavour === WorkspaceFlavour.AFFINE_CLOUD
    );
    this.needUpgrade$.next(needUpgrade);
    return needUpgrade;
  }

  async upgrade(): Promise<WorkspaceMetadata | null> {
    if (this.upgrading$.value) {
      return null;
    }

    this.upgrading$.next(true);

    try {
      await this.workspace.engine.waitForDocSynced();

      const step = checkWorkspaceCompatibility(
        this.workspace.docCollection,
        this.workspace.flavour === WorkspaceFlavour.AFFINE_CLOUD
      );

      if (!step) {
        return null;
      }

      // Clone a new doc to prevent change events.
      const clonedDoc = new YDoc({
        guid: this.workspace.docCollection.doc.guid,
      });
      applyDoc(clonedDoc, this.workspace.docCollection.doc);

      if (step === MigrationPoint.SubDoc) {
        const newWorkspace = await this.workspaceFactory.create(
          WorkspaceFlavour.LOCAL,
          async (workspace, blobStorage) => {
            await upgradeV1ToV2(clonedDoc, workspace.doc);
            migrateGuidCompatibility(clonedDoc);
            await forceUpgradePages(
              workspace.doc,
              this.workspace.docCollection.schema
            );
            const blobList = await this.workspace.docCollection.blob.list();

            for (const blobKey of blobList) {
              const blob = await this.workspace.docCollection.blob.get(blobKey);
              if (blob) {
                await blobStorage.set(blobKey, blob);
              }
            }
          }
        );
        await this.workspaceDestroy.deleteWorkspace(this.workspace.meta);
        return newWorkspace;
      } else if (step === MigrationPoint.GuidFix) {
        migrateGuidCompatibility(clonedDoc);
        await forceUpgradePages(clonedDoc, this.workspace.docCollection.schema);
        applyDoc(this.workspace.docCollection.doc, clonedDoc);
        await this.workspace.engine.waitForDocSynced();
        return null;
      } else if (step === MigrationPoint.BlockVersion) {
        await forceUpgradePages(clonedDoc, this.workspace.docCollection.schema);
        applyDoc(this.workspace.docCollection.doc, clonedDoc);
        await this.workspace.engine.waitForDocSynced();
        return null;
      } else {
        throw new Unreachable();
      }
    } finally {
      this.upgrading$.next(false);
    }
  }
}

function applyDoc(target: YDoc, result: YDoc) {
  applyUpdate(target, encodeStateAsUpdate(result));
  for (const targetSubDoc of target.subdocs.values()) {
    const resultSubDocs = Array.from(result.subdocs.values());
    const resultSubDoc = resultSubDocs.find(
      item => item.guid === targetSubDoc.guid
    );
    if (resultSubDoc) {
      applyDoc(targetSubDoc, resultSubDoc);
    }
  }
}
