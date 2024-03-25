import { ROOT_SCOPE } from './consts';
import type { FrameworkLayer } from './types';

export function createScope(
  name: string,
  base: FrameworkLayer = ROOT_SCOPE
): FrameworkLayer {
  return [...base, name];
}

export function stringifyLayer(scope: FrameworkLayer): string {
  return scope.join('/');
}
