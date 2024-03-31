import { DocCollection } from '@blocksuite/store';
import { nanoid } from 'nanoid';
import type { Awareness } from 'y-protocols/awareness.js';

import { Scope } from '../../../framework';
import { globalBlockSuiteSchema } from '../global-schema';
import type { WorkspaceOpenOptions } from '../open-options';
import type { WorkspaceFlavourProvider } from '../providers/flavour';
import { WorkspaceEngineService } from '../services/engine';
import { WorkspaceUpgradeService } from '../services/upgrade';

export type { DocCollection } from '@blocksuite/store';

/**
 * # Workspace
 *
 * ```
 *               ┌───────────┐
 *               │ Workspace │
 *               └─────┬─────┘
 *                     │
 *                     │
 *      ┌──────────────┼─────────────┐
 *      │              │             │
 *  ┌───┴─────┐ ┌──────┴─────┐   ┌───┴────┐
 *  │ Upgrade │ │ blocksuite │   │ Engine │
 *  └─────────┘ └────────────┘   └───┬────┘
 *                                   │
 *                            ┌──────┼─────────┐
 *                            │      │         │
 *                         ┌──┴─┐ ┌──┴─┐ ┌─────┴───┐
 *                         │sync│ │blob│ │awareness│
 *                         └────┘ └────┘ └─────────┘
 * ```
 *
 * This class contains all the components needed to run a workspace.
 */
export class WorkspaceScope extends Scope<{
  openOptions: WorkspaceOpenOptions;
  flavourProvider: WorkspaceFlavourProvider;
}> {
  get openOptions() {
    return this.props.openOptions;
  }

  get meta() {
    return this.props.openOptions.metadata;
  }

  get flavour() {
    return this.meta.flavour;
  }

  _docCollection: DocCollection | null = null;

  get docCollection() {
    if (!this._docCollection) {
      this._docCollection = new DocCollection({
        id: this.id,
        blobStorages: [
          () => ({
            crud: this.engine.blob,
          }),
        ],
        idGenerator: () => nanoid(),
        schema: globalBlockSuiteSchema,
      });
    }
    return this._docCollection;
  }

  get awareness() {
    return this.docCollection.awarenessStore.awareness as Awareness;
  }

  get rootYDoc() {
    return this.docCollection.doc;
  }

  get canGracefulStop() {
    // TODO
    return true;
  }

  get engine() {
    return this.framework.get(WorkspaceEngineService).engine;
  }

  get upgrade() {
    return this.framework.get(WorkspaceUpgradeService).upgrade;
  }

  get flavourProvider() {
    return this.props.flavourProvider;
  }
}
