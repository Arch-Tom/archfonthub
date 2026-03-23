import React from 'react';

const renderLineText = (value) => {
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (value) return String(value);
    return ' ';
};

const PreviewLineList = ({
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    lineSpacing,
    openPreviewLineIndex,
    safePreviewLines,
    setOpenPreviewLineIndex,
    textAlign,
}) => (
    <div className="relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(247,250,252,0.92))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] sm:px-6 sm:py-7">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_72%)]" />
            <div className="absolute bottom-0 left-1/2 h-40 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.07),transparent_72%)] blur-3xl" />
        </div>

        <div className="relative min-h-[320px]">
            {safePreviewLines.length > 0 ? (
                <div className="rounded-[1.35rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,251,253,0.72))] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
                    <div className="mx-auto w-full max-w-[min(100%,58rem)]">
                        {safePreviewLines.map((line, index) => {
                            const font = getFontOptionByName(line.fontName);
                            const fallbackStyleKey = getDefaultStyleKey(line.fontName);
                            const activeFontFamily =
                                font?.styles?.[line.styleKey] ||
                                font?.styles?.[fallbackStyleKey] ||
                                'inherit';
                            const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                            const isSelected = openPreviewLineIndex === line.lineIndex;

                            return (
                                <button
                                    key={`preview-line-${line.lineIndex}`}
                                    type="button"
                                    onClick={() => setOpenPreviewLineIndex(line.lineIndex)}
                                    aria-label={`Select line ${index + 1} for editing`}
                                    aria-pressed={isSelected}
                                    className={`group relative block w-full rounded-[1rem] text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                                        isSelected ? 'bg-blue-50/45' : 'bg-transparent'
                                    }`}
                                >
                                    <div className="relative flex items-start gap-2.5 px-2 py-1.5 sm:px-3">
                                        <div className="flex w-6 flex-shrink-0 justify-center pt-1 sm:w-7">
                                            <span
                                                className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-blue-200/90 bg-white/95 text-blue-700 shadow-[0_10px_18px_-16px_rgba(37,99,235,0.35)]'
                                                        : 'border-transparent bg-transparent text-slate-300 group-hover:border-slate-200/80 group-hover:bg-white/88 group-hover:text-slate-400'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div
                                                className={`relative rounded-[0.9rem] px-2 py-1 transition-all duration-200 sm:px-3 ${
                                                    isSelected
                                                        ? 'bg-white/55 shadow-[0_10px_24px_-24px_rgba(37,99,235,0.35)]'
                                                        : 'bg-transparent group-hover:bg-white/36'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div
                                                        className="pointer-events-none absolute inset-y-1 left-0 w-[3px] rounded-full bg-blue-500/75"
                                                        aria-hidden="true"
                                                    />
                                                )}

                                                <p
                                                    className={`max-w-full break-words whitespace-pre-wrap text-slate-900 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'opacity-100'
                                                            : 'opacity-95 group-hover:opacity-100'
                                                    }`}
                                                    style={{
                                                        fontFamily: activeFontFamily,
                                                        fontSize: `${effectiveFontSize}px`,
                                                        lineHeight: lineSpacing,
                                                        textAlign,
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                    dir="auto"
                                                >
                                                    {renderLineText(line.text)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                    <div className="max-w-md">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                            Composition canvas
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                            Add text and selected fonts above to start building your mixed-font
                            preview here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export default PreviewLineList;