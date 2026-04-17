import React from 'react';
import PreviewCanvas from './PreviewCanvas';
import { formatStyleLabel } from './utils';

const FontMixingPanel = ({
  activePreviewLine,
  activeStyleKeys,
  fontSize,
  getDefaultStyleKey,
  getFontOptionByName,
  handleApplyFontToActiveLine,
  handleLineStyleChange,
  lineSpacing,
  openPreviewLineIndex,
  safePreviewLines,
  safeSelectedFonts,
  setOpenPreviewLineIndex,
  textAlign,
}) => {
  const activeLineNumber = activePreviewLine
    ? activePreviewLine.lineIndex + 1
    : null;

  return (
    <div className="space-y-3">
      <div className="rounded-[1.25rem] border border-[rgba(197,184,161,0.22)] bg-[linear-gradient(180deg,rgba(253,250,245,0.98),rgba(244,239,231,0.94))] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.1)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              Font Mixing
            </span>

            <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-[rgba(236,239,202,0.7)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#213448] shadow-sm">
              {activePreviewLine ? `Line ${activeLineNumber}` : 'Select a line'}
            </span>
          </div>

          {safeSelectedFonts.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fonts
              </div>

              <div className="flex flex-wrap gap-2.5">
                {safeSelectedFonts.map((font) => {
                  const isActiveFont = activePreviewLine?.fontName === font.name;
                  const fontFamily =
                    font.styles?.[getDefaultStyleKey(font.name)] || 'inherit';

                  return (
                    <button
                      key={`mixing-font-${font.name}`}
                      type="button"
                      onClick={() =>
                        activePreviewLine &&
                        handleApplyFontToActiveLine(font.name)
                      }
                      disabled={!activePreviewLine}
                      className={`px-5 py-3 rounded-xl font-semibold border transition-all duration-150 ${
                        !activePreviewLine
                          ? 'cursor-not-allowed border-[rgba(197,184,161,0.26)] bg-white text-slate-400'
                          : isActiveFont
                            ? 'border-[rgba(212,194,161,0.38)] bg-[linear-gradient(180deg,#2f4258_0%,#213142_100%)] text-white shadow-[0_18px_28px_-18px_rgba(33,49,66,0.56)]'
                            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,242,235,0.97))] text-slate-700 border-[rgba(197,184,161,0.34)] hover:bg-white hover:border-[rgba(83,103,130,0.34)]'
                      }`}
                      style={{ fontFamily }}
                    >
                      {font.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePreviewLine && activeStyleKeys.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Style
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeStyleKeys.map((styleKey) => {
                  const isActiveStyle = activePreviewLine.styleKey === styleKey;

                  return (
                    <button
                      key={styleKey}
                      type="button"
                      onClick={() =>
                        handleLineStyleChange(activePreviewLine.lineIndex, styleKey)
                      }
                      aria-pressed={isActiveStyle}
                      className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                        isActiveStyle
                          ? 'border-[rgba(212,194,161,0.36)] bg-[linear-gradient(180deg,#2f4258_0%,#213142_100%)] text-white shadow-[0_14px_22px_-18px_rgba(33,49,66,0.52)]'
                          : 'bg-white text-slate-600 border-[rgba(197,184,161,0.34)] hover:bg-[rgba(247,244,238,0.95)] hover:text-slate-900'
                      }`}
                    >
                      {formatStyleLabel(styleKey)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <PreviewCanvas
        mode="mixing"
        lines={safePreviewLines}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        textAlign={textAlign}
        openPreviewLineIndex={openPreviewLineIndex}
        setOpenPreviewLineIndex={setOpenPreviewLineIndex}
        getFontOptionByName={getFontOptionByName}
        getDefaultStyleKey={getDefaultStyleKey}
      />
    </div>
  );
};

export default FontMixingPanel;