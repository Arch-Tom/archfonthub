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
  isUsingDefaultLineSize,
  lineSpacing,
  onClearLineSelection,
  setTextAlign,
  textAlign,
}) => {
  const isLineSelected = Boolean(activePreviewLine);

  return (
    <div className="rounded-[1.3rem] border border-[rgba(148,180,193,0.14)] bg-[linear-gradient(180deg,rgba(248,250,250,0.995),rgba(240,245,246,0.975))] px-4 py-4 shadow-[0_18px_34px_-28px_rgba(17,21,26,0.1),inset_0_1px_0_rgba(255,255,255,0.82)] sm:px-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              {isLineSelected
                ? `Editing line ${activePreviewLine.lineIndex + 1}`
                : 'Editing all lines'}
            </span>

            {isLineSelected && (
              <button
                type="button"
                onClick={onClearLineSelection}
                className="rounded-full border border-[rgba(148,180,193,0.16)] bg-[rgba(236,239,202,0.68)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#213448] transition-colors hover:bg-[rgba(236,239,202,0.92)]"
              >
                Clear line selection
              </button>
            )}
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Drag a font chip onto a line to mix fonts.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center">
          <PreviewRangeControl
            id={isLineSelected ? 'selected-line-size' : 'all-lines-size'}
            label={isLineSelected ? 'Line Size' : 'Preview Size'}
            value={isLineSelected ? activeLineFontSize : fontSize}
            min={isLineSelected ? 12 : 18}
            max={isLineSelected ? 160 : 88}
            step={1}
            onChange={
              isLineSelected
                ? (event) =>
                    handleLineFontSizeOverrideChange(
                      activePreviewLine.lineIndex,
                      event.target.value
                    )
                : handleFontSizeChange
            }
            showNumberInput
            numberInputAriaLabel={
              isLineSelected
                ? `Size for line ${activePreviewLine.lineIndex + 1}`
                : 'Preview size'
            }
            secondaryAction={
              isLineSelected ? (
                <button
                  type="button"
                  onClick={() =>
                    handleLineFontSizeOverrideChange(
                      activePreviewLine.lineIndex,
                      null
                    )
                  }
                  disabled={isUsingDefaultLineSize}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isUsingDefaultLineSize
                      ? 'cursor-default bg-slate-100 text-slate-400'
                      : 'border border-[rgba(148,180,193,0.18)] bg-[rgba(236,239,202,0.64)] text-[#213448] hover:bg-[rgba(236,239,202,0.9)]'
                  }`}
                >
                  Use default
                </button>
              ) : null
            }
          />

          <PreviewRangeControl
            id="shared-line-spacing"
            label="Line Spacing"
            value={lineSpacing}
            min={0.8}
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
              keyPrefix="unified-preview-"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewLayoutControls;