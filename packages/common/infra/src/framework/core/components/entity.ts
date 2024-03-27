import { CONSTRUCTOR_CONTEXT } from '../constructor-context';
import { Component } from './component';

export class Entity<Props = any> extends Component {
  readonly id: string;
  readonly props: Props;

  constructor() {
    super();
    if (!CONSTRUCTOR_CONTEXT.current.entityId) {
      throw new Error('Component must be created in the context of a provider');
    }
    this.id = CONSTRUCTOR_CONTEXT.current.entityId;
    this.props = CONSTRUCTOR_CONTEXT.current.entityProps;
  }
}
