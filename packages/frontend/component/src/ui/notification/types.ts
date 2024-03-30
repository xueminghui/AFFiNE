import type { ReactNode } from 'react';

export type NotificationStyle = 'normal' | 'information' | 'alert';
export type NotificationTheme = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  style?: NotificationStyle;
  theme?: NotificationTheme;

  borderColor?: string;
  background?: string;
  foreground?: string;

  // custom slots
  title?: ReactNode;
  message?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
}

export interface NotificationCenterProps {
  width?: number;
}

export interface NotificationCustomRendererProps {
  onDismiss?: () => void;
}
