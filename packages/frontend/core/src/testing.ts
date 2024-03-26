import { WorkspaceFlavour } from '@affine/env/workspace';
import type { Doc as BlockSuiteDoc } from '@blocksuite/store';
import {
  configureTestingInfraServices,
  Framework,
  PageManager,
  WorkspaceManager,
} from '@toeverything/infra';

import { CurrentWorkspaceService } from './modules/workspace';
import { configureWebServices } from './web';

export async function configureTestingEnvironment() {
  const serviceCollection = new Framework();

  configureWebServices(serviceCollection);
  configureTestingInfraServices(serviceCollection);

  const rootServices = serviceCollection.provider();

  const workspaceManager = rootServices.get(WorkspaceManager);

  const { workspace } = workspaceManager.open(
    await workspaceManager.createWorkspace(WorkspaceFlavour.LOCAL, async ws => {
      const initPage = async (page: BlockSuiteDoc) => {
        page.load();
        const pageBlockId = page.addBlock('affine:page', {
          title: new page.Text(''),
        });
        const frameId = page.addBlock('affine:note', {}, pageBlockId);
        page.addBlock('affine:paragraph', {}, frameId);
      };
      await initPage(ws.createDoc({ id: 'page0' }));
    })
  );

  await workspace.engine.waitForSynced();

  const { page } = workspace.services.getService(PageManager).open('page0');

  rootServices.get(CurrentWorkspaceService).openWorkspace(workspace);

  return { services: rootServices, workspace, page };
}
