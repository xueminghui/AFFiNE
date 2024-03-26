import type { FrameworkLayer } from './types';

export function stringifyLayer(scope: FrameworkLayer): string {
  return scope.join('/');
}

export interface LayerRoot {
  layer: string;
}
