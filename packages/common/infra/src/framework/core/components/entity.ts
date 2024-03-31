import { Component } from './component';

export class Entity<Props = any> extends Component<Props & { id: string }> {
  readonly id: string;

  constructor() {
    super();
    if (!this.props.id) {
      throw new Error('Entity must have an id');
    }
    this.id = this.props.id;
  }
}
