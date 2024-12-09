/* eslint-disable @typescript-eslint/ban-types */
import type { DocMode } from '@blocksuite/affine/blocks';
import type { WorkspaceMetadata } from '@toeverything/infra';

export type SettingTab =
  | 'shortcuts'
  | 'appearance'
  | 'about'
  | 'plans'
  | 'billing'
  | 'experimental-features'
  | 'editor'
  | 'account'
  | `workspace:${'preference' | 'properties'}`;

export type GLOBAL_DIALOG_SCHEMA = {
  'create-workspace': (props: { serverId?: string; forcedCloud?: boolean }) => {
    metadata: WorkspaceMetadata;
    defaultDocId?: string;
  };
  'import-workspace': () => {
    workspace: WorkspaceMetadata;
  };
  'import-template': (props: {
    templateName: string;
    templateMode: DocMode;
    snapshotUrl: string;
  }) => void;
  setting: (props: {
    activeTab?: SettingTab;
    workspaceMetadata?: WorkspaceMetadata | null;
    scrollAnchor?: string;
  }) => void;
  'sign-in': (props: { server?: string; step?: string }) => void;
  'change-password': (props: { server?: string }) => void;
  'verify-email': (props: { server?: string; changeEmail?: boolean }) => void;
  'enable-cloud': (props: {
    workspaceId: string;
    openPageId?: string;
    serverId?: string;
  }) => boolean;
};

export type WORKSPACE_DIALOG_SCHEMA = {
  'doc-info': (props: { docId: string }) => void;
  'doc-selector': (props: {
    init: string[];
    onBeforeConfirm?: (ids: string[], cb: () => void) => void;
  }) => string[];
  'collection-selector': (props: {
    init: string[];
    onBeforeConfirm?: (ids: string[], cb: () => void) => void;
  }) => string[];
  'collection-editor': (props: {
    collectionId: string;
    mode?: 'page' | 'rule';
  }) => void;
  'tag-selector': (props: {
    init: string[];
    onBeforeConfirm?: (ids: string[], cb: () => void) => void;
  }) => string[];
  'date-selector': (props: {
    position: [number, number, number, number]; // [x, y, width, height]
    onSelect?: (date?: string) => void;
  }) => string;
  import: () => {
    docIds: string[];
    entryId?: string;
    isWorkspaceFile?: boolean;
  };
};