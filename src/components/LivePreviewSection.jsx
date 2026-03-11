import React from 'react';

const getSafeFontFamilyPreview = (font) => {
    if (!font) return 'inherit';
    if (font.name === 'Alumni Sans') return 'Alumni Sans Regular';

    const firstStyleKey = Object.keys(font.styles || {})[0];
    return firstStyleKey ? font.styles[firstStyleKey] : 'inherit';
};

const formatStyleLabel = (styleKey) =>
    String(styleKey).charAt(0).toUpperCase() + String(styleKey).slice(1);

const LivePreviewSection = ({
    monogramInfo,
    combinedText = '',
    hebrewRegex,
    hasStandardSelection = false,
    previewLines = [],
    openPreviewLineIndex = 0,
    setOpenPreviewLineIndex,
    selectedFonts = [],
    getFontOptionByName,
    getDefaultStyleKey,
    getSortedStyleKeys,
    fontSize = 36,
    lineSpacing = 1.2,
    textAlign = 'left',
    setTextAlign,
    handleLineSpacingChange,
    handleApplyFontToActiveLine,
    handleLineStyleChange,
    handleLineFontSizeOverrideChange,
    AlignIcon,
}) => {
    const safePreviewLines = Array.isArray(previewLines) ? previewLines : [];
    const safeSelectedFonts = Array.isArray(selectedFonts) ? selectedFonts : [];
    const activePreviewLine =
        safePreviewLines.find((line) => line.lineIndex === openPreviewLineIndex) ||
        safePreviewLines[0] ||
        null;

    const activeFont = activePreviewLine ? getFontOptionByName(activePreviewLine.fontName) : null;
    const activeStyleKeys = activeFont ? getSortedStyleKeys(activeFont.styles) : [];
    const activeLineFontSize = activePreviewLine?.fontSizeOverride ?? fontSize;
    const isUsingDefaultLineSize = activePreviewLine?.fontSizeOverride == null;
    const showHebrewWarning = hebrewRegex instanceof RegExp && hebrewRegex.test(combinedText);

    return (
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(250,252,255,0.98),rgba(243,247,252,0.96))] p-8 shadow-[0_36px_90px_-46px_rgba(15,23,42,0.30),0_18px_34px_-28px_rgba(59,130,246,0.10)]">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_72%)]" />
                <div className="absolute -right-12 top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.10),transparent_70%)] blur-3xl" />
            </div>

            <div className="relative mb-6 space-y-5">
                <div className="max-w-[44rem]">
                    <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.32)]">
                        Preview Studio
                    </div>

                    <h2
                        className="mt-4 text-3xl font-bold tracking-normal text-slate-950"
                        style={{ fontFamily: 'Alumni Sans Regular' }}
                    >
                        Live Preview
                    </h2>

                    <p className="mt-2 max-w-[40rem] text-[15px] leading-7 text-slate-600">
                        Shape the final look in real time. Click any line below to fine-tune its
                        font, style, and size with a cleaner, more focused preview flow.
                    </p>
                </div>

                <div className="rounded-[1.55rem] border border-slate-200/70 bg-white/70 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_28px_-26px_rgba(15,23,42,0.18)] backdrop-blur">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="rounded-[1.2rem] border border-slate-200/80 bg-white/92 px-4 py-3.5 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.18)]">
                            <div className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor="lineSpacingSlider"
                                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                                >
                                    Line Spacing
                                </label>

                                <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                                    {Number(lineSpacing).toFixed(1)}
                                </span>
                            </div>

                            <div className="mt-3">
                                <input
                                    id="lineSpacingSlider"
                                    type="range"
                                    min="1"
                                    max="2"
                                    step="0.1"
                                    value={lineSpacing}
                                    onChange={handleLineSpacingChange}
                                    className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-[1.2rem] border border-slate-200/80 bg-white/92 px-3 py-3 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.18)]">
                            <span className="pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Align
                            </span>

                            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                                {['left', 'center', 'right'].map((alignment) => (
                                    <button
                                        key={alignment}
                                        type="button"
                                        onClick={() => setTextAlign(alignment)}
                                        title={`Align ${alignment}`}
                                        aria-label={`Align ${alignment}`}
                                        className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                                            textAlign === alignment
                                                ? 'bg-slate-800 text-white shadow-[0_12px_20px_-16px_rgba(15,23,42,0.55)]'
                                                : 'text-slate-600 hover:bg-white hover:text-slate-800'
                                        }`}
                                    >
                                        <AlignIcon align={alignment} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative space-y-5">
                {monogramInfo?.htmlString && (
                    <div className="overflow-hidden rounded-[1.55rem] border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.82))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_24px_36px_-30px_rgba(37,99,235,0.24)]">
                        <div className="flex h-[220px] items-center justify-center rounded-[1.2rem] border border-white/70 bg-white/55 p-4">
                            <div
                                className="h-full w-full"
                                dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
                            />
                        </div>
                    </div>
                )}

                {showHebrewWarning && (
                    <div
                        className="rounded-[1.2rem] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(254,243,199,0.78))] p-4 shadow-[0_12px_24px_-22px_rgba(180,83,9,0.28)]"
                        role="alert"
                    >
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 pt-0.5">
                                <svg
                                    className="h-5 w-5 text-amber-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    Hebrew character support can vary between fonts.
                                </p>
                                <p className="mt-1 text-sm text-amber-800/90">
                                    Please check each preview carefully before submitting.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {hasStandardSelection ? (
                    <div className="overflow-hidden rounded-[1.85rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(247,249,252,0.98),rgba(239,243,248,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_28px_46px_-38px_rgba(15,23,42,0.24)] ring-1 ring-white/70">
                        {activePreviewLine && (
                            <div className="border-b border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,251,253,0.78))] px-5 py-4 sm:px-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Editing Line
                                            </div>
                                            <div className="mt-1 text-base font-semibold text-slate-900">
                                                Line {activePreviewLine.lineIndex + 1}
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                            Active focus
                                        </span>
                                    </div>

                                    <div className="space-y-3 rounded-[1.35rem] border border-slate-200/75 bg-white/96 p-4 shadow-[0_14px_28px_-26px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.96)]">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                    Font
                                                </span>

                                                {safeSelectedFonts.map((font) => {
                                                    const isActiveFont = activePreviewLine.fontName === font.name;

                                                    return (
                                                        <button
                                                            key={font.name}
                                                            type="button"
                                                            onClick={() => handleApplyFontToActiveLine(font.name)}
                                                            aria-pressed={isActiveFont}
                                                            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                                                                isActiveFont
                                                                    ? 'border-slate-800 bg-slate-800 text-white shadow-[0_14px_22px_-18px_rgba(15,23,42,0.48)]'
                                                                    : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                            style={{ fontFamily: getSafeFontFamilyPreview(font) }}
                                                            title={`Apply ${font.name} to line ${activePreviewLine.lineIndex + 1}`}
                                                        >
                                                            {font.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {activeStyleKeys.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                        Style
                                                    </span>

                                                    {activeStyleKeys.map((styleKey) => {
                                                        const isActiveStyle =
                                                            activePreviewLine.styleKey === styleKey;

                                                        return (
                                                            <button
                                                                key={styleKey}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleLineStyleChange(
                                                                        activePreviewLine.lineIndex,
                                                                        styleKey
                                                                    )
                                                                }
                                                                aria-pressed={isActiveStyle}
                                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                                    isActiveStyle
                                                                        ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_22px_-18px_rgba(37,99,235,0.48)]'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                {formatStyleLabel(styleKey)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex min-w-[16rem] flex-1 flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Size
                                            </span>

                                            <div className="flex min-w-[12rem] flex-1 items-center gap-3 rounded-[1.05rem] border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]">
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
                                                    className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:outline-none"
                                                    aria-label={`Size for line ${activePreviewLine.lineIndex + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleLineFontSizeOverrideChange(
                                                            activePreviewLine.lineIndex,
                                                            null
                                                        )
                                                    }
                                                    disabled={isUsingDefaultLineSize}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                        isUsingDefaultLineSize
                                                            ? 'cursor-default bg-slate-100 text-slate-400'
                                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    Default
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-5 py-6 sm:px-6 sm:py-7">
                            <div className="rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,251,253,0.68))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                <div className="space-y-2">
                                    {safePreviewLines.map((line, index) => {
                                        const font = getFontOptionByName(line.fontName);
                                        const fallbackStyleKey = getDefaultStyleKey(line.fontName);
                                        const activeFontFamily =
                                            font?.styles?.[line.styleKey] ||
                                            font?.styles?.[fallbackStyleKey] ||
                                            'inherit';
                                        const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                                        const isSelected = openPreviewLineIndex === line.lineIndex;

                                        return (
                                            <div
                                                key={`preview-line-${line.lineIndex}`}
                                                className="group relative"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenPreviewLineIndex(line.lineIndex)}
                                                    className={`relative block w-full overflow-hidden rounded-[1.5rem] text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                                                        isSelected
                                                            ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,251,253,0.95))] shadow-[0_22px_36px_-30px_rgba(15,23,42,0.22),0_10px_20px_-18px_rgba(59,130,246,0.12)]'
                                                            : 'bg-transparent hover:bg-white/45'
                                                    }`}
                                                    aria-label={`Select line ${index + 1} for editing`}
                                                    aria-pressed={isSelected}
                                                >
                                                    {isSelected && (
                                                        <>
                                                            <span
                                                                className="pointer-events-none absolute inset-y-6 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 via-blue-500 to-slate-700"
                                                                aria-hidden="true"
                                                            />
                                                            <span
                                                                className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.72),rgba(255,255,255,0.15)_58%,transparent_78%)]"
                                                                aria-hidden="true"
                                                            />
                                                        </>
                                                    )}

                                                    <div
                                                        className={`relative flex items-start gap-4 ${
                                                            isSelected
                                                                ? 'px-5 py-6 sm:px-6 sm:py-7'
                                                                : 'px-5 py-5 sm:px-6 sm:py-6'
                                                        }`}
                                                    >
                                                        <div className="flex w-10 flex-shrink-0 justify-center pt-1">
                                                            <span
                                                                className={`inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
                                                                    isSelected
                                                                        ? 'bg-slate-900 text-white shadow-[0_10px_20px_-14px_rgba(15,23,42,0.5)]'
                                                                        : 'border border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700'
                                                                }`}
                                                            >
                                                                {index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                                <div
                                                                    className={`h-px flex-1 ${
                                                                        isSelected
                                                                            ? 'bg-gradient-to-r from-slate-200/90 to-transparent'
                                                                            : 'bg-gradient-to-r from-slate-200/70 to-transparent'
                                                                    }`}
                                                                />
                                                                {isSelected && (
                                                                    <span className="rounded-full border border-slate-200/80 bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                                        Editing now
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex justify-center">
                                                                <p
                                                                    className={`min-w-0 max-w-full break-words transition-colors ${
                                                                        isSelected
                                                                            ? 'text-slate-950'
                                                                            : 'text-slate-800'
                                                                    }`}
                                                                    style={{
                                                                        fontFamily: activeFontFamily,
                                                                        fontSize: `${effectiveFontSize}px`,
                                                                        lineHeight: lineSpacing,
                                                                        textAlign,
                                                                        width: '100%',
                                                                    }}
                                                                    dir="auto"
                                                                >
                                                                    {typeof line.text === 'string' ||
                                                                    typeof line.text === 'number'
                                                                        ? line.text
                                                                        : line.text
                                                                          ? String(line.text)
                                                                          : '\u00A0'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    !monogramInfo && (
                        <div className="min-h-[170px] rounded-[1.55rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(247,249,252,0.98),rgba(239,243,248,0.94))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_24px_40px_-34px_rgba(15,23,42,0.22)]">
                            <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                                <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                                    Waiting for input
                                </div>
                                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                                    Select fonts and enter text above to see your live preview here.
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

export default LivePreviewSection;