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
    const controlLabel = isFontMixingMode ? 'Focused Layout Controls' : 'Layout Controls';
    const controlTitle = isFontMixingMode
        ? activePreviewLine
            ? `Line ${activePreviewLine.lineIndex + 1} controls`
            : 'Choose a line to edit'
        : 'Standard preview controls';

    const controlDescription = isFontMixingMode
        ? activePreviewLine
            ? 'Tune the active line without throwing off the overall composition.'
            : 'Select a line below to unlock line-specific controls.'
        : 'Adjust the specimen view once, then compare every selected font in the same layout.';

    return (
        <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,28,0.98),rgba(18,25,40,0.95)_56%,rgba(14,20,33,0.96))] p-5 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.8)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-[40rem]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                        {controlLabel}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl font-semibold tracking-tight text-white">
                            {controlTitle}
                        </h3>

                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                isFontMixingMode
                                    ? 'border border-sky-400/20 bg-sky-400/10 text-sky-200'
                                    : 'border border-white/10 bg-white/[0.05] text-slate-200'
                            }`}
                        >
                            {isFontMixingMode
                                ? activePreviewLine
                                    ? 'Active line'
                                    : 'Waiting for selection'
                                : 'Applies to all standard previews'}
                        </span>
                    </div>

                    <p className="mt-2 max-w-[36rem] text-sm leading-6 text-slate-300">
                        {controlDescription}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:min-w-[46rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
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
                                      handleLineFontSizeOverrideChange(
                                          activePreviewLine.lineIndex,
                                          e.target.value
                                      )
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
                                        handleLineFontSizeOverrideChange(
                                            activePreviewLine.lineIndex,
                                            null
                                        )
                                    }
                                    disabled={!activePreviewLine || isUsingDefaultLineSize}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                        !activePreviewLine || isUsingDefaultLineSize
                                            ? 'cursor-default bg-slate-800 text-slate-500'
                                            : 'border border-white/10 bg-slate-950/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900'
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
