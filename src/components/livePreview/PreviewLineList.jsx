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
    <div className="relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(247,250,252,0.92))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_72%)]" />
            <div className="absolute bottom-0 left-1/2 h-40 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.07),transparent_72%)] blur-3xl" />
        </div>

        <div className="relative min-h-[360px]">
            {safePreviewLines.length > 0 ? (
                <div className="space-y-2.5">
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
                                className={`group block w-full rounded-[1.15rem] text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                                    isSelected
                                        ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.93),rgba(249,251,253,0.88))] shadow-[0_18px_30px_-28px_rgba(37,99,235,0.16)] ring-1 ring-slate-200/80'
                                        : 'bg-transparent hover:bg-white/50'
                                }`}
                            >
                                <div className="relative px-3 py-4 sm:px-4 sm:py-4.5">
                                    <div className="relative mx-auto flex w-full max-w-[min(100%,58rem)] items-start gap-3 sm:gap-4">
                                        <div className="flex w-7 flex-shrink-0 justify-center pt-1 sm:w-8">
                                            <span
                                                className={`inline-flex min-w-[1.45rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold shadow-sm transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-slate-200/90 bg-white/95 text-blue-700 shadow-[0_8px_18px_-16px_rgba(37,99,235,0.28)]'
                                                        : 'border-slate-200/80 bg-white/88 text-slate-400 group-hover:border-slate-300/90 group-hover:text-slate-500'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div
                                                className={`rounded-[0.95rem] px-2 py-1.5 transition-all duration-200 sm:px-3 sm:py-2 ${
                                                    isSelected
                                                        ? 'bg-white/42'
                                                        : 'bg-transparent group-hover:bg-white/32'
                                                }`}
                                            >
                                                <p
                                                    className={`max-w-full break-words whitespace-pre-wrap text-slate-900 transition-all duration-200 ${
                                                        isSelected
                                                            ? 'opacity-100'
                                                            : 'opacity-90 group-hover:opacity-100'
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
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex min-h-[360px] items-center justify-center text-center">
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