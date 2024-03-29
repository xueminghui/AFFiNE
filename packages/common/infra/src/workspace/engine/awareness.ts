import { createIdentifier } from '../../framework';

export interface AwarenessProvider {
  connect(): void;
  disconnect(): void;
}

export const AwarenessProvider =
  createIdentifier<AwarenessProvider>('AwarenessProvider');

export class AwarenessEngine {
  constructor(public readonly providers: AwarenessProvider[]) {}

  connect() {
    this.providers.forEach(provider => provider.connect());
  }

  disconnect() {
    this.providers.forEach(provider => provider.disconnect());
  }
}
