import { useState } from 'react';
import { MAX_SIDE_MARGIN, SIDE_MARGIN_STEPS, contentWidth } from '../../lib/sideMargin';
import { useScreenWidth, useSideMargin } from '../hooks/useSideMargin';
import { useT } from '../hooks/useTranslation';

/** The modal's own side margins, in % of the screen, whatever the setting is. */
const MODAL_SIDE_MARGIN = 20;

/** Global setting for the empty space on each side of the content. Applied live while
 *  the slider moves, so the effect is visible behind the modal; Cancel puts it back. */
export function SideMarginModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [margin, setMargin] = useSideMargin();
  const [original] = useState(margin);
  // Always as wide as the content would be with 20% margins, whatever the chosen
  // ones: the same share of the screen, kept as the window narrows until it takes the
  // whole window. Not the live content width, which would resize the modal under the
  // pointer while the slider moves.
  const width = contentWidth(MODAL_SIDE_MARGIN, useScreenWidth());
  // The slider moves through the steps' positions, since they aren't evenly spaced.
  const stepIndex = Math.max(0, SIDE_MARGIN_STEPS.indexOf(margin));

  function handleCancel() {
    setMargin(original);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal side-margin-modal" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <h2>{t.sideMargin.title}</h2>
        <p>{t.sideMargin.description}</p>
        <label className="side-margin-slider">
          {/* Always as wide as the longest label, so the slider beside it never shifts. */}
          <span className="side-margin-value">
            <span aria-hidden="true" className="side-margin-value-sizer">
              {t.sideMargin.label(MAX_SIDE_MARGIN)}
            </span>
            <span>{t.sideMargin.label(margin)}</span>
          </span>
          {/* Each step's value, above the point on the track where the thumb stops for it. */}
          <span className="side-margin-ticks" aria-hidden="true">
            {SIDE_MARGIN_STEPS.map((step, i) => (
              <span
                key={step}
                className={`side-margin-tick${step === margin ? ' active' : ''}`}
                style={{ insetInlineStart: `${(i / (SIDE_MARGIN_STEPS.length - 1)) * 100}%` }}
              >
                <span>{step}%</span>
              </span>
            ))}
          </span>
          <input
            type="range"
            min={0}
            max={SIDE_MARGIN_STEPS.length - 1}
            step={1}
            value={stepIndex}
            aria-valuetext={t.sideMargin.label(margin)}
            onChange={(e) => setMargin(SIDE_MARGIN_STEPS[Number(e.target.value)])}
          />
        </label>
        <div className="modal-actions">
          <button className="secondary" onClick={handleCancel}>
            {t.common.cancel}
          </button>
          <button onClick={onClose}>{t.common.save}</button>
        </div>
      </div>
    </div>
  );
}
