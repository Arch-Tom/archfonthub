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
  mode = 'standard',
  lines = [],
  fontSize = 36,
  lineSpacing = 1,
  textAlign = 'left',
  openPreviewLineIndex = null,
  setOpenPreviewLineIndex,
  getFontOptionByName,
  getDefaultStyleKey,
  standardFontFamily = 'inherit',
}) => {
  const alignmentClass = getAlignmentClass(textAlign);
  const hasLines = Array.isArray(lines) && lines.length > 0;
  const isMixingMode = mode === 'mixing';

  return (
    <div className="rounded-[1.45rem] border border-[rgba(197,184,161,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.998),rgba(248,245,239,0.985))] px-5 py-6 shadow-[0_20px_38px_-28px_rgba(30,41,59,0.12)] sm:px-6 sm:py-7">
      {hasLines ? (
        <div
          className={`flex min-h-[280px] w-full flex-col justify-center ${alignmentClass}`}
        >
          {lines.map((line, index) => {
            const effectiveFontSize =
              isMixingMode && line.fontSizeOverride != null
                ? line.fontSizeOverride
                : fontSize;

            const activeFontFamily = isMixingMode
              ? (() => {
                  const font = getFontOptionByName?.(line.fontName);
                  const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);

                  return (
                    font?.styles?.[line.styleKey] ||
                    font?.styles?.[fallbackStyleKey] ||
                    'inherit'
                  );
                })()
              : standardFontFamily;

            const isSelected =
              isMixingMode && openPreviewLineIndex === line.lineIndex;

            const spacing =
              index === 0
                ? 0
                : Math.max((lineSpacing - 1) * effectiveFontSize, 0);

            if (isMixingMode) {
              return (
                <button
                  key={`preview-line-${line.lineIndex}`}
                  type="button"
                  onClick={() => setOpenPreviewLineIndex?.(line.lineIndex)}
                  aria-label={`Select line ${index + 1} for editing`}
                  aria-pressed={isSelected}
                  className={`w-full rounded-[1rem] border px-3 py-2.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 ${
                    isSelected
                      ? 'border-[rgba(212,194,161,0.34)] bg-[linear-gradient(180deg,rgba(47,66,88,0.06),rgba(212,194,161,0.14))] shadow-[0_12px_24px_-20px_rgba(47,66,88,0.22)]'
                      : 'border-transparent hover:border-[rgba(197,184,161,0.22)] hover:bg-[rgba(246,243,236,0.55)]'
                  }`}
                  style={{ marginTop: `${spacing}px` }}
                >
                  <div className={`flex w-full flex-col ${alignmentClass}`}>
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
              );
            }

            return (
              <div
                key={`standard-preview-line-${line.lineIndex}`}
                className="w-full"
                style={{ marginTop: `${spacing}px` }}
              >
                <div className={`flex w-full flex-col ${alignmentClass}`}>
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center text-center">
          <div className="max-w-xs text-sm leading-6 text-slate-500">
            {isMixingMode
              ? 'Add text and selected fonts above to start building your mixed-font preview here.'
              : 'Select a font and enter text above to preview it here.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewCanvas;