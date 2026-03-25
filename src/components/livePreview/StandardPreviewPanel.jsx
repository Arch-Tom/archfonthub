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
  <div className="rounded-[1.35rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-6">
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
                  className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm"
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
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {formatStyleLabel(styleKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full rounded-[1rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.16)]">
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
      <div className="flex min-h-[240px] items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white text-center">
        <div className="max-w-xs text-sm leading-6 text-slate-500">
          Select fonts and enter text above to compare them here.
        </div>
      </div>
    )}
  </div>
);

export default StandardPreviewPanel;
