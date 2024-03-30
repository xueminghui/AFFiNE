import { cssVar } from '@toeverything/theme';

import type { NotificationStyle, NotificationTheme } from './types';

export const getCardColor = (
  theme: NotificationTheme,
  style: NotificationStyle
) => {
  if (style === 'information') {
    const map: Record<NotificationTheme, string> = {
      error: cssVar('backgroundErrorColor'),
      info: cssVar('backgroundProcessingColor'),
      success: cssVar('backgroundSuccessColor'),
      warning: cssVar('backgroundWarningColor'),
    };
    return map[theme];
  }

  if (style === 'alert') {
    const map: Record<NotificationTheme, string> = {
      error: cssVar('errorColor'),
      info: cssVar('processingColor'),
      success: cssVar('successColor'),
      warning: cssVar('warningColor'),
    };
    return map[theme];
  }

  return cssVar('white');
};

export const getCardBorderColor = (style: NotificationStyle) => {
  return style === 'normal' ? cssVar('borderColor') : cssVar('black10');
};

export const getCardForegroundColor = (style: NotificationStyle) => {
  return style === 'alert' ? cssVar('pureWhite') : cssVar('textPrimaryColor');
};
