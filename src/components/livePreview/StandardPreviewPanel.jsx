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
  <div className="rounded-[1.45rem] border border-[rgba(182,138,82,0.18)] bg-[linear-gradient(180deg,rgba(252,250,246,0.985),rgba(244,239,232,0.965))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_38px_-30px_rgba(15,23,42,0.08)] sm:p-6">
    {safeSelectedFonts.length > 0 ? (
      <div className="space-y-8">
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

          return (
            <div key={`standard-preview-${font.name}`} className="relative flex flex-col items-start gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span
                  className="rounded-full border border-[rgba(182,138,82,0.2)] bg-[linear-gradient(180deg,#1f252c_0%,#313b46_100%)] px-4 py-1 text-sm font-bold text-white shadow-[0_14px_22px_-18px_rgba(31,37,44,0.5)]"
                  style={{ fontFamily: 'Arial' }}
                >
                  {font.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
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
                        className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                          isActiveStyle
                            ? 'border-[rgba(182,138,82,0.24)] bg-[linear-gradient(180deg,#1f252c_0%,#313b46_100%)] text-white shadow-[0_14px_22px_-18px_rgba(31,37,44,0.5)]'
                            : 'bg-white text-slate-600 border-[rgba(182,138,82,0.18)] hover:bg-[rgba(247,244,238,0.95)] hover:text-slate-900'
                        }`}
                      >
                        {formatStyleLabel(styleKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full rounded-[1.15rem] border border-[rgba(182,138,82,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.998),rgba(250,247,242,0.992))] px-5 py-5 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.08)]">
                {standardPreviewLines.length > 0 ? (
                  <p
                    className="w-full break-words whitespace-pre-wrap text-slate-800"
                    style={{
                      fontFamily: activeStandardFontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: Math.max(lineSpacing, 0.9),
                      textAlign,
                      overflowWrap: 'anywhere',
                      color: '#1f2937',
                    }}
                    dir="auto"
                  >
                    {standardPreviewLines.join('\n')}
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    Enter text above to preview it in {font.name}.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="flex min-h-[240px] items-center justify-center rounded-[1.15rem] border border-[rgba(182,138,82,0.16)] bg-white text-center">
        <div className="max-w-xs text-sm leading-6 text-slate-500">
          Select fonts and enter text above to compare them here.
        </div>
      </div>
    )}
  </div>
);

export default StandardPreviewPanel;
