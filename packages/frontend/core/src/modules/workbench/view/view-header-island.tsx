import { useScope } from '@toeverything/infra';

import { View } from '../scopes/view';

export const ViewHeaderIsland = ({ children }: React.PropsWithChildren) => {
  const view = useScope(View);
  return <view.header.Provider>{children}</view.header.Provider>;
};
