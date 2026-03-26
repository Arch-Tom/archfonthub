import React from 'react';
import PreviewLineList from './PreviewLineList';
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
  const activeLineNumber = activePreviewLine ? activePreviewLine.lineIndex + 1 : null;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.35rem] border border-[rgba(197,184,161,0.28)] bg-[linear-gradient(180deg,rgba(253,250,245,0.98),rgba(241,235,225,0.95))] p-4 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.14)] sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[34rem]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Font Mixing
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Build the final layout line by line
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                Click a line in the preview, then assign it a font and style. The preview area below stays faithful to the final composition.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[rgba(58,79,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(234,239,245,0.96))] px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[linear-gradient(180deg,#c9ae75_0%,#8c7348_100%)] shadow-[0_0_0_3px_rgba(201,174,117,0.16)]" />
              {activePreviewLine ? `Editing line ${activeLineNumber}` : 'Select a line in the preview'}
            </div>
          </div>

          {activePreviewLine && activeStyleKeys.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeStyleKeys.map((styleKey) => {
                const isActiveStyle = activePreviewLine.styleKey === styleKey;
                return (
                  <button
                    key={styleKey}
                    type="button"
                    onClick={() => handleLineStyleChange(activePreviewLine.lineIndex, styleKey)}
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
          )}

          {safeSelectedFonts.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {safeSelectedFonts.map((font) => {
                const isActiveFont = activePreviewLine?.fontName === font.name;
                const fontFamily = font.styles?.[getDefaultStyleKey(font.name)] || 'inherit';
                return (
                  <button
                    key={`mixing-font-${font.name}`}
                    type="button"
                    onClick={() => activePreviewLine && handleApplyFontToActiveLine(font.name)}
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
          )}
        </div>
      </div>

      <PreviewLineList
        fontSize={fontSize}
        getDefaultStyleKey={getDefaultStyleKey}
        getFontOptionByName={getFontOptionByName}
        lineSpacing={lineSpacing}
        openPreviewLineIndex={openPreviewLineIndex}
        safePreviewLines={safePreviewLines}
        setOpenPreviewLineIndex={setOpenPreviewLineIndex}
        textAlign={textAlign}
      />
    </div>
  );
};

export default FontMixingPanel;
