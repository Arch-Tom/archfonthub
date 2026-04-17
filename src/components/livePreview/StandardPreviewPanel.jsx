import React, { useMemo } from 'react';
import PreviewCanvas from './PreviewCanvas';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const StandardPreviewPanel = ({
  activeStandardFontName,
  fontSize,
  getDefaultStyleKey,
  getSortedStyleKeys,
  lineSpacing,
  safeSelectedFonts,
  setActiveStandardFontName,
  setStandardPreviewStyleMap,
  standardPreviewLines,
  standardPreviewStyleMap,
  textAlign,
}) => {
  const activeStandardFont =
    safeSelectedFonts.find((font) => font.name === activeStandardFontName) ||
    safeSelectedFonts[0] ||
    null;

  const styleKeys = activeStandardFont
    ? getSortedStyleKeys(activeStandardFont.styles || {})
    : [];

  const displayStyleKeys = styleKeys.length > 0 ? styleKeys : ['regular'];

  const selectedStyleKey = activeStandardFont
    ? standardPreviewStyleMap[activeStandardFont.name] ||
      getDefaultStyleKey(activeStandardFont.name) ||
      displayStyleKeys[0]
    : '';

  const activeStandardFontFamily = activeStandardFont
    ? activeStandardFont?.styles?.[selectedStyleKey] ||
      getSafeFontFamilyPreview(activeStandardFont)
    : 'inherit';

  const standardCanvasLines = useMemo(
    () =>
      (standardPreviewLines || []).map((text, index) => ({
        lineIndex: index,
        text,
      })),
    [standardPreviewLines]
  );

  return (
    <div className="space-y-3">
      <div className="rounded-[1.25rem] border border-[rgba(197,184,161,0.22)] bg-[linear-gradient(180deg,rgba(253,250,245,0.98),rgba(244,239,231,0.94))] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.1)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              Standard
            </span>

            {activeStandardFont && (
              <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-[rgba(236,239,202,0.7)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#213448] shadow-sm">
                {activeStandardFont.name}
              </span>
            )}
          </div>

          {safeSelectedFonts.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fonts
              </div>

              <div className="flex flex-wrap gap-2.5">
                {safeSelectedFonts.map((font) => {
                  const isActiveFont = activeStandardFont?.name === font.name;
                  const fontFamily =
                    font.styles?.[getDefaultStyleKey(font.name)] ||
                    getSafeFontFamilyPreview(font);

                  return (
                    <button
                      key={`standard-font-${font.name}`}
                      type="button"
                      onClick={() => setActiveStandardFontName(font.name)}
                      className={`px-5 py-3 rounded-xl font-semibold border transition-all duration-150 ${
                        isActiveFont
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

          {activeStandardFont && displayStyleKeys.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Style
              </div>

              <div className="flex flex-wrap gap-1.5">
                {displayStyleKeys.map((styleKey) => {
                  const isActiveStyle = styleKey === selectedStyleKey;

                  return (
                    <button
                      key={`${activeStandardFont.name}-${styleKey}`}
                      type="button"
                      onClick={() =>
                        setStandardPreviewStyleMap((current) => ({
                          ...current,
                          [activeStandardFont.name]: styleKey,
                        }))
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
        mode="standard"
        lines={standardCanvasLines}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        textAlign={textAlign}
        standardFontFamily={activeStandardFontFamily}
      />
    </div>
  );
};

export default StandardPreviewPanel;