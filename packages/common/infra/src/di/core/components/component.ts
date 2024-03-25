import { CONSTRUCTOR_CONTEXT } from '../constructor-context';
import type { FrameworkProvider } from '../provider';

export class Component {
  framework: FrameworkProvider;
  constructor() {
    if (CONSTRUCTOR_CONTEXT.current === null) {
      throw new Error('Component must be created in the context of a provider');
    }
    this.framework = CONSTRUCTOR_CONTEXT.current;
  }
}
