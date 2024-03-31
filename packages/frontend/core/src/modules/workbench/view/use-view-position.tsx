import { useScope } from '@toeverything/infra';
import { useEffect, useState } from 'react';

import { View } from '../scopes/view';
import { Workbench } from '../scopes/workbench';

export const useViewPosition = () => {
  const workbench = useScope(Workbench);
  const view = useScope(View);

  const [position, setPosition] = useState(() =>
    calcPosition(view, workbench.views$.value)
  );

  useEffect(() => {
    const subscription = workbench.views$.subscribe(views => {
      setPosition(calcPosition(view, views));
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [view, workbench]);

  return position;
};

function calcPosition(view: View, viewList: View[]) {
  const index = viewList.indexOf(view);
  return {
    index: index,
    isFirst: index === 0,
    isLast: index === viewList.length - 1,
  };
}
