import React from 'react';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const StandardPreviewPanel = ({
    fontSize,
    getDefaultStyleKey,
    getSortedStyleKeys,
    lineSpacing,
    safeSelectedFonts,
    setStandardPreviewStyleMap,
    standardPreviewLines,
    standardPreviewStyleMap,
}) => (
    <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)] sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Standard Preview
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                        Compare your selected fonts
                    </div>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                    This keeps the live-site comparison style front and center, while Font Mixing
                    stays available as the custom composition view.
                </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
                {safeSelectedFonts.length > 0 ? (
                    <div className="space-y-8">
                        {safeSelectedFonts.map((font, fontIndex) => {
                            const fallbackFontFamily = getSafeFontFamilyPreview(font);
                            const styleKeys = getSortedStyleKeys(font.styles || {});
                            const displayStyleKeys = styleKeys.length > 0 ? styleKeys : ['regular'];
                            const selectedStyleKey =
                                standardPreviewStyleMap[font.name] ||
                                getDefaultStyleKey(font.name) ||
                                displayStyleKeys[0];
                            const activeStandardFontFamily =
                                font?.styles?.[selectedStyleKey] || fallbackFontFamily;
                            const standardPreviewFontSize = Math.min(fontSize, 56);

                            return (
                                <div
                                    key={`standard-preview-${font.name}`}
                                    className={`space-y-4 ${
                                        fontIndex !== safeSelectedFonts.length - 1
                                            ? 'border-b border-slate-200/75 pb-8'
                                            : ''
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div
                                            className="inline-flex rounded-full bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.4)]"
                                            style={{ fontFamily: activeStandardFontFamily }}
                                        >
                                            {font.name}
                                        </div>

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
                                                    className={`inline-flex rounded-[0.8rem] border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                        isActiveStyle
                                                            ? 'border-slate-700 bg-slate-700 text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.28)]'
                                                            : 'border-slate-300 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {formatStyleLabel(styleKey)}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="rounded-[1.15rem] bg-transparent px-1 py-1">
                                        {standardPreviewLines.length > 0 ? (
                                            <div
                                                className="max-w-[min(100%,34rem)] break-words whitespace-pre-wrap text-slate-900"
                                                style={{
                                                    fontFamily: activeStandardFontFamily,
                                                    fontSize: `${standardPreviewFontSize}px`,
                                                    lineHeight: Math.max(lineSpacing, 0.9),
                                                    textAlign: 'left',
                                                    overflowWrap: 'anywhere',
                                                }}
                                                dir="auto"
                                            >
                                                {standardPreviewLines.join('\n')}
                                            </div>
                                        ) : (
                                            <div className="max-w-xs text-sm leading-6 text-slate-400">
                                                Enter text above to preview it in {font.name}.
                                            </div>
                                        )}
                                    </div>
                                </div>
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
