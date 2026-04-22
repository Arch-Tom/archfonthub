import PreviewCanvas from './livePreview/PreviewCanvas';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';

const HebrewSupportWarning = () => (
  <div className="rounded-[20px] border border-[#dfd2ae] bg-[#f7f0d8] px-4 py-3 text-sm font-medium leading-6 text-[#7a5c1a] shadow-[0_14px_28px_-24px_rgba(122,92,26,0.5)]">
    Please check each preview carefully as Hebrew character support can vary
    between fonts.
  </div>
);

export default function LivePreviewSection({
  AlignIcon,
  customText,
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

  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-[30px] border border-[#dfd6c7] bg-[rgba(251,248,241,0.94)] p-4 shadow-[0_20px_52px_-36px_rgba(20,39,58,0.35)] lg:p-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-[26px] border border-[#e2d8c8] bg-[linear-gradient(180deg,rgba(254,252,247,0.98),rgba(248,244,236,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] lg:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e7085]">
              Live Preview
            </p>
            <p className="mt-1 text-sm text-[#6d7783]">
              Click a line in the preview to make it active.
            </p>
          </div>

          <button
            type="button"
            onClick={onFitToPreview}
            className="rounded-[14px] border border-[#d9cfbf] bg-white/78 px-4 py-2 text-sm font-semibold text-[#315171] shadow-[0_12px_24px_-24px_rgba(20,39,58,0.45)] transition-colors hover:border-[#a69a82] hover:bg-white"
          >
            Fit to Preview
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {monogramInfo && !hasText ? (
            <div className="flex h-full min-h-[380px] items-center justify-center rounded-[24px] border border-[#e6ddcf] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,234,0.96))] p-6 shadow-[inset_0_1px_12px_rgba(24,57,90,0.04)]">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
              />
            </div>
          ) : (
            <PreviewCanvas
              fontSize={fontSize}
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
