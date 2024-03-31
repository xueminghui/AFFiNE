import { Component } from './component';

export abstract class Scope<Props = any> extends Component<Props> {
  get collection() {
    return this.framework.collection;
  }

  get scope() {
    return this.framework.scope;
  }

  get get() {
    return this.framework.get;
  }

  get getAll() {
    return this.framework.getAll;
  }

  get getOptional() {
    return this.framework.getOptional;
  }

  get createEntity() {
    return this.framework.createEntity;
  }

  get createScope() {
    return this.framework.createScope;
  }

  get emitEvent() {
    return this.framework.emitEvent;
  }

  override dispose(): void {
    super.dispose();
    this.framework[Symbol.dispose]();
  }
}
