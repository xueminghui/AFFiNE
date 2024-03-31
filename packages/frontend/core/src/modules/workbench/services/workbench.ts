import { Service } from '@toeverything/infra';

import { Workbench } from '../scopes/workbench';

export class WorkbenchService extends Service {
  workbench = this.framework.createScope(Workbench, '1');
}
