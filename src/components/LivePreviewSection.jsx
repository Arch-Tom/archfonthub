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
    <section className="relative overflow-visible rounded-[2.15rem] border border-[rgba(148,180,193,0.16)] bg-[linear-gradient(180deg,rgba(252,253,252,0.998),rgba(241,246,247,0.988))] p-5 shadow-[0_38px_90px_-54px_rgba(24,28,34,0.14)] sm:p-6 xl:p-7">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),transparent)]" />
        <div className="absolute right-8 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(236,239,202,0.18),transparent_72%)]" />
        <div className="absolute left-10 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(84,119,146,0.08),transparent_74%)]" />
      </div>

      <div className="relative space-y-4">
        <header className="overflow-hidden rounded-[1.75rem] border border-[rgba(148,180,193,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,239,202,0.88)_34%,rgba(148,180,193,0.34)_72%,rgba(255,255,255,0.95)_100%)] px-5 py-5 shadow-[0_24px_50px_-34px_rgba(17,21,26,0.16)] sm:px-6">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />
            <div className="absolute -right-10 top-3 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(236,239,202,0.22),transparent_72%)]" />
          </div>

          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-[44rem]">
              <div className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.18)] bg-[rgba(255,255,255,0.64)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#213448] shadow-sm backdrop-blur-sm">
                Preview Studio
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2
                  className="text-[1.95rem] font-bold tracking-tight text-slate-900 sm:text-[2.25rem]"
                  style={{ fontFamily: 'Alumni Sans Regular' }}
                >
                  Live Preview
                </h2>

                <span className="inline-flex items-center rounded-full border border-[rgba(84,119,146,0.18)] bg-[rgba(255,255,255,0.68)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#213448] shadow-sm backdrop-blur-sm">
                  {modeTitle}
                </span>
              </div>

              <p className="mt-2 max-w-[40rem] text-[15px] leading-7 text-slate-700">
                {modeDescription}
              </p>
            </div>

            <div className="w-full xl:w-auto xl:min-w-[19rem]">
              <div className="inline-flex w-full rounded-[1.1rem] border border-[rgba(148,180,193,0.18)] bg-[rgba(255,255,255,0.62)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] xl:w-auto backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setIsFontMixingMode(false)}
                  className={`flex-1 rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-all xl:min-w-[9rem] ${
                    !showFontMixingMode
                      ? 'border border-[rgba(148,180,193,0.24)] bg-[linear-gradient(135deg,#547792_0%,#213448_100%)] text-white shadow-[0_12px_24px_-18px_rgba(84,119,146,0.34)]'
                      : 'text-slate-700 hover:text-slate-900'
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
                      ? 'border border-[rgba(148,180,193,0.24)] bg-[linear-gradient(135deg,#547792_0%,#213448_100%)] text-white shadow-[0_12px_24px_-18px_rgba(84,119,146,0.34)]'
                      : canUseFontMixing
                        ? 'text-slate-700 hover:text-slate-900'
                        : 'cursor-not-allowed text-slate-400/80'
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
          <div className="space-y-4 rounded-[1.8rem] border border-[rgba(148,180,193,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.996),rgba(244,248,249,0.986))] p-4 shadow-[0_28px_56px_-40px_rgba(24,28,34,0.08)] sm:p-5">
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
            <div className="min-h-[170px] rounded-[1.6rem] border border-[rgba(148,180,193,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.996),rgba(247,249,250,0.98))] p-6 shadow-[0_20px_44px_-36px_rgba(24,28,34,0.05)]">
              <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                <div className="rounded-full border border-[rgba(148,180,193,0.18)] bg-[rgba(236,239,202,0.9)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#213448] shadow-sm">
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
