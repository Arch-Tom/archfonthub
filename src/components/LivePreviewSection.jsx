import React from 'react';
import HebrewSupportWarning from './livePreview/HebrewSupportWarning';
import MonogramPreview from './livePreview/MonogramPreview';
import UnifiedPreviewWorkspace from './livePreview/UnifiedPreviewWorkspace';

const LivePreviewSection = ({
  AlignIcon,
  combinedText = '',
  fontSize,
  getDefaultStyleKey,
  getFontOptionByName,
  getSortedStyleKeys,
  handleApplyFontToActiveLine,
  handleApplyFontToAllLines,
  handleApplyFontToLine,
  handleApplyStyleToAllLines,
  handleFontSizeChange,
  handleLineFontSizeOverrideChange,
  handleLineSpacingChange,
  handleLineStyleChange,
  hasLivePreviewSelection,
  hasStandardSelection,
  hebrewRegex,
  lineSpacing,
  monogramInfo,
  openPreviewLineIndex,
  previewLines,
  selectedFonts,
  setOpenPreviewLineIndex,
  setTextAlign,
  textAlign,
}) => {
  const hasHebrewText = Boolean(combinedText && hebrewRegex?.test(combinedText));
  const hasReadyPreview =
    typeof hasLivePreviewSelection === 'boolean'
      ? hasLivePreviewSelection
      : Boolean(hasStandardSelection);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(148,180,193,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.994),rgba(240,245,247,0.982))] p-6 shadow-[0_34px_82px_-52px_rgba(28,35,41,0.12)] sm:p-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),transparent)]" />
        <div className="absolute -right-24 top-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(148,180,193,0.18),transparent_72%)]" />
        <div className="absolute left-8 top-2 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(236,239,202,0.18),transparent_72%)]" />
      </div>

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[48rem]">
            <div className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.22)] bg-[rgba(236,239,202,0.72)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#213448] shadow-sm">
              Live Preview
            </div>

            <h2
              className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]"
              style={{ fontFamily: 'Alumni Sans Regular' }}
            >
              Fine-tune your font layout
            </h2>

            <p className="mt-2 text-[15px] leading-7 text-slate-600">
              Choose a font or style for the whole layout, or select one line for focused adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <span className="rounded-full border border-[rgba(148,180,193,0.16)] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
              {hasReadyPreview ? 'Ready to submit' : 'Needs text'}
            </span>
          </div>
        </div>

        {hasHebrewText && <HebrewSupportWarning />}

        {monogramInfo?.htmlString && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Monogram
            </div>
            <MonogramPreview htmlString={monogramInfo.htmlString} />
          </div>
        )}

        <UnifiedPreviewWorkspace
          AlignIcon={AlignIcon}
          fontSize={fontSize}
          getDefaultStyleKey={getDefaultStyleKey}
          getFontOptionByName={getFontOptionByName}
          getSortedStyleKeys={getSortedStyleKeys}
          handleApplyFontToActiveLine={handleApplyFontToActiveLine}
          handleApplyFontToAllLines={handleApplyFontToAllLines}
          handleApplyFontToLine={handleApplyFontToLine}
          handleApplyStyleToAllLines={handleApplyStyleToAllLines}
          handleFontSizeChange={handleFontSizeChange}
          handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
          handleLineSpacingChange={handleLineSpacingChange}
          handleLineStyleChange={handleLineStyleChange}
          lineSpacing={lineSpacing}
          openPreviewLineIndex={openPreviewLineIndex}
          previewLines={previewLines}
          selectedFonts={selectedFonts}
          setOpenPreviewLineIndex={setOpenPreviewLineIndex}
          setTextAlign={setTextAlign}
          textAlign={textAlign}
        />
      </div>
    </section>
  );
};

export default LivePreviewSection;
