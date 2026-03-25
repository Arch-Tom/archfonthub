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
    textAlign === 'center' ? 'items-center text-center' : textAlign === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:p-6">
      {safePreviewLines.length > 0 ? (
        <div className="rounded-[1rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)] sm:px-6 sm:py-6">
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
                  className={`group w-full rounded-[0.8rem] px-3 py-1.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                    isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50/80'
                  }`}
                  style={{ marginTop: index === 0 ? 0 : `${Math.max((lineSpacing - 1) * effectiveFontSize, 0)}px` }}
                >
                  <div className={`flex w-full flex-col ${alignmentClass}`}>
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                      <span className={`rounded-full border px-2 py-0.5 ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                        {index + 1}
                      </span>
                      {line.fontName ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-500">
                          {line.fontName}
                        </span>
                      ) : null}
                    </div>

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
        <div className="flex min-h-[240px] items-center justify-center rounded-[1rem] border border-slate-200 bg-white text-center">
          <div className="max-w-xs text-sm leading-6 text-slate-500">
            Add text and selected fonts above to start building your mixed-font preview here.
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewLineList;
