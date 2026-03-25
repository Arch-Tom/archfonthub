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
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.9),rgba(15,23,42,0.84))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-7">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.14),transparent_72%)]" />
            <div className="absolute bottom-0 left-1/2 h-44 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_72%)] blur-3xl" />
        </div>

        <div className="relative min-h-[320px]">
            {safePreviewLines.length > 0 ? (
                <div className="rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.56),rgba(30,41,59,0.4))] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Composition Canvas
                            </div>
                            <p className="mt-1 text-sm text-slate-300">
                                Pick a line to make it the active editing target.
                            </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                            {safePreviewLines.length} lines
                        </span>
                    </div>

                    <div className="mx-auto w-full max-w-[min(100%,58rem)] space-y-2.5">
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
                                    className={`group relative block w-full overflow-hidden rounded-[1.1rem] border text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                                        isSelected
                                            ? 'border-sky-400/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(37,99,235,0.08),rgba(99,102,241,0.1))] shadow-[0_18px_30px_-26px_rgba(56,189,248,0.42)]'
                                            : 'border-white/6 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <div className="relative flex items-start gap-3 px-3 py-3.5 sm:px-4">
                                        <div className="flex w-8 flex-shrink-0 justify-center pt-1">
                                            <span
                                                className={`inline-flex min-w-[1.55rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-sky-300/30 bg-slate-950/80 text-sky-200'
                                                        : 'border-white/8 bg-slate-950/60 text-slate-400 group-hover:text-slate-300'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                {line.fontName ? (
                                                    <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                                        {line.fontName}
                                                    </span>
                                                ) : null}

                                                {isSelected ? (
                                                    <span className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                                                        Active line
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div
                                                className={`relative rounded-[0.95rem] px-3 py-3 transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-slate-950/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                                        : 'bg-black/10 group-hover:bg-black/15'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div
                                                        className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,#7dd3fc,#2563eb,#6366f1)]"
                                                        aria-hidden="true"
                                                    />
                                                )}

                                                <p
                                                    className={`max-w-full break-words whitespace-pre-wrap text-white transition-all duration-200 ${
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
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                    <div className="max-w-md">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                            Composition canvas
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-400">
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
