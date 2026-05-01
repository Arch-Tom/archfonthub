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
  const alignmentClasses = getAlignmentClasses(textAlign);

  if (!hasLines) {
    return (
      <div className="relative flex h-full min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-[22px] border border-[#D8CEC0] bg-[radial-gradient(circle_at_top,rgba(255,253,248,0.98),rgba(251,251,250,0.98)_58%,rgba(234,243,244,0.96))] px-6 text-center shadow-[inset_0_1px_12px_rgba(24,57,90,0.04)] xl:min-h-0">
        <div className="pointer-events-none absolute inset-0 opacity-55">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,253,248,0.95),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(181,138,58,0.13),transparent_42%)]" />
        </div>

        <div className="relative">
          <svg
            className="mx-auto mb-3 h-11 w-11 text-[#B58A3A]"
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
          <p className="text-lg font-semibold text-[#245E73]">
            Your preview will appear here
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-[#66737A]">
            Start typing on the left to preview your engraving. Placeholder
            examples stay non-editable until you enter real text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[390px] items-center justify-center overflow-hidden rounded-[22px] border border-[#D8CEC0] bg-[radial-gradient(circle_at_top,rgba(255,253,248,0.985),rgba(251,251,250,0.985)_55%,rgba(234,243,244,0.96))] px-5 py-8 shadow-[inset_0_1px_12px_rgba(24,57,90,0.045)] lg:px-7 xl:min-h-0">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,253,248,0.96),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(181,138,58,0.14),transparent_42%)]" />
        <div className="absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-[#D8CEC0] to-transparent" />
        <div className="absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-[#D8CEC0] to-transparent" />
      </div>

      <div
        className={`relative flex w-full max-w-[94%] flex-col ${alignmentClasses}`}
      >
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
            <button
              key={`preview-line-${line.lineIndex}`}
              type="button"
              onClick={() => onLineSelect?.(line.lineIndex)}
              aria-label={`Select line ${displayIndex + 1} for editing`}
              aria-pressed={isSelected}
              className={`group max-w-full bg-transparent py-0 text-inherit transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245E73]/45 ${
                textAlign === 'right'
                  ? 'self-end'
                  : textAlign === 'left'
                    ? 'self-start'
                    : 'self-center'
              }`}
              style={{ marginBottom: `${gapAfter}px` }}
            >
              <span
                className={`inline-block max-w-full whitespace-pre-wrap break-words rounded-[24px] px-[0.3em] py-[0.1em] text-[#17212B] transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#FFFDF8]/70 shadow-[0_0_0_1px_rgba(255,253,248,0.96),0_22px_34px_-28px_rgba(20,39,58,0.62)]'
                    : 'group-hover:bg-[#FFFDF8]/40'
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
          );
        })}
      </div>
    </div>
  );
};

export default PreviewCanvas;
