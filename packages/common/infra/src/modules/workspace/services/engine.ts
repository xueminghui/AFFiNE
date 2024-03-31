import { Service } from '../../../framework';
import { WorkspaceEngine } from '../entities/engine';
import type { WorkspaceScope } from '../scopes/workspace';

export class WorkspaceEngineService extends Service {
  readonly engine: WorkspaceEngine;

  constructor(workspace: WorkspaceScope) {
    super();

    this.engine = this.framework.createEntity(WorkspaceEngine, '1', {
      engineProvider: workspace.flavourProvider.getEngineProvider(
        workspace.openOptions
      ),
      yDoc: workspace.rootYDoc,
    });
  }
}
