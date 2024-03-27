import { CONSTRUCTOR_CONTEXT } from '../constructor-context';
import type { FrameworkProvider } from '../provider';

export class Component {
  readonly framework: FrameworkProvider;
  constructor() {
    if (!CONSTRUCTOR_CONTEXT.current.provider) {
      throw new Error('Component must be created in the context of a provider');
    }
    this.framework = CONSTRUCTOR_CONTEXT.current.provider;
  }
}
