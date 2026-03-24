import React from 'react';
import PreviewLineList from './PreviewLineList';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const renderMixingSampleText = (activePreviewLine, safePreviewLines) => {
    if (activePreviewLine?.text != null && String(activePreviewLine.text).trim()) {
        return String(activePreviewLine.text);
    }

    const joined = safePreviewLines
        .map((line) => (line?.text == null ? '' : String(line.text)))
        .filter((value) => value.trim())
        .join('\n');

    return joined || 'Sample';
};

const FontMixingPanel = ({
    activeLineFontSize,
    activePreviewLine,
    activeStyleKeys,
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    handleApplyFontToActiveLine,
    handleLineStyleChange,
    lineSpacing,
    openPreviewLineIndex,
    safePreviewLines,
    safeSelectedFonts,
    setOpenPreviewLineIndex,
    textAlign,
}) => {
    const mixingSampleText = renderMixingSampleText(activePreviewLine, safePreviewLines);
    const activeLineNumber = activePreviewLine ? activePreviewLine.lineIndex + 1 : null;
    const activeFontName = activePreviewLine?.fontName || null;

    return (
        <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96)_45%,rgba(49,46,129,0.88)_100%)] p-4 shadow-[0_36px_80px_-44px_rgba(15,23,42,0.9)] sm:p-5">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-[34rem]">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fuchsia-200/80">
                            Font Mixing
                        </div>
                        <div className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-[1.1rem]">
                            Build a custom composition line by line
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-slate-300">
                            Select a line, assign a font, change its style, and shape the composition like a real specimen layout.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-fuchsia-300/15 bg-fuchsia-400/10 px-3 py-1.5 text-[11px] font-semibold text-fuchsia-100 shadow-[0_12px_20px_-16px_rgba(192,38,211,0.45)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                        {activePreviewLine ? `Editing line ${activeLineNumber}` : 'Select a line'}
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Active target
                                    </span>

                                    {activePreviewLine ? (
                                        <span className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                                            Line {activeLineNumber}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            No line selected
                                        </span>
                                    )}

                                    {activeFontName && (
                                        <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                            {activeFontName}
                                        </span>
                                    )}
                                </div>

                                {activePreviewLine && activeStyleKeys.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
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
                                                    className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                                                        isActiveStyle
                                                            ? 'border-fuchsia-300/25 bg-[linear-gradient(180deg,#a855f7,#7c3aed)] text-white shadow-[0_12px_18px_-16px_rgba(168,85,247,0.8)]'
                                                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/16 hover:bg-white/8 hover:text-white'
                                                    }`}
                                                >
                                                    {formatStyleLabel(styleKey)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {safeSelectedFonts.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {safeSelectedFonts.map((font) => {
                                        const fallbackFontFamily = getSafeFontFamilyPreview(font);
                                        const fallbackStyleKey =
                                            getDefaultStyleKey(font.name) || 'regular';
                                        const sampleFontFamily =
                                            font?.styles?.[fallbackStyleKey] || fallbackFontFamily;
                                        const isActiveFont =
                                            activePreviewLine?.fontName === font.name;

                                        return (
                                            <button
                                                key={`mixing-font-${font.name}`}
                                                type="button"
                                                onClick={() =>
                                                    activePreviewLine &&
                                                    handleApplyFontToActiveLine(font.name)
                                                }
                                                disabled={!activePreviewLine}
                                                aria-pressed={isActiveFont}
                                                className={`group overflow-hidden rounded-[1.15rem] border p-3 text-left transition-all duration-200 ${
                                                    !activePreviewLine
                                                        ? 'cursor-not-allowed border-white/8 bg-white/[0.03] opacity-70'
                                                        : isActiveFont
                                                          ? 'border-sky-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(59,130,246,0.12),rgba(168,85,247,0.14))] shadow-[0_20px_28px_-24px_rgba(56,189,248,0.55)]'
                                                          : 'border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] hover:-translate-y-px hover:border-white/14 hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                <div className="flex h-full flex-col gap-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-[0_10px_18px_-16px_rgba(15,23,42,0.5)] ${
                                                                isActiveFont
                                                                    ? 'border border-sky-300/25 bg-slate-950/85 text-white'
                                                                    : 'border border-white/10 bg-slate-950/80 text-white'
                                                            }`}
                                                            style={{ fontFamily: sampleFontFamily }}
                                                        >
                                                            {font.name}
                                                        </span>

                                                        {isActiveFont ? (
                                                            <span className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                                                                Applied
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors group-hover:text-slate-300">
                                                                Select
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className="line-clamp-2 min-h-[2.65rem] break-words whitespace-pre-wrap text-white"
                                                        style={{
                                                            fontFamily: sampleFontFamily,
                                                            fontSize: `${Math.min(
                                                                Math.max(
                                                                    (activeLineFontSize || fontSize) *
                                                                        0.42,
                                                                    16
                                                                ),
                                                                26
                                                            )}px`,
                                                            lineHeight: Math.max(lineSpacing, 0.96),
                                                            textAlign,
                                                            overflowWrap: 'anywhere',
                                                        }}
                                                        dir="auto"
                                                    >
                                                        {mixingSampleText}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-[68px] items-center justify-center rounded-[0.95rem] border border-dashed border-white/10 bg-white/[0.03] px-4 text-center">
                                    <div className="max-w-xs text-sm leading-5 text-slate-400">
                                        Select fonts above to assign them to preview lines.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/8 pt-4">
                            <PreviewLineList
                                fontSize={fontSize}
                                getDefaultStyleKey={getDefaultStyleKey}
                                getFontOptionByName={getFontOptionByName}
                                lineSpacing={lineSpacing}
                                openPreviewLineIndex={openPreviewLineIndex}
                                safePreviewLines={safePreviewLines}
                                setOpenPreviewLineIndex={setOpenPreviewLineIndex}
                                textAlign={textAlign}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FontMixingPanel;