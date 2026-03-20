import React from 'react';
import AlignmentControl from './AlignmentControl';
import PreviewRangeControl from './PreviewRangeControl';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const StandardPreviewPanel = ({
    AlignIcon,
    fontSize,
    getDefaultStyleKey,
    getSortedStyleKeys,
    lineSpacing,
    onFontSizeChange,
    onLineSpacingChange,
    safeSelectedFonts,
    setTextAlign,
    setStandardPreviewStyleMap,
    standardPreviewLines,
    standardPreviewStyleMap,
    textAlign,
}) => (
    <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-[36rem]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Standard Preview
                        </div>
                        <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                            Compare your selected fonts side by side
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                            Keep the layout stable while you compare tone, readability, and style
                            before switching into font mixing.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.18)]">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Browse and compare selected fonts
                    </div>
                </div>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="grid gap-4 md:grid-cols-2 xl:flex-1">
                        <PreviewRangeControl
                            id="standard-size"
                            label="Preview Size"
                            value={fontSize}
                            min={18}
                            max={72}
                            step={1}
                            onChange={onFontSizeChange}
                            showNumberInput
                            numberInputAriaLabel="Preview size"
                        />

                        <PreviewRangeControl
                            id="standard-spacing"
                            label="Line Spacing"
                            value={lineSpacing}
                            min={0.8}
                            max={3}
                            step={0.05}
                            onChange={onLineSpacingChange}
                            formatValue={(value) => Number(value).toFixed(1)}
                        />
                    </div>

                    <div className="flex justify-start xl:justify-end">
                        <div className="rounded-[1rem] border border-slate-200/80 bg-white/90 p-1.5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.2)]">
                            <AlignmentControl
                                textAlign={textAlign}
                                setTextAlign={setTextAlign}
                                AlignIcon={AlignIcon}
                                keyPrefix="standard-"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
                {safeSelectedFonts.length > 0 ? (
                    <div className="space-y-5">
                        {safeSelectedFonts.map((font) => {
                            const fallbackFontFamily = getSafeFontFamilyPreview(font);
                            const styleKeys = getSortedStyleKeys(font.styles || {});
                            const displayStyleKeys = styleKeys.length > 0 ? styleKeys : ['regular'];
                            const selectedStyleKey =
                                standardPreviewStyleMap[font.name] ||
                                getDefaultStyleKey(font.name) ||
                                displayStyleKeys[0];
                            const activeStandardFontFamily =
                                font?.styles?.[selectedStyleKey] || fallbackFontFamily;
                            const standardPreviewFontSize = Math.min(fontSize, 72);

                            return (
                                <section
                                    key={`standard-preview-${font.name}`}
                                    className="rounded-[1.35rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.14)] sm:p-5"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <div
                                                    className="inline-flex rounded-full border border-slate-800/90 bg-slate-800 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_22px_-18px_rgba(15,23,42,0.4)]"
                                                    style={{ fontFamily: activeStandardFontFamily }}
                                                >
                                                    {font.name}
                                                </div>

                                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Styles
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {displayStyleKeys.map((styleKey) => {
                                                    const isActiveStyle = styleKey === selectedStyleKey;

                                                    return (
                                                        <button
                                                            key={`${font.name}-${styleKey}`}
                                                            type="button"
                                                            onClick={() =>
                                                                setStandardPreviewStyleMap((current) => ({
                                                                    ...current,
                                                                    [font.name]: styleKey,
                                                                }))
                                                            }
                                                            aria-pressed={isActiveStyle}
                                                            className={`inline-flex rounded-[0.85rem] border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                                isActiveStyle
                                                                    ? 'border-slate-800 bg-slate-800 text-white shadow-[0_10px_22px_-18px_rgba(15,23,42,0.28)]'
                                                                    : 'border-slate-300/90 bg-white/92 text-slate-600 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            {formatStyleLabel(styleKey)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="rounded-[1.1rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,251,253,0.9))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-5 sm:py-5">
                                            {standardPreviewLines.length > 0 ? (
                                                <div
                                                    className="max-w-[min(100%,38rem)] break-words whitespace-pre-wrap text-slate-900"
                                                    style={{
                                                        fontFamily: activeStandardFontFamily,
                                                        fontSize: `${standardPreviewFontSize}px`,
                                                        lineHeight: Math.max(lineSpacing, 0.9),
                                                        textAlign,
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                    dir="auto"
                                                >
                                                    {standardPreviewLines.join('\n')}
                                                </div>
                                            ) : (
                                                <div className="max-w-sm text-sm leading-6 text-slate-400">
                                                    Enter text above to preview it in {font.name}.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex min-h-[240px] items-center justify-center text-center">
                        <div className="max-w-xs text-sm leading-6 text-slate-400">
                            Select fonts and enter text above to compare them here.
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default StandardPreviewPanel;