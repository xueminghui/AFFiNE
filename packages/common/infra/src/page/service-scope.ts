import type { FrameworkLayer } from '../di';
import { createScope } from '../di';
import { WorkspaceScope } from '../workspace';

export const PageScope: FrameworkLayer = createScope('page', WorkspaceScope);
