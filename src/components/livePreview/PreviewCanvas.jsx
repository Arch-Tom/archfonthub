import { useState } from 'react';

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
    draggedFontName = '',
    fontDragDataType = 'application/x-archfonthub-font',
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    lineSpacing,
    lines = [],
    onFontDropToLine,
    onLineSelect,
    selectedPreviewLineIndex,
    textAlign,
}) => {
    const [dropTargetLineIndex, setDropTargetLineIndex] = useState(null);
    const alignmentClass = getAlignmentClass(textAlign);
    const hasLines = Array.isArray(lines) && lines.some((line) => line.text.trim() !== '');
    const isFontDrag = (event) =>
        Boolean(draggedFontName) ||
        Array.from(event.dataTransfer?.types || []).includes(fontDragDataType);

    const handleLineDragOver = (event, lineIndex) => {
        if (!onFontDropToLine || !isFontDrag(event)) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDropTargetLineIndex(lineIndex);
    };

    const handleLineDragLeave = (event, lineIndex) => {
        if (
            dropTargetLineIndex === lineIndex &&
            !event.currentTarget.contains(event.relatedTarget)
        ) {
            setDropTargetLineIndex(null);
        }
    };

    const handleLineDrop = (event, lineIndex) => {
        if (!onFontDropToLine) return;

        event.preventDefault();
        event.stopPropagation();

        const droppedFontName =
            event.dataTransfer.getData(fontDragDataType) ||
            draggedFontName;

        setDropTargetLineIndex(null);

        if (droppedFontName) {
            onFontDropToLine(lineIndex, droppedFontName);
        }
    };

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
                const isDropTarget = dropTargetLineIndex === line.lineIndex;

                return (
                    <button
                        key={`preview-line-${line.lineIndex}`}
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onLineSelect(line.lineIndex);
                        }}
                        onDragOver={(event) =>
                            handleLineDragOver(event, line.lineIndex)
                        }
                        onDragLeave={(event) =>
                            handleLineDragLeave(event, line.lineIndex)
                        }
                        onDrop={(event) => handleLineDrop(event, line.lineIndex)}
                        aria-label={`Select line ${displayIndex + 1} for editing`}
                        aria-pressed={isSelected}
                        className="group relative block w-full bg-transparent p-0 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                    >
                        {(isSelected || isDropTarget) && (
                            <span
                                className={`pointer-events-none absolute -inset-x-3 -inset-y-1.5 rounded-lg border shadow-sm transition-colors ${
                                    isDropTarget
                                        ? 'border-emerald-400 bg-emerald-50/80'
                                        : 'border-blue-300 bg-blue-50/70'
                                }`}
                            />
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
