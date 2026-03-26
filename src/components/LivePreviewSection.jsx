import React, { useEffect, useMemo, useState } from 'react';
import FontMixingPanel from './livePreview/FontMixingPanel';
import HebrewSupportWarning from './livePreview/HebrewSupportWarning';
import MonogramPreview from './livePreview/MonogramPreview';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';
import StandardPreviewPanel from './livePreview/StandardPreviewPanel';
import { normalizePreviewText } from './livePreview/utils';

const LivePreviewSection = ({
  monogramInfo,
  combinedText = '',
  hebrewRegex,
  hasStandardSelection = false,
  previewLines = [],
  openPreviewLineIndex = 0,
  setOpenPreviewLineIndex,
  selectedFonts = [],
  getFontOptionByName,
  getDefaultStyleKey,
  getSortedStyleKeys,
  fontSize = 36,
  lineSpacing = 1,
  textAlign = 'center',
  setTextAlign,
  handleFontSizeChange,
  handleLineSpacingChange,
  handleApplyFontToActiveLine,
  handleLineStyleChange,
  handleLineFontSizeOverrideChange,
  AlignIcon,
}) => {
  const [isFontMixingMode, setIsFontMixingMode] = useState(false);
  const [standardPreviewStyleMap, setStandardPreviewStyleMap] = useState({});

  const safePreviewLines = Array.isArray(previewLines) ? previewLines : [];
  const safeSelectedFonts = Array.isArray(selectedFonts) ? selectedFonts : [];

  const activePreviewLine =
    safePreviewLines.find((line) => line.lineIndex === openPreviewLineIndex) ||
    safePreviewLines[0] ||
    null;

  const activeFont = activePreviewLine ? getFontOptionByName(activePreviewLine.fontName) : null;
  const activeStyleKeys = activeFont ? getSortedStyleKeys(activeFont.styles) : [];
  const activeLineFontSize = activePreviewLine?.fontSizeOverride ?? fontSize;
  const isUsingDefaultLineSize = activePreviewLine?.fontSizeOverride == null;
  const showHebrewWarning = hebrewRegex instanceof RegExp && hebrewRegex.test(combinedText);

  const standardPreviewLines = useMemo(() => {
    if (combinedText && String(combinedText).trim()) {
      return String(combinedText).split('\n').map((line) => line.trimEnd());
    }

    if (safePreviewLines.length > 0) {
      return safePreviewLines.map((line) => normalizePreviewText(line.text));
    }

    return [];
  }, [combinedText, safePreviewLines]);

  useEffect(() => {
    setStandardPreviewStyleMap((current) => {
      const next = { ...current };
      let hasChanges = false;

      safeSelectedFonts.forEach((font) => {
        if (!font?.name) return;

        const styleKeys = getSortedStyleKeys(font.styles || {});
        const fallbackStyleKey = getDefaultStyleKey(font.name) || styleKeys[0] || 'regular';

        if (!next[font.name] || !styleKeys.includes(next[font.name])) {
          next[font.name] = fallbackStyleKey;
          hasChanges = true;
        }
      });

      Object.keys(next).forEach((fontName) => {
        const fontStillExists = safeSelectedFonts.some((font) => font?.name === fontName);
        if (!fontStillExists) {
          delete next[fontName];
          hasChanges = true;
        }
      });

      return hasChanges ? next : current;
    });
  }, [safeSelectedFonts, getDefaultStyleKey, getSortedStyleKeys]);

  const canUseFontMixing = hasStandardSelection && safePreviewLines.length > 0;
  const showFontMixingMode = isFontMixingMode && canUseFontMixing;

  const modeTitle = showFontMixingMode ? 'Font Mixing' : 'Standard Preview';
  const modeDescription = showFontMixingMode
    ? 'Select a line and shape the composition with font-by-font control.'
    : 'Compare your selected fonts in a brighter specimen view before mixing lines.';

  return (
    <section className="relative overflow-visible rounded-[2.15rem] border border-[rgba(63,97,89,0.18)] bg-[linear-gradient(180deg,rgba(249,248,243,0.99),rgba(235,241,236,0.97))] p-5 shadow-[0_38px_90px_-54px_rgba(21,43,39,0.2)] sm:p-6 xl:p-7">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),transparent)]" />
        <div className="absolute right-8 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(88,143,129,0.18),transparent_72%)]" />
        <div className="absolute left-10 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(166,128,91,0.12),transparent_74%)]" />
      </div>

      <div className="relative space-y-4">
        <header className="overflow-hidden rounded-[1.7rem] border border-[rgba(63,97,89,0.24)] bg-[linear-gradient(145deg,rgba(21,51,46,0.98),rgba(28,74,66,0.96)_46%,rgba(53,104,95,0.92)_100%)] px-5 py-5 shadow-[0_24px_50px_-34px_rgba(10,28,24,0.5)] sm:px-6">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute -right-10 top-3 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(190,229,215,0.16),transparent_72%)]" />
          </div>

          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-[44rem]">
              <div className="inline-flex items-center rounded-full border border-[rgba(221,210,188,0.24)] bg-[rgba(247,239,224,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(244,237,223,0.9)] shadow-sm backdrop-blur-sm">
                Preview Studio
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2
                  className="text-[1.95rem] font-bold tracking-tight text-white sm:text-[2.25rem]"
                  style={{ fontFamily: 'Alumni Sans Regular' }}
                >
                  Live Preview
                </h2>

                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-50 shadow-sm backdrop-blur-sm">
                  {modeTitle}
                </span>
              </div>

              <p className="mt-2 max-w-[40rem] text-[15px] leading-7 text-emerald-50/84">
                {modeDescription}
              </p>
            </div>

            <div className="w-full xl:w-auto xl:min-w-[19rem]">
              <div className="inline-flex w-full rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] xl:w-auto backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setIsFontMixingMode(false)}
                  className={`flex-1 rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all xl:min-w-[9rem] ${
                    !showFontMixingMode
                      ? 'border border-[rgba(221,210,188,0.32)] bg-[linear-gradient(180deg,rgba(246,239,225,0.98),rgba(215,201,172,0.95))] text-slate-900 shadow-[0_12px_24px_-18px_rgba(215,201,172,0.64)]'
                      : 'text-emerald-50/84 hover:text-white'
                  }`}
                  aria-pressed={!showFontMixingMode}
                >
                  Standard
                </button>

                <button
                  type="button"
                  onClick={() => canUseFontMixing && setIsFontMixingMode(true)}
                  disabled={!canUseFontMixing}
                  className={`flex-1 rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all xl:min-w-[9rem] ${
                    showFontMixingMode
                      ? 'border border-[rgba(221,210,188,0.32)] bg-[linear-gradient(180deg,rgba(246,239,225,0.98),rgba(215,201,172,0.95))] text-slate-900 shadow-[0_12px_24px_-18px_rgba(215,201,172,0.64)]'
                      : canUseFontMixing
                        ? 'text-emerald-50/84 hover:text-white'
                        : 'cursor-not-allowed text-emerald-200/35'
                  }`}
                  aria-pressed={showFontMixingMode}
                  aria-disabled={!canUseFontMixing}
                >
                  Font Mixing
                </button>
              </div>
            </div>
          </div>
        </header>

        <MonogramPreview htmlString={monogramInfo?.htmlString} />

        {showHebrewWarning && <HebrewSupportWarning />}

        {hasStandardSelection ? (
          <div className="space-y-4 rounded-[1.8rem] border border-[rgba(104,131,122,0.24)] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(237,243,238,0.96))] p-4 shadow-[0_28px_56px_-40px_rgba(15,38,33,0.14)] sm:p-5">
            <PreviewLayoutControls
              activeLineFontSize={activeLineFontSize}
              activePreviewLine={activePreviewLine}
              AlignIcon={AlignIcon}
              fontSize={fontSize}
              handleFontSizeChange={handleFontSizeChange}
              handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
              handleLineSpacingChange={handleLineSpacingChange}
              isFontMixingMode={showFontMixingMode}
              isUsingDefaultLineSize={isUsingDefaultLineSize}
              lineSpacing={lineSpacing}
              setTextAlign={setTextAlign}
              textAlign={textAlign}
            />

            {showFontMixingMode ? (
              <FontMixingPanel
                activeLineFontSize={activeLineFontSize}
                activePreviewLine={activePreviewLine}
                activeStyleKeys={activeStyleKeys}
                fontSize={fontSize}
                getDefaultStyleKey={getDefaultStyleKey}
                getFontOptionByName={getFontOptionByName}
                handleApplyFontToActiveLine={handleApplyFontToActiveLine}
                handleLineStyleChange={handleLineStyleChange}
                lineSpacing={lineSpacing}
                openPreviewLineIndex={openPreviewLineIndex}
                safePreviewLines={safePreviewLines}
                safeSelectedFonts={safeSelectedFonts}
                setOpenPreviewLineIndex={setOpenPreviewLineIndex}
                textAlign={textAlign}
              />
            ) : (
              <StandardPreviewPanel
                fontSize={fontSize}
                getDefaultStyleKey={getDefaultStyleKey}
                getSortedStyleKeys={getSortedStyleKeys}
                lineSpacing={lineSpacing}
                safeSelectedFonts={safeSelectedFonts}
                setStandardPreviewStyleMap={setStandardPreviewStyleMap}
                standardPreviewLines={standardPreviewLines}
                standardPreviewStyleMap={standardPreviewStyleMap}
                textAlign={textAlign}
              />
            )}
          </div>
        ) : (
          !monogramInfo && (
            <div className="min-h-[170px] rounded-[1.6rem] border border-[rgba(104,131,122,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,241,0.95))] p-6 shadow-[0_20px_44px_-36px_rgba(15,38,33,0.08)]">
              <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                <div className="rounded-full border border-[rgba(160,143,119,0.28)] bg-[rgba(244,239,230,0.92)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 shadow-sm">
                  Waiting for input
                </div>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                  Select fonts and enter text above to bring the preview studio to life.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default LivePreviewSection;
