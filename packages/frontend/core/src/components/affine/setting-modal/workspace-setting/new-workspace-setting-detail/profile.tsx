import { FlexWrapper, Input, notify, Wrapper } from '@affine/component';
import { Avatar } from '@affine/component/ui/avatar';
import { Button } from '@affine/component/ui/button';
import { Upload } from '@affine/core/components/pure/file-upload';
import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import { useWorkspaceBlobObjectUrl } from '@affine/core/hooks/use-workspace-blob';
import { validateAndReduceImage } from '@affine/core/utils/reduce-image';
import { UNTITLED_WORKSPACE_NAME } from '@affine/env/constant';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { CameraIcon } from '@blocksuite/icons';
import type { Workspace } from '@toeverything/infra';
import { useLiveData } from '@toeverything/infra';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import * as style from './style.css';
import type { WorkspaceSettingDetailProps } from './types';

export interface ProfilePanelProps extends WorkspaceSettingDetailProps {
  workspace: Workspace | null;
}

export const ProfilePanel = ({ isOwner, workspace }: ProfilePanelProps) => {
  const t = useAFFiNEI18N();

  const workspaceIsReady = useLiveData(workspace?.engine.rootDocState$)?.ready;

  const [avatarBlob, setAvatarBlob] = useState<string | null>(null);
  const [name, setName] = useState('');

  const avatarUrl = useWorkspaceBlobObjectUrl(workspace?.meta, avatarBlob);

  useEffect(() => {
    if (workspace?.docCollection) {
      setAvatarBlob(workspace.docCollection.meta.avatar ?? null);
      setName(workspace.docCollection.meta.name ?? UNTITLED_WORKSPACE_NAME);
      const dispose = workspace.docCollection.meta.commonFieldsUpdated.on(
        () => {
          setAvatarBlob(workspace.docCollection.meta.avatar ?? null);
          setName(workspace.docCollection.meta.name ?? UNTITLED_WORKSPACE_NAME);
        }
      );
      return () => {
        dispose.dispose();
      };
    } else {
      setAvatarBlob(null);
      setName(UNTITLED_WORKSPACE_NAME);
    }
    return;
  }, [workspace]);

  const setWorkspaceAvatar = useCallback(
    async (file: File | null) => {
      if (!workspace) {
        return;
      }
      if (!file) {
        workspace.docCollection.meta.setAvatar('');
        return;
      }
      try {
        const reducedFile = await validateAndReduceImage(file);
        const blobs = workspace.docCollection.blob;
        const blobId = await blobs.set(reducedFile);
        workspace.docCollection.meta.setAvatar(blobId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [workspace]
  );

  const setWorkspaceName = useCallback(
    (name: string) => {
      if (!workspace) {
        return;
      }
      workspace.docCollection.meta.setName(name);
    },
    [workspace]
  );

  const [input, setInput] = useState<string>('');
  useEffect(() => {
    setInput(name);
  }, [name]);

  const handleUpdateWorkspaceName = useCallback(
    (name: string) => {
      setWorkspaceName(name);
      notify.success({ title: t['Update workspace name success']() });
    },
    [setWorkspaceName, t]
  );

  const handleSetInput = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.code === 'Enter' && name !== input) {
        handleUpdateWorkspaceName(input);
      }
    },
    [handleUpdateWorkspaceName, input, name]
  );

  const handleClick = useCallback(() => {
    handleUpdateWorkspaceName(input);
  }, [handleUpdateWorkspaceName, input]);

  const handleRemoveUserAvatar = useAsyncCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      await setWorkspaceAvatar(null);
    },
    [setWorkspaceAvatar]
  );

  const handleUploadAvatar = useCallback(
    (file: File) => {
      setWorkspaceAvatar(file)
        .then(() => {
          notify.success({ title: 'Update workspace avatar success' });
        })
        .catch(error => {
          notify.error({
            title: 'Update workspace avatar failed',
            message: error,
          });
        });
    },
    [setWorkspaceAvatar]
  );

  const canAdjustAvatar = workspaceIsReady && avatarUrl && isOwner;

  return (
    <div className={style.profileWrapper}>
      <Upload
        accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
        fileChange={handleUploadAvatar}
        data-testid="upload-avatar"
        disabled={!isOwner}
      >
        <Avatar
          size={56}
          url={avatarUrl}
          name={name}
          colorfulFallback
          hoverIcon={isOwner ? <CameraIcon /> : undefined}
          onRemove={canAdjustAvatar ? handleRemoveUserAvatar : undefined}
          avatarTooltipOptions={
            canAdjustAvatar
              ? { content: t['Click to replace photo']() }
              : undefined
          }
          removeTooltipOptions={
            canAdjustAvatar ? { content: t['Remove photo']() } : undefined
          }
          data-testid="workspace-setting-avatar"
          removeButtonProps={{
            ['data-testid' as string]: 'workspace-setting-remove-avatar-button',
          }}
        />
      </Upload>

      <Wrapper marginLeft={20}>
        <div className={style.label}>{t['Workspace Name']()}</div>
        <FlexWrapper alignItems="center" flexGrow="1">
          <Input
            disabled={!workspaceIsReady || !isOwner}
            value={input}
            style={{ width: 280, height: 32 }}
            data-testid="workspace-name-input"
            placeholder={t['Workspace Name']()}
            maxLength={64}
            minLength={0}
            onChange={handleSetInput}
            onKeyUp={handleKeyUp}
          />
          {input === name ? null : (
            <Button
              data-testid="save-workspace-name"
              onClick={handleClick}
              style={{
                marginLeft: '12px',
              }}
            >
              {t['com.affine.editCollection.save']()}
            </Button>
          )}
        </FlexWrapper>
      </Wrapper>
    </div>
  );
};
