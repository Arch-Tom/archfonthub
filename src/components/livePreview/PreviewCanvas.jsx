const renderLineText = (value) => {
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (value) return String(value);
    return ' ';
};

const getAlignmentClass = (textAlign) =>
    textAlign === 'center'
        ? 'items-center text-center'
        : textAlign === 'right'
            ? 'items-end text-right'
            : 'items-start text-left';

const PreviewCanvas = ({
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    lineSpacing,
    lines = [],
    onLineSelect,
    selectedPreviewLineIndex,
    textAlign,
}) => {
    const alignmentClass = getAlignmentClass(textAlign);
    const hasLines = Array.isArray(lines) && lines.some((line) => line.text.trim() !== '');

    if (!hasLines) {
        return (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-white/90 p-6 text-center">
                <p className="text-slate-500 italic">
                    Select fonts and enter text to see a live preview.
                </p>
            </div>
        );
    }

    return (
        <div
            className={`flex min-h-[260px] w-full flex-col justify-center rounded-xl border border-slate-200 bg-white/95 px-5 py-7 shadow-inner ${alignmentClass}`}
            onClick={() => onLineSelect(null)}
        >
            {lines.map((line, displayIndex) => {
                const font = getFontOptionByName?.(line.fontName);
                const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);
                const activeFontFamily =
                    font?.styles?.[line.styleKey] ||
                    font?.styles?.[fallbackStyleKey] ||
                    'inherit';
                const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                const isSelected = selectedPreviewLineIndex === line.lineIndex;

                return (
                    <button
                        key={`preview-line-${line.lineIndex}`}
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onLineSelect(line.lineIndex);
                        }}
                        aria-label={`Select line ${displayIndex + 1} for editing`}
                        aria-pressed={isSelected}
                        className="group relative block w-full bg-transparent p-0 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                    >
                        {isSelected && (
                            <span className="pointer-events-none absolute -inset-x-3 -inset-y-1.5 rounded-lg border border-blue-300 bg-blue-50/70 shadow-sm" />
                        )}
                        <span className={`relative flex w-full flex-col ${alignmentClass}`}>
                            <span
                                className="block w-full whitespace-pre-wrap break-words text-slate-800"
                                style={{
                                    fontFamily: activeFontFamily,
                                    fontSize: `${effectiveFontSize}px`,
                                    lineHeight: lineSpacing,
                                    overflowWrap: 'anywhere',
                                    textAlign,
                                }}
                                dir="auto"
                            >
                                {renderLineText(line.text)}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default PreviewCanvas;
