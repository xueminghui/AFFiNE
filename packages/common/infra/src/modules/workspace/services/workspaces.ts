import { Service } from '../../../framework';
import type { WorkspaceDestroyService } from './destroy';
import type { WorkspaceFactory } from './factory';
import type { WorkspaceListService } from './list';
import type { WorkspaceProfileRepository } from './profile-repo';
import type { WorkspaceRepository } from './repo';
import type { WorkspaceTransformService } from './transform';

export class WorkspacesService extends Service {
  get list() {
    return this.listService.list;
  }

  constructor(
    private readonly listService: WorkspaceListService,
    private readonly profileRepo: WorkspaceProfileRepository,
    private readonly transform: WorkspaceTransformService,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly workspaceFactory: WorkspaceFactory,
    private readonly destroy: WorkspaceDestroyService
  ) {
    super();
  }

  get deleteWorkspace() {
    return this.destroy.deleteWorkspace;
  }

  get getProfile() {
    return this.profileRepo.getProfile;
  }

  get transformLocalToCloud() {
    return this.transform.transformLocalToCloud;
  }

  get open() {
    return this.workspaceRepo.open;
  }

  get create() {
    return this.workspaceFactory.create;
  }
}
