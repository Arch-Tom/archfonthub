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

    const modeLabel = showFontMixingMode ? 'Font Mixing' : 'Standard Preview';
    const modeDescription = showFontMixingMode
        ? 'Choose a line, assign a font, and fine-tune the composition.'
        : 'Compare your selected fonts in a clean gallery before mixing them line by line.';

    return (
        <section className="relative overflow-visible rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] sm:p-6 xl:p-7">
            <div className="relative space-y-4">
                <header className="rounded-[1.5rem] border border-slate-200 bg-white/90 px-5 py-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22)] sm:px-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="max-w-[44rem]">
                            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                                Preview Studio
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h2
                                    className="text-[1.95rem] font-bold tracking-tight text-slate-900 sm:text-[2.2rem]"
                                    style={{ fontFamily: 'Alumni Sans Regular' }}
                                >
                                    Live Preview
                                </h2>

                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                                    {modeLabel}
                                </span>
                            </div>

                            <p className="mt-2 max-w-[40rem] text-[15px] leading-7 text-slate-600">
                                {modeDescription}
                            </p>
                        </div>

                        <div className="w-full xl:w-auto xl:min-w-[17rem]">
                            <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-2.5">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFontMixingMode(false)}
                                        className={`rounded-[0.95rem] px-4 py-2.5 text-sm font-semibold transition-all ${
                                            !showFontMixingMode
                                                ? 'bg-slate-900 text-white shadow-[0_10px_18px_-14px_rgba(15,23,42,0.45)]'
                                                : 'text-slate-600 hover:bg-white hover:text-slate-900'
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
                                                ? 'bg-slate-900 text-white shadow-[0_10px_18px_-14px_rgba(15,23,42,0.45)]'
                                                : canUseFontMixing
                                                  ? 'text-slate-600 hover:bg-white hover:text-slate-900'
                                                  : 'cursor-not-allowed text-slate-400'
                                        }`}
                                        aria-pressed={showFontMixingMode}
                                        aria-disabled={!canUseFontMixing}
                                    >
                                        Font Mixing
                                    </button>
                                </div>
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
                        <div className="min-h-[170px] rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]">
                            <div className="flex h-full min-h-[110px] flex-col items-center justify-center text-center">
                                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                                    Waiting for input
                                </div>
                                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
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
