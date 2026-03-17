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
    <div className="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-8">
        <div className="min-h-[360px]">
            {safePreviewLines.map((line, index) => {
                const font = getFontOptionByName(line.fontName);
                const fallbackStyleKey = getDefaultStyleKey(line.fontName);
                const activeFontFamily =
                    font?.styles?.[line.styleKey] || font?.styles?.[fallbackStyleKey] || 'inherit';
                const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                const isSelected = openPreviewLineIndex === line.lineIndex;

                return (
                    <button
                        key={`preview-line-${line.lineIndex}`}
                        type="button"
                        onClick={() => setOpenPreviewLineIndex(line.lineIndex)}
                        aria-label={`Select line ${index + 1} for editing`}
                        aria-pressed={isSelected}
                        className="group block w-full rounded-[0.85rem] bg-transparent text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    >
                        <div className="relative px-3 py-3 sm:px-4 sm:py-3.5">
                            <span
                                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${
                                    isSelected
                                        ? 'border-blue-200/90 bg-white text-blue-700 shadow-[0_10px_20px_-16px_rgba(37,99,235,0.45)]'
                                        : 'border-slate-200 bg-white text-slate-400 opacity-0 group-hover:opacity-100'
                                }`}
                                aria-hidden="true"
                            >
                                {index + 1}
                            </span>

                            <div className="relative mx-auto w-full max-w-[min(100%,56rem)] px-8 sm:px-10">
                                <p
                                    className={`max-w-full break-words whitespace-pre-wrap text-slate-900 ${
                                        isSelected
                                            ? 'opacity-100'
                                            : 'opacity-88 group-hover:opacity-100'
                                    }`}
                                    style={{
                                        fontFamily: activeFontFamily,
                                        fontSize: `${effectiveFontSize}px`,
                                        lineHeight: lineSpacing,
                                        textAlign,
                                        width: '100%',
                                        maxWidth: '100%',
                                        paddingInline: '0.25rem',
                                        overflowWrap: 'anywhere',
                                    }}
                                    dir="auto"
                                >
                                    {renderLineText(line.text)}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
);

export default PreviewLineList;
