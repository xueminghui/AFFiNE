import { DebugLogger } from '@affine/debug';
import { Slot } from '@blocksuite/global/utils';
import type { DocCollection } from '@blocksuite/store';

import type { FrameworkProvider } from '../framework';
import { CleanupService } from '../lifecycle';
import type { WorkspaceEngine, WorkspaceEngineStatus } from './engine';
import type { WorkspaceMetadata } from './metadata';
import type {
  WorkspaceUpgradeController,
  WorkspaceUpgradeStatus,
} from './upgrade';

export type { DocCollection } from '@blocksuite/store';

const logger = new DebugLogger('affine:workspace');

export type WorkspaceStatus = {
  mode: 'ready' | 'closed';
  engine: WorkspaceEngineStatus;
  upgrade: WorkspaceUpgradeStatus;
};

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
export class Workspace {
  get id() {
    return this.meta.id;
  }
  get flavour() {
    return this.meta.flavour;
  }

  private _status: WorkspaceStatus;

  onStatusChange = new Slot<WorkspaceStatus>();
  get status() {
    return this._status;
  }

  set status(status: WorkspaceStatus) {
    this._status = status;
    this.onStatusChange.emit(status);
  }

  constructor(
    public meta: WorkspaceMetadata,
    public engine: WorkspaceEngine,
    public docCollection: DocCollection,
    public upgrade: WorkspaceUpgradeController,
    public services: FrameworkProvider
  ) {
    this._status = {
      mode: 'closed',
      engine: engine.status,
      upgrade: this.upgrade.status,
    };
    this.engine.onStatusChange.on(status => {
      this.status = {
        ...this.status,
        engine: status,
      };
    });
    this.upgrade.onStatusChange.on(status => {
      this.status = {
        ...this.status,
        upgrade: status,
      };
    });

    this.start();
  }

  /**
   * workspace start when create and workspace is one-time use
   */
  private start() {
    if (this.status.mode === 'ready') {
      return;
    }
    logger.info('start workspace', this.id);
    this.engine.start();
    this.status = {
      ...this.status,
      mode: 'ready',
      engine: this.engine.status,
    };
  }

  canGracefulStop() {
    return this.engine.canGracefulStop() && !this.status.upgrade.upgrading;
  }

  forceStop() {
    if (this.status.mode === 'closed') {
      return;
    }
    logger.info('stop workspace', this.id);
    this.engine.forceStop();
    this.status = {
      ...this.status,
      mode: 'closed',
      engine: this.engine.status,
    };
    this.services.get(CleanupService).cleanup();
  }

  setPriorityLoad(docId: string, priority: number) {
    this.engine.doc.setPriority(docId, priority);
  }
}
