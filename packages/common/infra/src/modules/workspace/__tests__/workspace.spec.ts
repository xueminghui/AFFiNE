import { WorkspaceFlavour } from '@affine/env/workspace';
import { describe, expect, test } from 'vitest';

import { Framework } from '../../../framework';
import { configureTestingGlobalStorage } from '../../storage';
import {
  configureTestingWorkspaceProvider,
  configureWorkspaceModule,
  WorkspaceService,
} from '..';

describe('Workspace System', () => {
  test('create workspace', async () => {
    const framework = new Framework();
    configureTestingGlobalStorage(framework);
    configureWorkspaceModule(framework);
    configureTestingWorkspaceProvider(framework);

    const provider = framework.provider();
    const workspaceService = provider.get(WorkspaceService);
    expect(workspaceService.list.workspaces$.value.length).toBe(0);

    await workspaceService.create(WorkspaceFlavour.LOCAL);

    expect(workspaceService.list.workspaces$.value.length).toBe(1);
  });
});
