import React, { useEffect, useMemo, useState } from 'react';
import FontMixingPanel from './livePreview/FontMixingPanel';
import HebrewSupportWarning from './livePreview/HebrewSupportWarning';
import MonogramPreview from './livePreview/MonogramPreview';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';
import StandardPreviewPanel from './livePreview/StandardPreviewPanel';
import { normalizePreviewText } from './livePreview/utils';

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
    handleFontSizeChange,
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

    const modeLabel = showFontMixingMode ? 'Font Mixing Mode' : 'Standard Mode';
    const modeDescription = showFontMixingMode
        ? 'Shape a custom multi-font composition with line-by-line control.'
        : 'Compare each selected font in a dramatic specimen-style gallery.';

    return (
        <section className="relative overflow-visible rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.97)_48%,rgba(49,46,129,0.9)_100%)] p-6 shadow-[0_40px_90px_-48px_rgba(15,23,42,0.95)] sm:p-7 xl:p-8">
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.2rem]"
                aria-hidden="true"
            >
                <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_72%)]" />
                <div className="absolute -left-20 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_72%)] blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.16),transparent_72%)] blur-3xl" />
            </div>

            <div className="relative space-y-6">
                <header className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.48),rgba(30,41,59,0.36))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-[46rem]">
                            <div className="inline-flex items-center rounded-full border border-sky-300/15 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100 shadow-sm">
                                Preview Studio
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h2
                                    className="text-[2rem] font-bold tracking-tight text-white sm:text-[2.35rem]"
                                    style={{ fontFamily: 'Alumni Sans Regular' }}
                                >
                                    Live Preview
                                </h2>

                                <span className="inline-flex items-center rounded-full border border-fuchsia-300/15 bg-fuchsia-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100">
                                    {modeLabel}
                                </span>
                            </div>

                            <p className="mt-2 max-w-[42rem] text-[15px] leading-7 text-slate-300">
                                {modeDescription}
                            </p>
                        </div>

                        <div className="xl:min-w-[18rem]">
                            <div className="rounded-[1.35rem] border border-white/10 bg-black/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Preview Mode
                                </div>

                                <div className="grid grid-cols-2 gap-2 rounded-[1.1rem] bg-white/[0.04] p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsFontMixingMode(false)}
                                        className={`rounded-[0.95rem] px-4 py-2.5 text-sm font-semibold transition-all ${
                                            !showFontMixingMode
                                                ? 'bg-[linear-gradient(180deg,#38bdf8,#2563eb)] text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.85)]'
                                                : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                        }`}
                                        aria-pressed={!showFontMixingMode}
                                    >
                                        Standard
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => canUseFontMixing && setIsFontMixingMode(true)}
                                        disabled={!canUseFontMixing}
                                        className={`rounded-[0.95rem] px-4 py-2.5 text-sm font-semibold transition-all ${
                                            showFontMixingMode
                                                ? 'bg-[linear-gradient(180deg,#d946ef,#7c3aed)] text-white shadow-[0_14px_24px_-18px_rgba(168,85,247,0.85)]'
                                                : canUseFontMixing
                                                  ? 'text-slate-300 hover:bg-white/8 hover:text-white'
                                                  : 'cursor-not-allowed text-slate-500'
                                        }`}
                                        aria-pressed={showFontMixingMode}
                                        aria-disabled={!canUseFontMixing}
                                    >
                                        Font Mixing
                                    </button>
                                </div>

                                <p className="mt-3 px-1 text-xs leading-5 text-slate-400">
                                    Standard is for bold comparison. Font Mixing is for composition.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <MonogramPreview htmlString={monogramInfo?.htmlString} />

                {showHebrewWarning && <HebrewSupportWarning />}

                {hasStandardSelection ? (
                    <>
                        <PreviewLayoutControls
                            activeLineFontSize={activeLineFontSize}
                            activePreviewLine={activePreviewLine}
                            AlignIcon={AlignIcon}
                            fontSize={fontSize}
                            handleFontSizeChange={handleFontSizeChange}
                            handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
                            handleLineSpacingChange={handleLineSpacingChange}
                            isFontMixingMode={showFontMixingMode}
                            isUsingDefaultLineSize={isUsingDefaultLineSize}
                            lineSpacing={lineSpacing}
                            setTextAlign={setTextAlign}
                            textAlign={textAlign}
                        />

                        {showFontMixingMode ? (
                            <FontMixingPanel
                                activeLineFontSize={activeLineFontSize}
                                activePreviewLine={activePreviewLine}
                                activeStyleKeys={activeStyleKeys}
                                fontSize={fontSize}
                                getDefaultStyleKey={getDefaultStyleKey}
                                getFontOptionByName={getFontOptionByName}
                                handleApplyFontToActiveLine={handleApplyFontToActiveLine}
                                handleLineStyleChange={handleLineStyleChange}
                                lineSpacing={lineSpacing}
                                openPreviewLineIndex={openPreviewLineIndex}
                                safePreviewLines={safePreviewLines}
                                safeSelectedFonts={safeSelectedFonts}
                                setOpenPreviewLineIndex={setOpenPreviewLineIndex}
                                textAlign={textAlign}
                            />
                        ) : (
                            <StandardPreviewPanel
                                fontSize={fontSize}
                                getDefaultStyleKey={getDefaultStyleKey}
                                getSortedStyleKeys={getSortedStyleKeys}
                                lineSpacing={lineSpacing}
                                safeSelectedFonts={safeSelectedFonts}
                                setStandardPreviewStyleMap={setStandardPreviewStyleMap}
                                standardPreviewLines={standardPreviewLines}
                                standardPreviewStyleMap={standardPreviewStyleMap}
                                textAlign={textAlign}
                            />
                        )}
                    </>
                ) : (
                    !monogramInfo && (
                        <div className="min-h-[170px] rounded-[1.55rem] border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                                    Waiting for input
                                </div>
                                <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                                    Select fonts and enter text above to bring the preview studio to life.
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