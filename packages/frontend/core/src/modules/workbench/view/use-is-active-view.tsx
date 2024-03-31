import { useLiveData, useScope } from '@toeverything/infra';

import { View } from '../scopes/view';
import { Workbench } from '../scopes/workbench';

export function useIsActiveView() {
  const workbench = useScope(Workbench);
  const view = useScope(View);

  const activeView = useLiveData(workbench.activeView$);
  return view === activeView;
}
