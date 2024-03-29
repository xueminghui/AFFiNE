import type { Framework } from '../../framework';
import { MemoryMemento } from '../../storage';
import { GlobalCache, GlobalState } from './providers/global';

export { GlobalCache, GlobalState } from './providers/global';

export const configureTestingGlobalStorage = (framework: Framework) => {
  framework.impl(GlobalCache, MemoryMemento);
  framework.impl(GlobalState, MemoryMemento);
};
