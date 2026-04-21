import { useState } from 'react';

const renderLineText = (value) => {
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (value) return String(value);
    return ' ';
};

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

    const hasLines =
        Array.isArray(lines) && lines.some((line) => line.text.trim() !== '');

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
            event.dataTransfer.getData(fontDragDataType) || draggedFontName;

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
            className="flex min-h-[260px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white/95 px-5 py-7 shadow-inner"
            onClick={() => onLineSelect(null)}
        >
            <div className="inline-flex w-fit max-w-full flex-col items-stretch">
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
                            className="group w-full bg-transparent py-0.5 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                        >
                            <span
                                className="block w-full"
                                style={{ textAlign }}
                            >
                                <span
                                    className={`inline-block max-w-full whitespace-pre-wrap break-words rounded-md px-[0.18em] py-[0.04em] text-slate-800 transition-colors ${
                                        isDropTarget
                                            ? 'border border-emerald-400 bg-emerald-50/90 shadow-sm'
                                            : isSelected
                                            ? 'border border-blue-300 bg-blue-50/85 shadow-sm'
                                            : 'border border-transparent bg-transparent'
                                    }`}
                                    style={{
                                        fontFamily: activeFontFamily,
                                        fontSize: `${effectiveFontSize}px`,
                                        lineHeight: lineSpacing,
                                        overflowWrap: 'anywhere',
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
        </div>
    );
};

export default PreviewCanvas;