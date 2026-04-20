import React from 'react';

const ALIGNMENTS = ['left', 'center', 'right'];

const PreviewLayoutControls = ({
    AlignIcon,
    fontSize,
    lineSpacing,
    onFontSizeChange,
    onLineSpacingChange,
    onTextAlignChange,
    textAlign,
}) => (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">
                Size
            </label>
            <input
                id="fontSizeSlider"
                type="range"
                min="36"
                max="100"
                step="1"
                value={fontSize}
                onChange={onFontSizeChange}
                className="h-2 w-36 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 lg:w-48"
            />
            <span className="w-12 text-left text-sm font-medium text-slate-600">
                {fontSize}px
            </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="lineSpacingSlider" className="text-sm font-medium text-slate-600">
                Line spacing
            </label>
            <input
                id="lineSpacingSlider"
                type="range"
                min="1"
                max="2.2"
                step="0.05"
                value={lineSpacing}
                onChange={onLineSpacingChange}
                className="h-2 w-36 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 lg:w-44"
            />
            <span className="w-10 text-left text-sm font-medium text-slate-600">
                {Number(lineSpacing).toFixed(2)}
            </span>
        </div>

        <div className="inline-flex w-fit overflow-hidden rounded-lg border border-slate-300">
            {ALIGNMENTS.map((alignment) => (
                <button
                    key={alignment}
                    type="button"
                    onClick={() => onTextAlignChange(alignment)}
                    className={`flex h-10 w-11 items-center justify-center transition-colors ${
                        textAlign === alignment
                            ? 'bg-slate-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
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
);

export default PreviewLayoutControls;
