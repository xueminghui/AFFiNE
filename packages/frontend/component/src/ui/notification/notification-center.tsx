import { assignInlineVars } from '@vanilla-extract/dynamic';
import { type FC, useMemo } from 'react';
import { type ExternalToast, toast, Toaster } from 'sonner';

import { NotificationCard } from './notification-card';
import type {
  Notification,
  NotificationCenterProps,
  NotificationCustomRendererProps,
} from './types';

export function NotificationCenter({ width = 380 }: NotificationCenterProps) {
  const style = useMemo(() => {
    return assignInlineVars({
      // override css vars inside sonner
      '--width': `${width}px`,
    });
  }, [width]);

  const toastOptions = useMemo(
    () => ({
      style: {
        width: '100%',
      },
    }),
    []
  );

  return <Toaster style={style} toastOptions={toastOptions} />;
}

/**
 *
 * @returns {string} toastId
 */
export function notify(notification: Notification, options?: ExternalToast) {
  return toast.custom(id => {
    return (
      <NotificationCard
        notification={notification}
        onDismiss={() => toast.dismiss(id)}
      />
    );
  }, options);
}

notify.custom = (
  Component: FC<NotificationCustomRendererProps>,
  options?: ExternalToast
) => {
  return toast.custom(id => {
    return <Component onDismiss={() => toast.dismiss(id)} />;
  }, options);
};
