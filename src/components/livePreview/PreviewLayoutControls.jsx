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
    selectedPreviewLine,
    selectedLineFontSize,
    onSelectedLineFontSizeChange,
    onResetSelectedLineFontSize,
}) => {
    const lineSpacingPercent = Math.round(Number(lineSpacing) * 100);
    const hasSelectedLine = Boolean(selectedPreviewLine);
    const lineUsesBaseSize = selectedPreviewLine?.fontSizeOverride == null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center">
                <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">
                        Base size
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
                        min="0.4"
                        max="3"
                        step="0.05"
                        value={lineSpacing}
                        onChange={onLineSpacingChange}
                        className="h-2 w-36 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 lg:w-44"
                    />
                    <span className="w-14 text-left text-sm font-medium text-slate-600">
                        {lineSpacingPercent}%
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

            <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {hasSelectedLine
                                ? `Line ${selectedPreviewLine.lineIndex + 1} size`
                                : 'Line size'}
                        </span>
                        {!hasSelectedLine && (
                            <span className="text-xs text-slate-500">
                                Select a line below to adjust it independently
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onResetSelectedLineFontSize}
                        disabled={!hasSelectedLine || lineUsesBaseSize}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                            !hasSelectedLine || lineUsesBaseSize
                                ? 'cursor-default bg-slate-100 text-slate-400'
                                : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                        }`}
                    >
                        Use base size
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="range"
                        min="12"
                        max="140"
                        step="1"
                        value={selectedLineFontSize}
                        onChange={(event) =>
                            onSelectedLineFontSizeChange(event.target.value)
                        }
                        disabled={!hasSelectedLine}
                        className={`h-2 w-36 appearance-none rounded-lg lg:w-48 ${
                            hasSelectedLine
                                ? 'cursor-pointer bg-slate-200 accent-blue-600'
                                : 'cursor-not-allowed bg-slate-200 accent-slate-300'
                        }`}
                        aria-label={
                            hasSelectedLine
                                ? `Size for line ${selectedPreviewLine.lineIndex + 1}`
                                : 'Select a line to adjust line size'
                        }
                    />
                    <span className={`w-12 text-left text-sm font-medium ${
                        hasSelectedLine ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                        {selectedLineFontSize}px
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PreviewLayoutControls;