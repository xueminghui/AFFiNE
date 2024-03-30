import { SingleSelectSelectSolidIcon } from '@blocksuite/icons';
import type { StoryFn } from '@storybook/react';
import { cssVar } from '@toeverything/theme';
import type { HTMLAttributes } from 'react';

import { Button } from '../button';
import { NotificationCenter, notify } from './notification-center';
import type {
  NotificationCustomRendererProps,
  NotificationStyle,
  NotificationTheme,
} from './types';
import {
  getCardBorderColor,
  getCardColor,
  getCardForegroundColor,
} from './utils';

export default {
  title: 'UI/NotificationCenter',
};

const themes: NotificationTheme[] = ['info', 'success', 'warning', 'error'];
const styles: NotificationStyle[] = ['normal', 'information', 'alert'];

const Root = ({ children, ...attrs }: HTMLAttributes<HTMLDivElement>) => (
  <>
    <NotificationCenter />
    <div {...attrs}>{children}</div>
  </>
);
const Label = ({ children, ...attrs }: HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontWeight: 400, opacity: 0.5 }} {...attrs}>
    {children}:&nbsp;
  </span>
);

export const ThemeAndStyle: StoryFn = () => {
  return (
    <Root>
      {styles.map(style => {
        return (
          <div key={style} style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>
              <Label>style</Label>
              {style}
            </h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {themes.map(theme => {
                return (
                  <Button
                    style={{
                      backgroundColor: getCardColor(theme, style),
                      borderColor: getCardBorderColor(style),
                      color: getCardForegroundColor(style),
                    }}
                    key={theme}
                    onClick={() =>
                      notify({
                        title: `${theme} title`,
                        message: (
                          <span>
                            Test with <Label>style</Label>
                            <code>{style}</code>
                            &nbsp;and&nbsp;
                            <Label>theme</Label>
                            <code>{theme}</code>
                          </span>
                        ),
                        style,
                        theme,
                      })
                    }
                  >
                    <Label>theme</Label> {theme}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </Root>
  );
};

export const CustomIcon: StoryFn = () => {
  const icons = [
    { label: 'No icon', icon: null },
    {
      label: 'SingleSelectIcon',
      icon: <SingleSelectSelectSolidIcon />,
    },
    {
      label: 'Icon Color',
      icon: <SingleSelectSelectSolidIcon color={cssVar('successColor')} />,
    },
  ];

  return (
    <Root style={{ display: 'flex', gap: 4 }}>
      {icons.map(({ label, icon }) => (
        <Button
          key={label}
          onClick={() =>
            notify({
              title: label,
              message: 'test with custom icon ' + label,
              icon,
            })
          }
        >
          {label}
        </Button>
      ))}
    </Root>
  );
};

export const CustomRenderer: StoryFn = () => {
  const CustomRender = ({ onDismiss }: NotificationCustomRendererProps) => {
    return (
      <div
        style={{
          border: '1px solid ' + cssVar('borderColor'),
          padding: 16,
          borderRadius: 4,
          background: cssVar('white'),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        CustomRenderer
        <Button onClick={onDismiss}>Close</Button>
      </div>
    );
  };

  return (
    <Root>
      <Button onClick={() => notify.custom(CustomRender)}>
        Open CustomRenderer
      </Button>
    </Root>
  );
};
