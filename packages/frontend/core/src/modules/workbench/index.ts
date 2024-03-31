export { View } from './scopes/view';
export { Workbench } from './scopes/workbench';
export { WorkbenchService } from './services/workbench';
export { useIsActiveView } from './view/use-is-active-view';
export { ViewBodyIsland } from './view/view-body-island';
export { ViewHeaderIsland } from './view/view-header-island';
export { WorkbenchLink } from './view/workbench-link';
export { WorkbenchRoot } from './view/workbench-root';

import { type Framework, Workspace } from '@toeverything/infra';

import { View } from './scopes/view';
import { Workbench } from './scopes/workbench';
import { WorkbenchService } from './services/workbench';

export function configureWorkbenchModule(services: Framework) {
  services
    .scope(Workspace)
    .service(WorkbenchService)
    .scope(Workbench)
    .root(Workbench)
    .scope(View)
    .root(View);
}
