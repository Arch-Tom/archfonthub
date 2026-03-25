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
      <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
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

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
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
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
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
                        ? 'cursor-not-allowed border-slate-200 bg-white text-slate-400'
                        : isActiveFont
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
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
