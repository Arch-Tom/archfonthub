import React from 'react';

const ALIGNMENTS = ['left', 'center', 'right'];

const PreviewLayoutControls = ({
  AlignIcon,
  fontSize,
  lineSpacing,
  onFontSizeChange,
  onLineSpacingChange,
  onResetLayout,
  onTextAlignChange,
  textAlign,
}) => {
  return (
    <div className="rounded-[22px] border border-[#dfd6c7] bg-[rgba(251,248,241,0.96)] px-3 py-3 shadow-[0_18px_40px_-34px_rgba(20,39,58,0.35)]">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-center">
        <div className="rounded-[16px] border border-[#e0d8ca] bg-white/72 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-[#315171]">Text Size</p>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="text-[1.5rem] leading-none text-[#17324d]">A</span>
            <input
              id="fontSizeSlider"
              type="range"
              min="24"
              max="90"
              step="1"
              value={fontSize}
              onChange={onFontSizeChange}
              className="preview-range flex-1"
            />
            <span className="text-[1.05rem] leading-none text-[#17324d]">A</span>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#e0d8ca] bg-white/72 px-3.5 py-2.5">
          <p className="text-sm font-semibold text-[#315171]">Spacing</p>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="text-[1.05rem] leading-none text-[#17324d]">A.A</span>
            <input
              id="lineSpacingSlider"
              type="range"
              min="0.65"
              max="1.8"
              step="0.05"
              value={lineSpacing}
              onChange={onLineSpacingChange}
              className="preview-range flex-1"
            />
            <span className="text-[1.05rem] leading-none text-[#17324d]">A.A</span>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#e0d8ca] bg-white/72 px-3.5 py-2.5">
          <p className="mb-2.5 text-sm font-semibold text-[#315171]">Align</p>
          <div className="inline-flex overflow-hidden rounded-[13px] border border-[#d7cfbf] bg-white">
            {ALIGNMENTS.map((alignment) => (
              <button
                key={alignment}
                type="button"
                onClick={() => onTextAlignChange(alignment)}
                className={`flex h-10 w-11 items-center justify-center transition-colors ${
                  textAlign === alignment
                    ? 'bg-[#6c7343] text-white'
                    : 'bg-white text-[#315171] hover:bg-[#f3efdf]'
                }`}
                title={`Align ${alignment}`}
                aria-label={`Align ${alignment}`}
                aria-pressed={textAlign === alignment}
              >
                {React.createElement(AlignIcon, { align: alignment })}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onResetLayout}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-transparent px-3 py-2.5 text-sm font-semibold text-[#315171] transition-colors hover:border-[#d7cfbf] hover:bg-white/78"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4V9H9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.9 13A6.5 6.5 0 1011.5 5.75"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.45 8.35A8 8 0 016.8 6.1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 9.25V12.5L14.2 13.8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default PreviewLayoutControls;
