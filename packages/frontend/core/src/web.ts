import { configureWorkspaceImplServices } from '@affine/workspace-impl';
import type { Framework } from '@toeverything/infra';
import { configureInfraServices } from '@toeverything/infra';

import {
  configureBusinessServices,
  configureWebInfraServices,
} from './modules/services';

export function configureWebServices(services: Framework) {
  configureInfraServices(services);
  configureWebInfraServices(services);
  configureBusinessServices(services);
  configureWorkspaceImplServices(services);
}
