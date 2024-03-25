import type { FrameworkProvider } from './provider';

export const CONSTRUCTOR_CONTEXT: { current: FrameworkProvider | null } = {
  current: null,
};
