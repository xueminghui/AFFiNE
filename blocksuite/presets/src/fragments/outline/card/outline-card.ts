import { ShadowlessElement } from '@blocksuite/block-std';
import {
  createButtonPopper,
  type NoteBlockModel,
  NoteDisplayMode,
  on,
  once,
} from '@blocksuite/blocks';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/utils';
import type { BlockModel } from '@blocksuite/store';
import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { HiddenIcon, SmallArrowDownIcon } from '../../_common/icons';
import type { SelectEvent } from '../utils/custom-events';
import * as styles from './outline-card.css';

export const AFFINE_OUTLINE_NOTE_CARD = 'affine-outline-note-card';

export class OutlineNoteCard extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  private _displayModePopper: ReturnType<typeof createButtonPopper> | null =
    null;

  private _dispatchClickBlockEvent(block: BlockModel) {
    const event = new CustomEvent('clickblock', {
      detail: {
        blockId: block.id,
      },
    });

    this.dispatchEvent(event);
  }

  private _dispatchDisplayModeChangeEvent(
    note: NoteBlockModel,
    newMode: NoteDisplayMode
  ) {
    const event = new CustomEvent('displaymodechange', {
      detail: {
        note,
        newMode,
      },
    });

    this.dispatchEvent(event);
  }

  private _dispatchDragEvent(e: MouseEvent) {
    e.preventDefault();
    if (e.button !== 0 || !this.enableNotesSorting) return;

    const { clientX: startX, clientY: startY } = e;
    const disposeDragStart = on(this.ownerDocument, 'mousemove', e => {
      if (
        Math.abs(startX - e.clientX) < 5 &&
        Math.abs(startY - e.clientY) < 5
      ) {
        return;
      }
      if (this.status !== 'selected') {
        this._dispatchSelectEvent(e);
      }

      const event = new CustomEvent('drag');

      this.dispatchEvent(event);
      disposeDragStart();
    });

    once(this.ownerDocument, 'mouseup', () => {
      disposeDragStart();
    });
  }

  private _dispatchFitViewEvent(e: MouseEvent) {
    e.stopPropagation();

    const event = new CustomEvent('fitview', {
      detail: {
        block: this.note,
      },
    });

    this.dispatchEvent(event);
  }

  private _dispatchSelectEvent(e: MouseEvent) {
    e.stopPropagation();
    const event = new CustomEvent('select', {
      detail: {
        id: this.note.id,
        selected: this.status !== 'selected',
        number: this.number,
        multiselect: e.shiftKey,
      },
    }) as SelectEvent;

    this.dispatchEvent(event);
  }

  private _getCurrentModeLabel(mode: NoteDisplayMode) {
    switch (mode) {
      case NoteDisplayMode.DocAndEdgeless:
        return 'Both';
      case NoteDisplayMode.EdgelessOnly:
        return 'Edgeless';
      case NoteDisplayMode.DocOnly:
        return 'Page';
      default:
        return 'Both';
    }
  }

  get invisible() {
    return this.note.displayMode === NoteDisplayMode.EdgelessOnly;
  }

  override updated() {
    this._displayModePopper = createButtonPopper(
      this._displayModeButtonGroup,
      this._displayModePanel,
      ({ display }) => {
        this._showPopper = display === 'show';
      },
      {
        mainAxis: 0,
        crossAxis: -60,
      }
    );

    this.disposables.add(this._displayModePopper);
  }

  override render() {
    const { children, displayMode } = this.note;
    const currentMode = this._getCurrentModeLabel(displayMode);

    return html`
      <div
        data-invisible=${this.invisible}
        data-sortable=${this.enableNotesSorting}
        data-status=${this.status}
        class=${styles.outlineCard}
      >
        <div
          class=${styles.cardPreview}
          @mousedown=${this._dispatchDragEvent}
          @click=${this._dispatchSelectEvent}
          @dblclick=${this._dispatchFitViewEvent}
        >
        ${html`<div class=${styles.cardHeader}>
          ${
            this.invisible
              ? html`<span class=${styles.headerIcon}>${HiddenIcon}</span>`
              : html`<span class=${styles.headerNumber}>${this.number}</span>`
          }
          <span class=${styles.divider}></span>
          <div class=${styles.displayModeButtonGroup}>
            <span>Show in</span>
            <edgeless-tool-icon-button
              .tooltip=${this._showPopper ? '' : 'Display Mode'}
              .tipPosition=${'left-start'}
              .iconContainerPadding=${0}
              data-testid="display-mode-button"
              @click=${(e: MouseEvent) => {
                e.stopPropagation();
                this._displayModePopper?.toggle();
              }}
              @dblclick=${(e: MouseEvent) => e.stopPropagation()}
            >
              <div class=${styles.displayModeButton}>
                <span class=${styles.currentModeLabel}>${currentMode}</span>
                ${SmallArrowDownIcon}
              </div>
            </edgeless-tool-icon-button>
          </div>
          </div>
          <note-display-mode-panel
            class=${styles.modeChangePanel}
            .displayMode=${displayMode}
            .panelWidth=${220}
            .onSelect=${(newMode: NoteDisplayMode) => {
              this._dispatchDisplayModeChangeEvent(this.note, newMode);
              this._displayModePopper?.hide();
            }}
          >
          </note-display-mode-panel>
        </div>`}
          <div class=${styles.cardContent}>
            ${children.map(block => {
              return html`<affine-outline-block-preview
                .block=${block}
                .className=${this.activeHeadingId === block.id ? 'active' : ''}
                .showPreviewIcon=${this.showPreviewIcon}
                .disabledIcon=${this.invisible}
                .cardNumber=${this.number}
                .enableNotesSorting=${this.enableNotesSorting}
                @click=${() => {
                  if (this.invisible) return;
                  this._dispatchClickBlockEvent(block);
                }}
              ></affine-outline-block-preview>`;
            })}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  @query(`.${styles.displayModeButtonGroup}`)
  private accessor _displayModeButtonGroup!: HTMLDivElement;

  @query('note-display-mode-panel')
  private accessor _displayModePanel!: HTMLDivElement;

  @state()
  private accessor _showPopper = false;

  @property({ attribute: false })
  accessor activeHeadingId: string | null = null;

  @property({ attribute: false })
  accessor enableNotesSorting!: boolean;

  @property({ attribute: false })
  accessor index!: number;

  @property({ attribute: false })
  accessor note!: NoteBlockModel;

  @property({ attribute: false })
  accessor number!: number;

  @property({ attribute: false })
  accessor showPreviewIcon!: boolean;

  @property({ attribute: false })
  accessor status: 'selected' | 'placeholder' | 'normal' = 'normal';
}

declare global {
  interface HTMLElementTagNameMap {
    [AFFINE_OUTLINE_NOTE_CARD]: OutlineNoteCard;
  }
}
