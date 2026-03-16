import React, { useEffect, useMemo, useState } from 'react';

const getSafeFontFamilyPreview = (font) => {
    if (!font) return 'inherit';
    if (font.name === 'Alumni Sans') return 'Alumni Sans Regular';

    const firstStyleKey = Object.keys(font.styles || {})[0];
    return firstStyleKey ? font.styles[firstStyleKey] : 'inherit';
};

const formatStyleLabel = (styleKey) =>
    String(styleKey).charAt(0).toUpperCase() + String(styleKey).slice(1);

const normalizePreviewText = (value) => {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (value == null) return '';
    return String(value);
};

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
    lineSpacing = 1,
    textAlign = 'center',
    setTextAlign,
    handleLineSpacingChange,
    handleApplyFontToActiveLine,
    handleLineStyleChange,
    handleLineFontSizeOverrideChange,
    AlignIcon,
}) => {
    const [isFontMixingMode, setIsFontMixingMode] = useState(false);
    const [standardPreviewStyleMap, setStandardPreviewStyleMap] = useState({});

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

    const standardPreviewLines = useMemo(() => {
        if (combinedText && String(combinedText).trim()) {
            return String(combinedText)
                .split('\n')
                .map((line) => line.trimEnd());
        }

        if (safePreviewLines.length > 0) {
            return safePreviewLines.map((line) => normalizePreviewText(line.text));
        }

        return [];
    }, [combinedText, safePreviewLines]);

    useEffect(() => {
        setStandardPreviewStyleMap((current) => {
            const next = { ...current };
            let hasChanges = false;

            safeSelectedFonts.forEach((font) => {
                if (!font?.name) return;

                const styleKeys = getSortedStyleKeys(font.styles || {});
                const fallbackStyleKey =
                    getDefaultStyleKey(font.name) || styleKeys[0] || 'regular';

                if (!next[font.name] || !styleKeys.includes(next[font.name])) {
                    next[font.name] = fallbackStyleKey;
                    hasChanges = true;
                }
            });

            Object.keys(next).forEach((fontName) => {
                const fontStillExists = safeSelectedFonts.some((font) => font?.name === fontName);
                if (!fontStillExists) {
                    delete next[fontName];
                    hasChanges = true;
                }
            });

            return hasChanges ? next : current;
        });
    }, [safeSelectedFonts, getDefaultStyleKey, getSortedStyleKeys]);

    const canUseFontMixing = hasStandardSelection && safePreviewLines.length > 0;
    const showFontMixingMode = isFontMixingMode && canUseFontMixing;

    return (
        <section className="relative overflow-visible rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(252,253,255,0.98),rgba(245,248,252,0.97))] p-6 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.22)] sm:p-7 xl:p-8">
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
                aria-hidden="true"
            >
                <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.07),transparent_72%)]" />
                <div className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),transparent_72%)] blur-3xl" />
                <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.10),transparent_72%)] blur-3xl" />
            </div>

            <div className="relative space-y-5">
                <header className="space-y-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-[50rem]">
                            <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.28)]">
                                Preview Studio
                            </div>

                            <h2
                                className="mt-4 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.2rem]"
                                style={{ fontFamily: 'Alumni Sans Regular' }}
                            >
                                Live Preview
                            </h2>

                            <p className="mt-2 max-w-[44rem] text-[15px] leading-7 text-slate-600">
                                {showFontMixingMode
                                    ? 'Mix fonts line by line with focused controls for composition, spacing, alignment, and size.'
                                    : 'Compare your selected fonts using the standard preview first. Turn on Font Mixing only when you want to build a custom multi-font composition.'}
                            </p>
                        </div>

                        {hasStandardSelection && (
                            <div className="flex flex-col items-start gap-2 lg:items-end">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Preview mode
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFontMixingMode((current) => !current)}
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                        showFontMixingMode
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_24px_-18px_rgba(15,23,42,0.35)]'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                    aria-pressed={showFontMixingMode}
                                >
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            showFontMixingMode ? 'bg-blue-300' : 'bg-slate-300'
                                        }`}
                                    />
                                    {showFontMixingMode ? 'Font Mixing On' : 'Enable Font Mixing'}
                                </button>
                                <p className="max-w-xs text-sm leading-6 text-slate-500 lg:text-right">
                                    {showFontMixingMode
                                        ? 'You are editing one custom composition.'
                                        : 'Standard preview stays simple and shows all selected fonts.'}
                                </p>
                            </div>
                        )}
                    </div>
                </header>

                {monogramInfo?.htmlString && (
                    <div className="overflow-hidden rounded-[1.6rem] border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.82))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_34px_-28px_rgba(37,99,235,0.24)]">
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
                                    Check each preview carefully before submitting your selection.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {hasStandardSelection ? (
                    showFontMixingMode ? (
                        <div className="space-y-4">
                            <div className="relative overflow-visible rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)]">
                                <div className="relative border-b border-slate-200/80 px-5 py-4 sm:px-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Font Mixing
                                            </div>
                                            <div className="mt-1 text-base font-semibold text-slate-900">
                                                Custom composition preview
                                            </div>
                                        </div>

                                        {activePreviewLine && (
                                            <div className="hidden items-center gap-2 rounded-full border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.9))] px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-[0_14px_24px_-20px_rgba(37,99,235,0.26)] sm:inline-flex">
                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                Click any line to switch focus
                                            </div>
                                        )}
                                    </div>

                                    <div className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:block">
                                        <div>
                                            <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                Alignment
                                            </div>

                                            <div className="inline-flex rounded-[1rem] border border-slate-200 bg-slate-100/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                {['left', 'center', 'right'].map((alignment) => (
                                                    <button
                                                        key={alignment}
                                                        type="button"
                                                        onClick={() => setTextAlign(alignment)}
                                                        title={`Align ${alignment}`}
                                                        aria-label={`Align ${alignment}`}
                                                        className={`flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-200 ${
                                                            textAlign === alignment
                                                                ? 'bg-slate-900 text-white shadow-[0_12px_20px_-16px_rgba(15,23,42,0.55)]'
                                                                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                                        }`}
                                                    >
                                                        <AlignIcon align={alignment} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                                    {activePreviewLine && (
                                        <div className="mb-4 lg:hidden">
                                            <div className="mb-4 flex items-center justify-center">
                                                <div>
                                                    <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                        Alignment
                                                    </div>

                                                    <div className="inline-flex rounded-[1rem] border border-slate-200 bg-slate-100/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                        {['left', 'center', 'right'].map((alignment) => (
                                                            <button
                                                                key={`mobile-${alignment}`}
                                                                type="button"
                                                                onClick={() => setTextAlign(alignment)}
                                                                title={`Align ${alignment}`}
                                                                aria-label={`Align ${alignment}`}
                                                                className={`flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-200 ${
                                                                    textAlign === alignment
                                                                        ? 'bg-slate-900 text-white shadow-[0_12px_20px_-16px_rgba(15,23,42,0.55)]'
                                                                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                                                }`}
                                                            >
                                                                <AlignIcon align={alignment} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[1.2rem] border border-slate-200/85 bg-white/96 p-4 shadow-[0_18px_32px_-26px_rgba(15,23,42,0.18)]">
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                            Font
                                                        </div>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {safeSelectedFonts.map((font) => {
                                                                const isActiveFont =
                                                                    activePreviewLine?.fontName === font.name;

                                                                return (
                                                                    <button
                                                                        key={`mobile-focus-font-${font.name}`}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleApplyFontToActiveLine(font.name)
                                                                        }
                                                                        aria-pressed={isActiveFont}
                                                                        className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                                            isActiveFont
                                                                                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_22px_-18px_rgba(15,23,42,0.32)]'
                                                                                : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                                                        }`}
                                                                        style={{
                                                                            fontFamily: getSafeFontFamilyPreview(font),
                                                                        }}
                                                                    >
                                                                        {font.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                            Focus controls
                                                        </div>
                                                        <div className="mt-1 text-base font-semibold text-slate-950">
                                                            Editing line {activePreviewLine.lineIndex + 1}
                                                        </div>
                                                    </div>

                                                    {activeStyleKeys.length > 0 && (
                                                        <div>
                                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                Style
                                                            </div>

                                                            <div className="flex flex-wrap gap-2.5">
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
                                                                            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                                                isActiveStyle
                                                                                    ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.46)]'
                                                                                    : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            {formatStyleLabel(styleKey)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="mb-2 flex items-center justify-between gap-3">
                                                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                Size
                                                            </div>

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
                                                                Use default
                                                            </button>
                                                        </div>

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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activePreviewLine && (
                                        <div className="pointer-events-none absolute top-6 z-[70] hidden xl:block xl:-left-[28.5rem] 2xl:-left-[29.5rem]">
                                            <div className="pointer-events-auto w-[440px] rounded-[1.25rem] border border-slate-300 bg-[rgb(241,245,249)] p-4 shadow-[0_24px_54px_-28px_rgba(15,23,42,0.22)] ring-1 ring-white/70">
                                                <div className="flex items-start gap-3">
                                                    <div className="min-w-0 flex-1 space-y-4">
                                                        <div>
                                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                Font
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {safeSelectedFonts.map((font) => {
                                                                    const isActiveFont =
                                                                        activePreviewLine?.fontName === font.name;

                                                                    return (
                                                                        <button
                                                                            key={`desktop-focus-font-${font.name}`}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleApplyFontToActiveLine(font.name)
                                                                            }
                                                                            aria-pressed={isActiveFont}
                                                                            className={`rounded-full border px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                                                isActiveFont
                                                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_22px_-18px_rgba(15,23,42,0.32)]'
                                                                                    : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                                                            }`}
                                                                            style={{
                                                                                fontFamily: getSafeFontFamilyPreview(font),
                                                                            }}
                                                                        >
                                                                            {font.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                Focus controls
                                                            </div>
                                                            <div className="mt-1 text-base font-semibold text-slate-900">
                                                                Editing line {activePreviewLine.lineIndex + 1}
                                                            </div>
                                                        </div>

                                                        {activeStyleKeys.length > 0 && (
                                                            <div>
                                                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                    Style
                                                                </div>

                                                                <div className="flex flex-wrap gap-2.5">
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
                                                                                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                                                                                    isActiveStyle
                                                                                        ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.40)]'
                                                                                        : 'border-slate-300 bg-white text-slate-700 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                {formatStyleLabel(styleKey)}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                    Size
                                                                </div>

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
                                                                            ? 'cursor-default bg-slate-200 text-slate-400'
                                                                            : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    Use default
                                                                </button>
                                                            </div>

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
                                                        </div>
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
                                        </div>
                                    )}

                                    <div className="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-8">
                                        <div className="min-h-[360px]">
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
                                                    <button
                                                        key={`preview-line-${line.lineIndex}`}
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenPreviewLineIndex(line.lineIndex)
                                                        }
                                                        aria-label={`Select line ${index + 1} for editing`}
                                                        aria-pressed={isSelected}
                                                        className="group block w-full rounded-[0.85rem] bg-transparent text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                                                    >
                                                        <div className="relative px-3 py-3 sm:px-4 sm:py-3.5">
                                                            <span
                                                                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${
                                                                    isSelected
                                                                        ? 'border-blue-200/90 bg-white text-blue-700 shadow-[0_10px_20px_-16px_rgba(37,99,235,0.45)]'
                                                                        : 'border-slate-200 bg-white text-slate-400 opacity-0 group-hover:opacity-100'
                                                                }`}
                                                                aria-hidden="true"
                                                            >
                                                                {index + 1}
                                                            </span>

                                                            <div className="relative mx-auto w-full max-w-[min(100%,56rem)] px-8 sm:px-10">
                                                                <p
                                                                    className={`max-w-full break-words whitespace-pre-wrap text-slate-900 ${
                                                                        isSelected
                                                                            ? 'opacity-100'
                                                                            : 'opacity-88 group-hover:opacity-100'
                                                                    }`}
                                                                    style={{
                                                                        fontFamily: activeFontFamily,
                                                                        fontSize: `${effectiveFontSize}px`,
                                                                        lineHeight: lineSpacing,
                                                                        textAlign,
                                                                        width: '100%',
                                                                        maxWidth: '100%',
                                                                        paddingInline: '0.25rem',
                                                                        overflowWrap: 'anywhere',
                                                                    }}
                                                                    dir="auto"
                                                                >
                                                                    {typeof line.text === 'string' ||
                                                                    typeof line.text === 'number'
                                                                        ? line.text
                                                                        : line.text
                                                                          ? String(line.text)
                                                                          : ' '}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)] sm:p-6">
                                <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Standard Preview
                                        </div>
                                        <div className="mt-1 text-base font-semibold text-slate-900">
                                            Compare your selected fonts
                                        </div>
                                    </div>
                                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                                        This keeps the live-site comparison style front and center, while Font Mixing stays available as the custom composition view.
                                    </p>
                                </div>

                                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
                                    {safeSelectedFonts.length > 0 ? (
                                        <div className="space-y-8">
                                            {safeSelectedFonts.map((font, fontIndex) => {
                                                const fallbackFontFamily = getSafeFontFamilyPreview(font);
                                                const styleKeys = getSortedStyleKeys(font.styles || {});
                                                const displayStyleKeys =
                                                    styleKeys.length > 0 ? styleKeys : ['regular'];
                                                const selectedStyleKey =
                                                    standardPreviewStyleMap[font.name] ||
                                                    getDefaultStyleKey(font.name) ||
                                                    displayStyleKeys[0];
                                                const activeStandardFontFamily =
                                                    font?.styles?.[selectedStyleKey] ||
                                                    fallbackFontFamily;
                                                const standardPreviewFontSize = Math.min(fontSize, 56);

                                                return (
                                                    <div
                                                        key={`standard-preview-${font.name}`}
                                                        className={`space-y-4 ${
                                                            fontIndex !== safeSelectedFonts.length - 1
                                                                ? 'border-b border-slate-200/75 pb-8'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2.5">
                                                            <div
                                                                className="inline-flex rounded-full bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.4)]"
                                                                style={{
                                                                    fontFamily: activeStandardFontFamily,
                                                                }}
                                                            >
                                                                {font.name}
                                                            </div>

                                                            {displayStyleKeys.map((styleKey) => {
                                                                const isActiveStyle =
                                                                    styleKey === selectedStyleKey;

                                                                return (
                                                                    <button
                                                                        key={`${font.name}-${styleKey}`}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setStandardPreviewStyleMap((current) => ({
                                                                                ...current,
                                                                                [font.name]: styleKey,
                                                                            }))
                                                                        }
                                                                        aria-pressed={isActiveStyle}
                                                                        className={`inline-flex rounded-[0.8rem] border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                                            isActiveStyle
                                                                                ? 'border-slate-700 bg-slate-700 text-white shadow-[0_10px_20px_-16px_rgba(15,23,42,0.28)]'
                                                                                : 'border-slate-300 bg-white text-slate-600 hover:-translate-y-px hover:border-slate-400 hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        {formatStyleLabel(styleKey)}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="rounded-[1.15rem] bg-transparent px-1 py-1">
                                                            {standardPreviewLines.length > 0 ? (
                                                                <div
                                                                    className="max-w-[min(100%,34rem)] break-words whitespace-pre-wrap text-slate-900"
                                                                    style={{
                                                                        fontFamily: activeStandardFontFamily,
                                                                        fontSize: `${standardPreviewFontSize}px`,
                                                                        lineHeight: Math.max(lineSpacing, 0.9),
                                                                        textAlign: 'left',
                                                                        overflowWrap: 'anywhere',
                                                                    }}
                                                                    dir="auto"
                                                                >
                                                                    {standardPreviewLines.join('\n')}
                                                                </div>
                                                            ) : (
                                                                <div className="max-w-xs text-sm leading-6 text-slate-400">
                                                                    Enter text above to preview it in {font.name}.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[240px] items-center justify-center text-center">
                                            <div className="max-w-xs text-sm leading-6 text-slate-400">
                                                Select fonts and enter text above to compare them here.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    !monogramInfo && (
                        <div className="min-h-[170px] rounded-[1.55rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(247,249,252,0.98),rgba(239,243,248,0.94))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_24px_40px_-34px_rgba(15,23,42,0.22)]">
                            <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                                <div className="rounded-full border border-slate-200 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
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