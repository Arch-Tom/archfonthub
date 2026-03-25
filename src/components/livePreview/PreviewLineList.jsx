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
    <div className="relative overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white px-4 py-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.12)] sm:px-5 sm:py-6">
        <div className="relative min-h-[300px]">
            {safePreviewLines.length > 0 ? (
                <div className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-5 sm:px-5 sm:py-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Composition Canvas
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                                Pick a line to make it the active editing target.
                            </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
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
                                    className={`group relative block w-full overflow-hidden rounded-[1rem] border text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                                        isSelected
                                            ? 'border-slate-900 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.28)]'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="relative flex items-start gap-3 px-3 py-3.5 sm:px-4">
                                        <div className="flex w-8 flex-shrink-0 justify-center pt-1">
                                            <span
                                                className={`inline-flex min-w-[1.55rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:text-slate-700'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                {line.fontName ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                        {line.fontName}
                                                    </span>
                                                ) : null}

                                                {isSelected ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-900 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                                                        Active line
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div
                                                className={`relative rounded-[0.9rem] border px-3 py-3 transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-slate-900/10 bg-slate-50'
                                                        : 'border-slate-200 bg-slate-50/70 group-hover:bg-slate-50'
                                                }`}
                                            >
                                                <p
                                                    className="max-w-full break-words whitespace-pre-wrap text-slate-900"
                                                    style={{
                                                        fontFamily: activeFontFamily,
                                                        fontSize: `${effectiveFontSize}px`,
                                                        lineHeight: lineSpacing,
                                                        textAlign,
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        overflowWrap: 'anywhere',
                                                        color: '#0f172a',
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
                <div className="flex min-h-[300px] items-center justify-center text-center">
                    <div className="max-w-md">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
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
