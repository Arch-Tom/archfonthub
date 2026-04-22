const renderLineText = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value) return String(value);
  return ' ';
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
  const hasLines =
    Array.isArray(lines) && lines.some((line) => line.text.trim() !== '');

  if (!hasLines) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-[#e6ddcf] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,234,0.96))] text-center shadow-[inset_0_1px_12px_rgba(24,57,90,0.04)]">
        <svg
          className="mb-4 h-12 w-12 text-[#b7b1a4]"
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
        <p className="text-lg font-semibold text-[#576272]">Your preview is empty</p>
        <p className="mt-1 text-sm text-[#7d8793]">
          Add your text and choose fonts on the left to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[24px] border border-[#e6ddcf] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(248,243,234,0.98)_58%,rgba(243,237,227,0.98))] px-5 py-8 shadow-[inset_0_1px_12px_rgba(24,57,90,0.04)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(227,219,204,0.35),transparent_40%)]" />
      </div>

      <div className="relative inline-flex w-full max-w-[92%] flex-col items-stretch">
        {lines.map((line, displayIndex) => {
          const font = getFontOptionByName?.(line.fontName);
          const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);
          const activeFontFamily =
            font?.styles?.[line.styleKey] ||
            font?.styles?.[fallbackStyleKey] ||
            'inherit';
          const effectiveFontSize = line.fontSizeOverride ?? fontSize;
          const isSelected = selectedPreviewLineIndex === line.lineIndex;
          const gapAfter =
            displayIndex === lines.length - 1
              ? 0
              : Math.max(0, (Number(lineSpacing) - 1) * effectiveFontSize);

          return (
            <button
              key={`preview-line-${line.lineIndex}`}
              type="button"
              onClick={() => onLineSelect?.(line.lineIndex)}
              aria-label={`Select line ${displayIndex + 1} for editing`}
              aria-pressed={isSelected}
              className="group w-full bg-transparent py-1 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9ba96c]/50"
              style={{ marginBottom: `${gapAfter}px` }}
            >
              <span className="block w-full" style={{ textAlign }}>
                <span
                  className={`inline-block max-w-full whitespace-pre-wrap break-words rounded-[28px] px-[0.32em] py-[0.14em] text-[#123a63] transition-all ${
                    isSelected
                      ? 'bg-white/62 shadow-[0_0_0_1px_rgba(255,255,255,0.95),0_22px_34px_-28px_rgba(18,58,99,0.65)]'
                      : 'group-hover:bg-white/34'
                  }`}
                  style={{
                    fontFamily: activeFontFamily,
                    fontSize: `${effectiveFontSize}px`,
                    lineHeight: 1.05,
                    overflowWrap: 'anywhere',
                  }}
                  dir="auto"
                >
                  {renderLineText(line.text)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewCanvas;
