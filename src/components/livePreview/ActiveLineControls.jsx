import React from 'react';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const ActiveLineControls = ({
    activeLineFontSize,
    activePreviewLine,
    activeStyleKeys,
    handleApplyFontToActiveLine,
    handleLineFontSizeOverrideChange,
    handleLineSpacingChange,
    handleLineStyleChange,
    isUsingDefaultLineSize,
    layout,
    lineSpacing,
    safeSelectedFonts,
}) => {
    if (!activePreviewLine) return null;

    const isDesktop = layout === 'desktop';
    const fontLabelContainerClassName = isDesktop ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap gap-2.5';
    const fontButtonClassName = (isActiveFont) =>
        `rounded-full border ${isDesktop ? 'px-2.5 py-2' : 'px-3.5 py-2'} text-sm font-medium transition-all duration-200 ${
            isActiveFont
                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_22px_-18px_rgba(15,23,42,0.32)]'
                : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
        }`;
    const focusTitleColorClassName = isDesktop ? 'text-slate-900' : 'text-slate-950';
    const inactiveStyleClassName = isDesktop
        ? 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
        : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50';
    const activeStyleShadowClassName = isDesktop
        ? 'shadow-[0_14px_24px_-18px_rgba(37,99,235,0.40)]'
        : 'shadow-[0_14px_24px_-18px_rgba(37,99,235,0.46)]';
    const defaultButtonClassName = isDesktop
        ? isUsingDefaultLineSize
            ? 'cursor-default bg-slate-200 text-slate-400'
            : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
        : isUsingDefaultLineSize
          ? 'cursor-default bg-slate-100 text-slate-400'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50';

    const renderFontSection = () => (
        <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Font
            </div>
            <div className={fontLabelContainerClassName}>
                {safeSelectedFonts.map((font) => {
                    const isActiveFont = activePreviewLine.fontName === font.name;

                    return (
                        <button
                            key={`${layout}-focus-font-${font.name}`}
                            type="button"
                            onClick={() => handleApplyFontToActiveLine(font.name)}
                            aria-pressed={isActiveFont}
                            className={fontButtonClassName(isActiveFont)}
                            style={{ fontFamily: getSafeFontFamilyPreview(font) }}
                        >
                            {font.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderFocusSection = () => (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Focus controls
            </div>
            <div className={`mt-1 text-base font-semibold ${focusTitleColorClassName}`}>
                Editing line {activePreviewLine.lineIndex + 1}
            </div>
        </div>
    );

    const renderStyleSection = () => {
        if (activeStyleKeys.length === 0) return null;

        return (
            <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Style
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {activeStyleKeys.map((styleKey) => {
                        const isActiveStyle = activePreviewLine.styleKey === styleKey;

                        return (
                            <button
                                key={styleKey}
                                type="button"
                                onClick={() =>
                                    handleLineStyleChange(activePreviewLine.lineIndex, styleKey)
                                }
                                aria-pressed={isActiveStyle}
                                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                    isActiveStyle
                                        ? `border-blue-500 bg-blue-600 text-white ${activeStyleShadowClassName}`
                                        : inactiveStyleClassName
                                }`}
                            >
                                {formatStyleLabel(styleKey)}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSizeSection = () => (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Size
                </div>

                <button
                    type="button"
                    onClick={() =>
                        handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, null)
                    }
                    disabled={isUsingDefaultLineSize}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${defaultButtonClassName}`}
                >
                    Use default
                </button>
            </div>

            {isDesktop ? (
                <div className="space-y-3 rounded-[1rem] border border-slate-200 bg-white px-3 py-3">
                    <input
                        type="range"
                        min="12"
                        max="160"
                        step="1"
                        value={activeLineFontSize}
                        onChange={(e) =>
                            handleLineFontSizeOverrideChange(
                                activePreviewLine.lineIndex,
                                e.target.value
                            )
                        }
                        className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                        aria-label={`Adjust size for line ${activePreviewLine.lineIndex + 1}`}
                    />
                    <input
                        type="number"
                        min="12"
                        step="1"
                        value={activeLineFontSize}
                        onChange={(e) =>
                            handleLineFontSizeOverrideChange(
                                activePreviewLine.lineIndex,
                                e.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-400 focus:outline-none"
                        aria-label={`Size for line ${activePreviewLine.lineIndex + 1}`}
                    />
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-white px-3 py-3">
                    <input
                        type="range"
                        min="12"
                        max="160"
                        step="1"
                        value={activeLineFontSize}
                        onChange={(e) =>
                            handleLineFontSizeOverrideChange(
                                activePreviewLine.lineIndex,
                                e.target.value
                            )
                        }
                        className="h-2.5 min-w-[8rem] flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                        aria-label={`Adjust size for line ${activePreviewLine.lineIndex + 1}`}
                    />
                    <input
                        type="number"
                        min="12"
                        step="1"
                        value={activeLineFontSize}
                        onChange={(e) =>
                            handleLineFontSizeOverrideChange(
                                activePreviewLine.lineIndex,
                                e.target.value
                            )
                        }
                        className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:outline-none"
                        aria-label={`Size for line ${activePreviewLine.lineIndex + 1}`}
                    />
                </div>
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <div className="pointer-events-auto w-[440px] rounded-[1.25rem] border border-slate-300 bg-[rgb(241,245,249)] p-4 shadow-[0_24px_54px_-28px_rgba(15,23,42,0.22)] ring-1 ring-white/70">
                <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-4">
                        {renderFontSection()}
                        {renderFocusSection()}
                        {renderStyleSection()}
                        {renderSizeSection()}
                    </div>

                    <div className="flex min-h-[320px] w-[56px] flex-col items-center justify-between rounded-[1rem] border border-slate-200 bg-white px-2 py-3">
                        <div className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 [writing-mode:vertical-rl] [text-orientation:mixed]">
                            Spacing
                        </div>

                        <div className="flex flex-1 items-center justify-center">
                            <input
                                id="desktopLineSpacingSlider"
                                type="range"
                                min="0.05"
                                max="3"
                                step="0.05"
                                value={lineSpacing}
                                onChange={handleLineSpacingChange}
                                className="h-2.5 w-[180px] cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 rotate-90"
                                aria-label="Adjust line spacing"
                            />
                        </div>

                        <span className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                            {Number(lineSpacing).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[1.2rem] border border-slate-200/85 bg-white/96 p-4 shadow-[0_18px_32px_-26px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col gap-4">
                {renderFontSection()}
                {renderFocusSection()}
                {renderStyleSection()}
                {renderSizeSection()}
            </div>
        </div>
    );
};

export default ActiveLineControls;
