import React, { useEffect, useMemo, useState } from 'react';
import FontMixingPanel from './livePreview/FontMixingPanel';
import HebrewSupportWarning from './livePreview/HebrewSupportWarning';
import MonogramPreview from './livePreview/MonogramPreview';
import PreviewModeToggle from './livePreview/PreviewModeToggle';
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
                            <PreviewModeToggle
                                showFontMixingMode={showFontMixingMode}
                                onToggle={() => setIsFontMixingMode((current) => !current)}
                            />
                        )}
                    </div>
                </header>

                <MonogramPreview htmlString={monogramInfo?.htmlString} />

                {showHebrewWarning && <HebrewSupportWarning />}

                {hasStandardSelection ? (
                    showFontMixingMode ? (
                        <FontMixingPanel
                            activeLineFontSize={activeLineFontSize}
                            activePreviewLine={activePreviewLine}
                            activeStyleKeys={activeStyleKeys}
                            AlignIcon={AlignIcon}
                            fontSize={fontSize}
                            getDefaultStyleKey={getDefaultStyleKey}
                            getFontOptionByName={getFontOptionByName}
                            handleApplyFontToActiveLine={handleApplyFontToActiveLine}
                            handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
                            handleLineSpacingChange={handleLineSpacingChange}
                            handleLineStyleChange={handleLineStyleChange}
                            isUsingDefaultLineSize={isUsingDefaultLineSize}
                            lineSpacing={lineSpacing}
                            openPreviewLineIndex={openPreviewLineIndex}
                            safePreviewLines={safePreviewLines}
                            safeSelectedFonts={safeSelectedFonts}
                            setOpenPreviewLineIndex={setOpenPreviewLineIndex}
                            setTextAlign={setTextAlign}
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
                        />
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
