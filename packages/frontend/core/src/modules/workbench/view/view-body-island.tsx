import { useScope } from '@toeverything/infra';

import { View } from '../scopes/view';

export const ViewBodyIsland = ({ children }: React.PropsWithChildren) => {
  const view = useScope(View);
  return <view.body.Provider>{children}</view.body.Provider>;
};
