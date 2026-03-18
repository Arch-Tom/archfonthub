import React from 'react';
import AlignmentControl from './AlignmentControl';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const ActiveLineControls = ({
    activeLineFontSize,
    activePreviewLine,
    activeStyleKeys,
    AlignIcon,
    handleApplyFontToActiveLine,
    handleLineFontSizeOverrideChange,
    handleLineSpacingChange,
    handleLineStyleChange,
    isUsingDefaultLineSize,
    lineSpacing,
    safeSelectedFonts,
    setTextAlign,
    textAlign,
}) => {
    if (!activePreviewLine) return null;

    return (
        <div className="rounded-[1.3rem] border border-slate-200/85 bg-white/96 p-4 shadow-[0_18px_32px_-26px_rgba(15,23,42,0.18)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Focus controls
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-950">
                        Editing line {activePreviewLine.lineIndex + 1}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Change the selected line&apos;s font, style, spacing, size, and alignment
                        before comparing the result below.
                    </p>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <AlignmentControl
                        textAlign={textAlign}
                        setTextAlign={setTextAlign}
                        AlignIcon={AlignIcon}
                        keyPrefix="mixing-inline-"
                    />
                </div>
            </div>

            <div className="grid gap-4 pt-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
                <div className="space-y-4">
                    <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Font
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {safeSelectedFonts.map((font) => {
                                const isActiveFont = activePreviewLine.fontName === font.name;

                                return (
                                    <button
                                        key={`inline-focus-font-${font.name}`}
                                        type="button"
                                        onClick={() => handleApplyFontToActiveLine(font.name)}
                                        aria-pressed={isActiveFont}
                                        className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                            isActiveFont
                                                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_22px_-18px_rgba(15,23,42,0.32)]'
                                                : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                        }`}
                                        style={{ fontFamily: getSafeFontFamilyPreview(font) }}
                                    >
                                        {font.name}
                                    </button>
                                );
                            })}
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
                                            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                isActiveStyle
                                                    ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.42)]'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {formatStyleLabel(styleKey)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Size
                            </div>

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
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                Use default
                            </button>
                        </div>

                        <div className="space-y-3 rounded-[1rem] border border-slate-200 bg-white px-3 py-3">
                            <input
                                type="range"
                                min="12"
                                max="160"
                                step="1"
                                value={activeLineFontSize}
                                onChange={(e) =>
                                    handleLineFontSizeOverrideChange(
                                        activePreviewLine.lineIndex,
                                        e.target.value
                                    )
                                }
                                className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                                aria-label={`Adjust size for line ${activePreviewLine.lineIndex + 1}`}
                            />

                            <div className="flex justify-end">
                                <input
                                    type="number"
                                    min="12"
                                    step="1"
                                    value={activeLineFontSize}
                                    onChange={(e) =>
                                        handleLineFontSizeOverrideChange(
                                            activePreviewLine.lineIndex,
                                            e.target.value
                                        )
                                    }
                                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:outline-none"
                                    aria-label={`Size for line ${activePreviewLine.lineIndex + 1}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Spacing
                            </div>

                            <span className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                                {Number(lineSpacing).toFixed(1)}
                            </span>
                        </div>

                        <div className="rounded-[1rem] border border-slate-200 bg-white px-3 py-3">
                            <input
                                id="inlineLineSpacingSlider"
                                type="range"
                                min="0.05"
                                max="3"
                                step="0.05"
                                value={lineSpacing}
                                onChange={handleLineSpacingChange}
                                className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                                aria-label="Adjust line spacing"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveLineControls;
