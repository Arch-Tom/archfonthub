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
            ? `Line ${activePreviewLine.lineIndex + 1} layout`
            : 'Choose a line to edit'
        : 'Standard preview layout';
    const controlDescription = isFontMixingMode
        ? activePreviewLine
            ? 'Size, spacing, and alignment stay anchored here while you switch lines below.'
            : 'Select a line below to activate the line-specific size control.'
        : 'Size, spacing, and alignment stay in one place while you compare every selected font.';

    return (
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)] sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-[40rem]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {controlLabel}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                            {controlTitle}
                        </h3>

                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                isFontMixingMode
                                    ? 'border border-blue-100/80 bg-blue-50/75 text-blue-700'
                                    : 'border border-slate-200/90 bg-white/90 text-slate-600'
                            }`}
                        >
                            {isFontMixingMode
                                ? activePreviewLine
                                    ? 'Active line controls'
                                    : 'Waiting for line selection'
                                : 'Applies to every standard preview'}
                        </span>
                    </div>

                    <p className="mt-1.5 max-w-[36rem] text-sm leading-6 text-slate-500">
                        {controlDescription}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:min-w-[44rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
                    <PreviewRangeControl
                        id={isFontMixingMode ? 'mixing-size-shared' : 'standard-size-shared'}
                        label={isFontMixingMode ? 'Line Size' : 'Preview Size'}
                        value={isFontMixingMode ? activeLineFontSize : fontSize}
                        min={isFontMixingMode ? 12 : 18}
                        max={isFontMixingMode ? 160 : 72}
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
                                            ? 'cursor-default bg-slate-100 text-slate-400'
                                            : 'border border-slate-200/90 bg-white/95 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
                        <div className="rounded-[1rem] border border-slate-200/80 bg-white/90 p-1.5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.2)]">
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
        </div>
    );
};

export default PreviewLayoutControls;
