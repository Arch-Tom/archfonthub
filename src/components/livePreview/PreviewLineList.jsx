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
}) => {
  const alignmentClass =
    textAlign === 'center'
      ? 'items-center text-center'
      : textAlign === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  return (
    <div className="rounded-[1.2rem] border border-[rgba(197,184,161,0.28)] bg-[linear-gradient(180deg,rgba(249,247,242,0.96),rgba(240,235,226,0.93))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:p-6">
      {safePreviewLines.length > 0 ? (
        <div className="rounded-[1.1rem] border border-[rgba(197,184,161,0.28)] bg-[linear-gradient(180deg,rgba(255,255,255,0.995),rgba(249,246,239,0.985))] px-5 py-5 shadow-[0_16px_30px_-24px_rgba(30,41,59,0.14)] sm:px-6 sm:py-6">
          <div className={`flex min-h-[240px] w-full flex-col ${alignmentClass}`}>
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
                  className={`group relative w-full rounded-[0.95rem] px-3 py-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                    isSelected ? 'bg-[linear-gradient(180deg,rgba(233,239,246,0.9),rgba(240,236,228,0.82))]' : 'hover:bg-[rgba(246,243,236,0.72)]'
                  }`}
                  style={{
                    marginTop: index === 0 ? 0 : `${Math.max((lineSpacing - 1) * effectiveFontSize, 0)}px`,
                  }}
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
            })}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center rounded-[1rem] border border-[rgba(197,184,161,0.28)] bg-white text-center">
          <div className="max-w-xs text-sm leading-6 text-slate-500">
            Add text and selected fonts above to start building your mixed-font preview here.
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewLineList;
