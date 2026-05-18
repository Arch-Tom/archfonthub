import {
  getFiligreeInsertIndex,
  getFiligreePreset,
  getFiligreeSize,
  hasActiveFiligree,
} from '../../constants/filigreeConfig';

const renderLineText = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value) return String(value);
  return ' ';
};

const getAlignmentClasses = (textAlign) => {
  if (textAlign === 'left') return 'items-start text-left';
  if (textAlign === 'right') return 'items-end text-right';
  return 'items-center text-center';
};

const PreviewCanvas = ({
  filigreeSelection,
  fontSize,
  getDefaultStyleKey,
  getFontOptionByName,
  lineSpacing,
  lines = [],
  onLineSelect,
  selectedPreviewLineIndex,
  textAlign,
}) => {
  const visibleLines = Array.isArray(lines)
    ? lines.filter((line) => line.text.trim() !== '')
    : [];
  const hasLines = visibleLines.length > 0;
  const showFiligree = hasActiveFiligree(filigreeSelection);
  const filigreePreset = getFiligreePreset(filigreeSelection?.presetId);
  const filigreeSize = getFiligreeSize(filigreeSelection?.size);
  const filigreeInsertIndex = showFiligree
    ? getFiligreeInsertIndex(filigreeSelection?.placement, visibleLines.length)
    : -1;
  const alignmentClasses = getAlignmentClasses(textAlign);

  const renderFiligree = (key) => (
    <div
      key={key}
      className="pointer-events-none flex w-full justify-center py-2 text-[#232124]"
      aria-hidden="true"
    >
      <svg
        viewBox={filigreePreset.viewBox}
        fill="none"
        style={{
          width: `${filigreeSize.previewWidth}px`,
          maxWidth: '72%',
          height: `${filigreeSize.previewHeight}px`,
        }}
      >
        {filigreePreset.paths.map((path) => (
          <path
            key={path.d}
            d={path.d}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );

  if (!hasLines && !showFiligree) {
    return (
      <div className="relative flex h-full min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-[22px] border border-[#BFD5E8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(248,250,252,0.98)_58%,rgba(234,245,252,0.96))] px-6 text-center shadow-[inset_0_1px_12px_rgba(30,40,75,0.04)] xl:min-h-0">
        <div className="pointer-events-none absolute inset-0 opacity-55">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(88,160,104,0.13),transparent_42%)]" />
        </div>

        <div className="relative">
          <svg
            className="mx-auto mb-3 h-11 w-11 text-[#58A068]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <p className="text-lg font-semibold text-[#3677B3]">
            Your preview will appear here
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-[#4D5B68]">
            Start typing on the left to preview your engraving. Placeholder
            examples stay non-editable until you enter real text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[390px] items-center justify-center overflow-hidden rounded-[22px] border border-[#BFD5E8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.985),rgba(248,250,252,0.985)_55%,rgba(234,245,252,0.96))] px-5 py-8 shadow-[inset_0_1px_12px_rgba(30,40,75,0.045)] lg:px-7 xl:min-h-0">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(88,160,104,0.14),transparent_42%)]" />
        <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-[#BFD5E8] to-transparent" />
        <div className="absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-[#BFD5E8] to-transparent" />
      </div>

      <div
        className={`relative flex w-full max-w-[94%] flex-col ${alignmentClasses}`}
      >
        {showFiligree &&
          filigreeInsertIndex === 0 &&
          renderFiligree('filigree-before')}

        {visibleLines.map((line, displayIndex) => {
          const font = getFontOptionByName?.(line.fontName);
          const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);
          const activeFontFamily =
            font?.styles?.[line.styleKey] ||
            font?.styles?.[fallbackStyleKey] ||
            'inherit';
          const effectiveFontSize = line.fontSizeOverride ?? fontSize;
          const isSelected = selectedPreviewLineIndex === line.lineIndex;
          const gapAfter =
            displayIndex === visibleLines.length - 1
              ? 0
              : Math.max(0, (Number(lineSpacing) - 1) * effectiveFontSize);

          return (
            <div
              key={`preview-row-${line.lineIndex}`}
              className={`flex flex-col ${
                textAlign === 'right'
                  ? 'items-end'
                  : textAlign === 'left'
                    ? 'items-start'
                    : 'items-center'
              }`}
            >
              <button
                type="button"
                onClick={() => onLineSelect?.(line.lineIndex)}
                aria-label={`Select line ${displayIndex + 1} for editing`}
                aria-pressed={isSelected}
                className={`group max-w-full bg-transparent py-0 text-inherit transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#478CCA]/45 ${
                  textAlign === 'right'
                    ? 'self-end'
                    : textAlign === 'left'
                      ? 'self-start'
                      : 'self-center'
                }`}
                style={{ marginBottom: `${gapAfter}px` }}
              >
                <span
                  className={`inline-block max-w-full whitespace-pre-wrap break-words rounded-[24px] px-[0.3em] py-[0.1em] text-[#232124] transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#FFFFFF]/70 shadow-[0_0_0_1px_rgba(255,255,255,0.96),0_22px_34px_-28px_rgba(30,40,75,0.62)]'
                      : 'group-hover:bg-[#FFFFFF]/40'
                  }`}
                  style={{
                    fontFamily: activeFontFamily,
                    fontSize: `${effectiveFontSize}px`,
                    lineHeight: 1.04,
                    overflowWrap: 'anywhere',
                    textAlign,
                  }}
                  dir="auto"
                >
                  {renderLineText(line.text)}
                </span>
              </button>

              {showFiligree &&
                filigreeInsertIndex === displayIndex + 1 &&
                renderFiligree(`filigree-after-${line.lineIndex}`)}
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default PreviewCanvas;
