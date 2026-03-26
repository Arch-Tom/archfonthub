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
      <div className="rounded-[1.25rem] border border-[rgba(197,184,161,0.28)] bg-[linear-gradient(180deg,rgba(251,249,244,0.98),rgba(242,237,228,0.95))] p-4 sm:p-5">
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

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[rgba(197,184,161,0.28)] bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f4258]" />
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
                        ? 'border-[rgba(58,79,106,0.65)] bg-[linear-gradient(180deg,#47617e_0%,#2f4258_100%)] text-white'
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
                          ? 'border-[rgba(58,79,106,0.65)] bg-[linear-gradient(180deg,#47617e_0%,#2f4258_100%)] text-white shadow-[0_18px_26px_-20px_rgba(47,66,88,0.48)]'
                          : 'bg-white text-slate-700 border-[rgba(197,184,161,0.34)] hover:bg-[rgba(247,244,238,0.95)] hover:border-[rgba(83,103,130,0.34)]'
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
