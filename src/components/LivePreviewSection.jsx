import React from 'react';

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
  lines = [],
  fontSize = 36,
  lineSpacing = 1,
  textAlign = 'left',
  openPreviewLineIndex = null,
  setOpenPreviewLineIndex,
  getFontOptionByName,
  getDefaultStyleKey,
  onDropFontOnLine,
  dragOverLineIndex = null,
  setDragOverLineIndex,
}) => {
  const alignmentClass = getAlignmentClass(textAlign);
  const hasLines = Array.isArray(lines) && lines.length > 0;

  return (
    <div className="rounded-[1.45rem] border border-[rgba(197,184,161,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.998),rgba(248,245,239,0.985))] px-5 py-6 shadow-[0_20px_38px_-28px_rgba(30,41,59,0.12)] sm:px-6 sm:py-7">
      {hasLines ? (
        <div
          className={`flex min-h-[280px] w-full flex-col justify-center ${alignmentClass}`}
        >
          {lines.map((line, index) => {
            const font = getFontOptionByName?.(line.fontName);
            const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);
            const activeFontFamily =
              font?.styles?.[line.styleKey] ||
              font?.styles?.[fallbackStyleKey] ||
              'inherit';

            const effectiveFontSize = line.fontSizeOverride ?? fontSize;
            const isSelected = openPreviewLineIndex === line.lineIndex;
            const isDragTarget = dragOverLineIndex === line.lineIndex;

            const spacing =
              index === 0
                ? 0
                : Math.max((lineSpacing - 1) * effectiveFontSize, 0);

            return (
              <div
                key={`preview-line-${line.lineIndex}`}
                className="relative w-full"
                style={{ marginTop: `${spacing}px` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenPreviewLineIndex?.(line.lineIndex)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (setDragOverLineIndex) {
                      setDragOverLineIndex(line.lineIndex);
                    }
                  }}
                  onDragLeave={() => {
                    if (setDragOverLineIndex) {
                      setDragOverLineIndex((current) =>
                        current === line.lineIndex ? null : current
                      );
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedFontName =
                      event.dataTransfer.getData('text/plain');

                    if (setDragOverLineIndex) {
                      setDragOverLineIndex(null);
                    }

                    if (droppedFontName && onDropFontOnLine) {
                      onDropFontOnLine(line.lineIndex, droppedFontName);
                    }
                  }}
                  aria-label={`Select line ${index + 1} for editing`}
                  aria-pressed={isSelected}
                  className="relative block w-full bg-transparent p-0 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
                >
                  {(isSelected || isDragTarget) && (
                    <span
                      className={`pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-[0.95rem] ${
                        isDragTarget
                          ? 'border border-dashed border-[rgba(84,119,146,0.42)] bg-[rgba(148,180,193,0.12)]'
                          : 'border border-[rgba(212,194,161,0.34)] bg-[linear-gradient(180deg,rgba(47,66,88,0.06),rgba(212,194,161,0.14))] shadow-[0_12px_24px_-20px_rgba(47,66,88,0.22)]'
                      }`}
                    />
                  )}

                  <div className={`relative flex w-full flex-col ${alignmentClass}`}>
                    <p
                      className="w-full break-words whitespace-pre-wrap text-slate-800"
                      style={{
                        fontFamily: activeFontFamily,
                        fontSize: `${effectiveFontSize}px`,
                        lineHeight: 1,
                        textAlign,
                        overflowWrap: 'anywhere',
                        color: '#1f2937',
                      }}
                      dir="auto"
                    >
                      {renderLineText(line.text)}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center text-center">
          <div className="max-w-xs text-sm leading-6 text-slate-500">
            Add text and selected fonts above to start building your preview
            here.
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewCanvas;