import React from 'react';
import AlignmentControl from './AlignmentControl';
import PreviewRangeControl from './PreviewRangeControl';

const PreviewLayoutControls = ({
  activeLineFontSize,
  activePreviewLine,
  AlignIcon,
  fontSize,
  handleFontSizeChange,
  handleLineFontSizeOverrideChange,
  handleLineSpacingChange,
  isFontMixingMode,
  isUsingDefaultLineSize,
  lineSpacing,
  setTextAlign,
  textAlign,
}) => {
  const controlLabel = isFontMixingMode ? 'Line controls' : 'Preview controls';
  const controlTitle = isFontMixingMode
    ? activePreviewLine
      ? `Editing line ${activePreviewLine.lineIndex + 1}`
      : 'Select a line to edit'
    : 'Adjust the standard preview';

  const controlDescription = isFontMixingMode
    ? activePreviewLine
      ? 'These controls apply to the selected line.'
      : 'Choose a line below to unlock line-specific controls.'
    : 'These controls apply across the full standard specimen view.';

  return (
    <div className="rounded-[1.45rem] border border-[rgba(182,138,82,0.16)] bg-[linear-gradient(180deg,rgba(24,29,35,0.985),rgba(34,41,49,0.965))] p-4 text-white shadow-[0_24px_50px_-34px_rgba(17,21,26,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-[34rem]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(247,236,218,0.72)]">
            {controlLabel}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold tracking-tight text-white">{controlTitle}</h3>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                isFontMixingMode
                  ? 'border-[rgba(182,138,82,0.22)] bg-[rgba(245,236,223,0.1)] text-[rgba(247,236,218,0.92)]'
                  : 'border-white/12 bg-white/10 text-stone-100/82'
              }`}
            >
              {isFontMixingMode
                ? activePreviewLine
                  ? 'Active line'
                  : 'Waiting for selection'
                : 'Visible in all specimens'}
            </span>
          </div>
          <p className="mt-2 max-w-[32rem] text-sm leading-6 text-stone-100/76">
            {controlDescription}
          </p>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-2 xl:w-auto xl:min-w-[46rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <PreviewRangeControl
            id={isFontMixingMode ? 'mixing-size-shared' : 'standard-size-shared'}
            label={isFontMixingMode ? 'Line Size' : 'Preview Size'}
            value={isFontMixingMode ? activeLineFontSize : fontSize}
            min={isFontMixingMode ? 12 : 18}
            max={isFontMixingMode ? 160 : 88}
            step={1}
            onChange={
              isFontMixingMode
                ? (e) =>
                    activePreviewLine &&
                    handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, e.target.value)
                : handleFontSizeChange
            }
            showNumberInput
            numberInputAriaLabel={
              isFontMixingMode && activePreviewLine
                ? `Size for line ${activePreviewLine.lineIndex + 1}`
                : 'Preview size'
            }
            disabled={isFontMixingMode && !activePreviewLine}
            secondaryAction={
              isFontMixingMode ? (
                <button
                  type="button"
                  onClick={() =>
                    activePreviewLine &&
                    handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, null)
                  }
                  disabled={!activePreviewLine || isUsingDefaultLineSize}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    !activePreviewLine || isUsingDefaultLineSize
                      ? 'cursor-default bg-white/10 text-stone-300/38'
                      : 'border border-[rgba(182,138,82,0.2)] bg-[rgba(245,236,223,0.1)] text-[rgba(247,236,218,0.92)] hover:bg-[rgba(245,236,223,0.18)] hover:text-white'
                  }`}
                >
                  Use default
                </button>
              ) : null
            }
          />

          <PreviewRangeControl
            id={isFontMixingMode ? 'mixing-spacing-shared' : 'standard-spacing-shared'}
            label="Line Spacing"
            value={lineSpacing}
            min={isFontMixingMode ? 0.05 : 0.8}
            max={3}
            step={0.05}
            onChange={handleLineSpacingChange}
            formatValue={(value) => Number(value).toFixed(1)}
          />

          <div className="flex justify-start md:col-span-2 xl:col-span-1 xl:justify-end">
            <AlignmentControl
              textAlign={textAlign}
              setTextAlign={setTextAlign}
              AlignIcon={AlignIcon}
              keyPrefix={isFontMixingMode ? 'mixing-shared-' : 'standard-shared-'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewLayoutControls;
