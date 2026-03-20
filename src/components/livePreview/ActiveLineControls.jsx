import React from 'react';
import AlignmentControl from './AlignmentControl';
import PreviewRangeControl from './PreviewRangeControl';
import { formatStyleLabel } from './utils';

const ActiveLineControls = ({
    activeLineFontSize,
    activePreviewLine,
    activeStyleKeys,
    AlignIcon,
    handleLineFontSizeOverrideChange,
    handleLineSpacingChange,
    handleLineStyleChange,
    isUsingDefaultLineSize,
    lineSpacing,
    setTextAlign,
    textAlign,
}) => {
    if (!activePreviewLine) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-[38rem]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Focus Controls
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                            Editing line {activePreviewLine.lineIndex + 1}
                        </h3>

                        <span className="inline-flex items-center rounded-full border border-blue-100/80 bg-blue-50/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                            Active line
                        </span>
                    </div>

                    <p className="mt-1.5 max-w-[34rem] text-sm leading-6 text-slate-500">
                        Refine the selected line’s style, size, spacing, and alignment. Font
                        assignment happens in the shared font area below so the layout stays
                        consistent between modes.
                    </p>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <div className="rounded-[0.9rem] border border-slate-200/75 bg-white/88 p-1 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]">
                        <AlignmentControl
                            textAlign={textAlign}
                            setTextAlign={setTextAlign}
                            AlignIcon={AlignIcon}
                            keyPrefix="mixing-inline-"
                        />
                    </div>
                </div>
            </div>

            {activeStyleKeys.length > 0 && (
                <div>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Style
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {activeStyleKeys.map((styleKey) => {
                            const isActiveStyle = activePreviewLine.styleKey === styleKey;

                            return (
                                <button
                                    key={styleKey}
                                    type="button"
                                    onClick={() =>
                                        handleLineStyleChange(
                                            activePreviewLine.lineIndex,
                                            styleKey
                                        )
                                    }
                                    aria-pressed={isActiveStyle}
                                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                                        isActiveStyle
                                            ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.42)]'
                                            : 'border-slate-200/90 bg-white/92 text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {formatStyleLabel(styleKey)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid gap-3 lg:grid-cols-2">
                <PreviewRangeControl
                    id={`mixing-size-${activePreviewLine.lineIndex}`}
                    label="Size"
                    value={activeLineFontSize}
                    min={12}
                    max={160}
                    step={1}
                    onChange={(e) =>
                        handleLineFontSizeOverrideChange(
                            activePreviewLine.lineIndex,
                            e.target.value
                        )
                    }
                    showNumberInput
                    numberInputAriaLabel={`Size for line ${activePreviewLine.lineIndex + 1}`}
                    secondaryAction={
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
                                    : 'border border-slate-200/90 bg-white/95 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            Use default
                        </button>
                    }
                />

                <PreviewRangeControl
                    id="mixing-spacing"
                    label="Spacing"
                    value={lineSpacing}
                    min={0.05}
                    max={3}
                    step={0.05}
                    onChange={handleLineSpacingChange}
                    formatValue={(value) => Number(value).toFixed(1)}
                />
            </div>
        </div>
    );
};

export default ActiveLineControls;