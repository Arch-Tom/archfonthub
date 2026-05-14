import PreviewCanvas from './livePreview/PreviewCanvas';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';

const HebrewSupportWarning = () => (
  <div className="rounded-[18px] border border-[#58A068] bg-[#E6F3EA] px-4 py-3 text-sm font-medium leading-6 text-[#347041] shadow-[0_14px_28px_-24px_rgba(39,126,90,0.34)]">
    Please check each preview carefully as Hebrew character support can vary
    between fonts.
  </div>
);

export default function LivePreviewSection({
  AlignIcon,
  customText,
  filigreeSelection,
  fontSize,
  getDefaultStyleKey,
  getFontOptionByName,
  hebrewRegex,
  lineSpacing,
  monogramInfo,
  onFitToPreview,
  onFontSizeChange,
  onLineSelect,
  onLineSpacingChange,
  onResetLayout,
  onTextAlignChange,
  previewLines,
  selectedPreviewLineIndex,
  textAlign,
}) {
  const visiblePreviewLines = Array.isArray(previewLines)
    ? previewLines.filter((line) => line.text.trim() !== '')
    : [];

  const hasText = visiblePreviewLines.length > 0;
  const activeLine = visiblePreviewLines.find(
    (line) => line.lineIndex === selectedPreviewLineIndex
  );
  const activeFont = activeLine
    ? getFontOptionByName?.(activeLine.fontName)
    : null;
  const activeStyleLabel = activeLine?.styleKey
    ? activeLine.styleKey
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : '';

  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-hidden rounded-[28px] border border-white/55 bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_22px_56px_-34px_rgba(30,40,75,0.55)] lg:p-4">
      <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-[#BFD5E8] bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(248,250,252,0.985))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] lg:p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3677B3]">
              Live Preview
            </p>
            <p className="mt-1 text-sm leading-6 text-[#4D5B68]">
              {hasText
                ? activeLine
                  ? `Editing line ${activeLine.lineIndex + 1}: ${activeLine.text}`
                  : 'Click a line in the preview to make it active.'
                : 'Start typing on the left to build your engraving preview.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeFont && (
              <div className="hidden rounded-[13px] border border-[#BFD5E8] bg-[#FFFFFF]/76 px-3 py-2 text-right text-xs leading-5 text-[#478CCA] shadow-[0_10px_22px_-22px_rgba(30,40,75,0.42)] lg:block">
                <span className="font-semibold">{activeFont.name}</span>
                {activeStyleLabel && (
                  <span className="ml-1 text-[#4D5B68]">/ {activeStyleLabel}</span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onFitToPreview}
              disabled={!hasText}
              className="inline-flex items-center gap-2 rounded-[13px] border border-[#BFD5E8] bg-[#FFFFFF]/84 px-3.5 py-2 text-sm font-semibold text-[#3677B3] shadow-[0_12px_24px_-24px_rgba(30,40,75,0.42)] transition-colors hover:border-[#3B9DD6] hover:bg-[#EAF5FC] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Fit to Preview</span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {monogramInfo && !hasText ? (
            <div className="flex h-full min-h-[390px] items-center justify-center rounded-[24px] border border-[#BFD5E8] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-6 shadow-[inset_0_1px_12px_rgba(30,40,75,0.04)] xl:min-h-0">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
              />
            </div>
          ) : (
            <PreviewCanvas
              fontSize={fontSize}
              filigreeSelection={filigreeSelection}
              getDefaultStyleKey={getDefaultStyleKey}
              getFontOptionByName={getFontOptionByName}
              lineSpacing={lineSpacing}
              lines={visiblePreviewLines}
              onLineSelect={onLineSelect}
              selectedPreviewLineIndex={selectedPreviewLineIndex}
              textAlign={textAlign}
            />
          )}
        </div>
      </div>

      {hebrewRegex.test(customText) && <HebrewSupportWarning />}

      <PreviewLayoutControls
        AlignIcon={AlignIcon}
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        onFontSizeChange={onFontSizeChange}
        onLineSpacingChange={onLineSpacingChange}
        onResetLayout={onResetLayout}
        onTextAlignChange={onTextAlignChange}
        textAlign={textAlign}
      />
    </section>
  );
}
