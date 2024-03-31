import { DebugLogger } from '@affine/debug';

import { setupEditorFlags } from '../../../atom';
import { fixWorkspaceVersion } from '../../../blocksuite';
import { Service } from '../../../framework';
import { ObjectPool } from '../../../utils';
import { WorkspaceScope } from '../scopes/workspace';
import type { WorkspaceOpenOptions } from '../open-options';
import type { WorkspaceFlavourProvider } from '../providers/flavour';
import type { WorkspaceProfileRepository } from './profile-repo';

const logger = new DebugLogger('affine:workspace-repository');

export class WorkspaceRepository extends Service {
  constructor(
    private readonly providers: WorkspaceFlavourProvider[],
    private readonly profileRepo: WorkspaceProfileRepository
  ) {
    super();
  }
  pool = new ObjectPool<string, WorkspaceScope>({
    onDelete(workspace) {
      workspace.dispose();
    },
    onDangling(workspace) {
      return workspace.canGracefulStop;
    },
  });

  /**
   * get workspace reference by metadata.
   *
   * You basically don't need to call this function directly, use the react hook `useWorkspace(metadata)` instead.
   *
   * @returns the workspace reference and a release function, don't forget to call release function when you don't
   * need the workspace anymore.
   */
  open = (
    options: WorkspaceOpenOptions
  ): {
    workspace: WorkspaceScope;
    dispose: () => void;
  } => {
    if (options.isSharedMode) {
      const workspace = this.instantiate(options);
      return {
        workspace,
        dispose: () => {
          workspace.dispose();
        },
      };
    }

    const exist = this.pool.get(options.metadata.id);
    if (exist) {
      return {
        workspace: exist.obj,
        dispose: exist.release,
      };
    }

    const workspace = this.instantiate(options);
    // sync information with workspace list, when workspace's avatar and name changed, information will be updated
    // this.list.getInformation(metadata).syncWithWorkspace(workspace);

    const ref = this.pool.put(workspace.meta.id, workspace);

    return {
      workspace: ref.obj,
      dispose: ref.release,
    };
  };

  instantiate(openOptions: WorkspaceOpenOptions) {
    logger.info(
      `open workspace [${openOptions.metadata.flavour}] ${openOptions.metadata.id} `
    );
    const provider = this.providers.find(
      p => p.flavour === openOptions.metadata.flavour
    );
    if (!provider) {
      throw new Error(
        `Unknown workspace flavour: ${openOptions.metadata.flavour}`
      );
    }

    const workspace = this.framework.createScope(
      WorkspaceScope,
      openOptions.metadata.id,
      { openOptions, flavourProvider: provider }
    );

    workspace.engine.start();

    // apply compatibility fix
    fixWorkspaceVersion(workspace.docCollection.doc);

    setupEditorFlags(workspace.docCollection);

    this.profileRepo
      .getProfile(openOptions.metadata)
      .syncWithWorkspace(workspace);

    return workspace;
  }
}
