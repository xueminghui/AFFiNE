import type { FrameworkLayer } from '../framework';
import { createScope } from '../framework';
import { WorkspaceScope } from '../workspace';

export const PageScope: FrameworkLayer = createScope('page', WorkspaceScope);
