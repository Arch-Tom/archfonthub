import React from 'react';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const StandardPreviewPanel = ({
  fontSize,
  getDefaultStyleKey,
  getSortedStyleKeys,
  lineSpacing,
  safeSelectedFonts,
  setStandardPreviewStyleMap,
  standardPreviewLines,
  standardPreviewStyleMap,
  textAlign,
}) => (
  <div className="space-y-4">
    {safeSelectedFonts.length > 0 ? (
      <div className="grid gap-4 xl:grid-cols-2">
        {safeSelectedFonts.map((font) => {
          const fallbackFontFamily = getSafeFontFamilyPreview(font);
          const styleKeys = getSortedStyleKeys(font.styles || {});
          const displayStyleKeys = styleKeys.length > 0 ? styleKeys : ['regular'];
          const selectedStyleKey =
            standardPreviewStyleMap[font.name] ||
            getDefaultStyleKey(font.name) ||
            displayStyleKeys[0];
          const activeStandardFontFamily =
            font?.styles?.[selectedStyleKey] || fallbackFontFamily;
          const standardPreviewFontSize = Math.min(fontSize, 82);

          return (
            <section
              key={`standard-preview-${font.name}`}
              className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_18px_36px_-30px_rgba(15,23,42,0.12)]"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div
                        className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-sm"
                        style={{ fontFamily: activeStandardFontFamily }}
                      >
                        {font.name}
                      </div>

                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Styles
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {displayStyleKeys.map((styleKey) => {
                        const isActiveStyle = styleKey === selectedStyleKey;

                        return (
                          <button
                            key={`${font.name}-${styleKey}`}
                            type="button"
                            onClick={() =>
                              setStandardPreviewStyleMap((current) => ({
                                ...current,
                                [font.name]: styleKey,
                              }))
                            }
                            aria-pressed={isActiveStyle}
                            className={`inline-flex rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                              isActiveStyle
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                            }`}
                          >
                            {formatStyleLabel(styleKey)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white px-5 py-5 sm:px-6 sm:py-6">
                {standardPreviewLines.length > 0 ? (
                  <div
                    className="min-h-[220px] max-w-full break-words whitespace-pre-wrap text-slate-950"
                    style={{
                      fontFamily: activeStandardFontFamily,
                      fontSize: `${standardPreviewFontSize}px`,
                      lineHeight: Math.max(lineSpacing, 0.9),
                      textAlign,
                      overflowWrap: 'anywhere',
                      color: '#0f172a',
                    }}
                    dir="auto"
                  >
                    {standardPreviewLines.join('\n')}
                  </div>
                ) : (
                  <div className="max-w-sm text-sm leading-6 text-slate-400">
                    Enter text above to preview it in {font.name}.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    ) : (
      <div className="flex min-h-[240px] items-center justify-center rounded-[1.35rem] border border-slate-200 bg-slate-50 text-center">
        <div className="max-w-xs text-sm leading-6 text-slate-500">
          Select fonts and enter text above to compare them here.
        </div>
      </div>
    )}
  </div>
);

export default StandardPreviewPanel;
