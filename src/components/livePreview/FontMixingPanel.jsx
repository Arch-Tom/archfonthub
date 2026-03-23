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
        <div className="rounded-[1.45rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_20px_40px_-34px_rgba(15,23,42,0.16)] sm:p-4">
            <div className="space-y-3">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-[34rem]">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Font Mixing
                        </div>
                        <div className="mt-0.5 text-[15px] font-semibold tracking-tight text-slate-900 sm:text-base">
                            Build the composition line by line
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.9))] px-3 py-1 text-[11px] font-semibold text-blue-800 shadow-[0_10px_20px_-18px_rgba(37,99,235,0.26)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {activePreviewLine ? `Editing line ${activeLineNumber}` : 'Select a line'}
                    </div>
                </div>

                <div className="rounded-[1.15rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.74))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] sm:p-4">
                    <div className="space-y-3">
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Active
                                    </span>

                                    {activePreviewLine ? (
                                        <span className="inline-flex items-center rounded-full border border-blue-100/80 bg-blue-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                                            Line {activeLineNumber}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            No line selected
                                        </span>
                                    )}

                                    {activeFontName && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
                                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                                                        isActiveStyle
                                                            ? 'border-blue-500 bg-blue-600 text-white shadow-[0_10px_18px_-16px_rgba(37,99,235,0.38)]'
                                                            : 'border-slate-200/90 bg-white/92 text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
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
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
                                                className={`group rounded-[0.95rem] border p-2.5 text-left transition-all duration-200 ${
                                                    !activePreviewLine
                                                        ? 'cursor-not-allowed border-slate-200/70 bg-slate-50/80 opacity-70'
                                                        : isActiveFont
                                                          ? 'border-blue-200/90 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(248,250,252,0.92))] shadow-[0_14px_24px_-22px_rgba(37,99,235,0.2)]'
                                                          : 'border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] hover:-translate-y-px hover:border-slate-300/90 hover:bg-white'
                                                }`}
                                            >
                                                <div className="flex h-full flex-col gap-2">
                                                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-[0_10px_18px_-16px_rgba(15,23,42,0.36)] ${
                                                                isActiveFont
                                                                    ? 'border border-blue-600 bg-blue-600 text-white'
                                                                    : 'border border-slate-800/90 bg-slate-800 text-white'
                                                            }`}
                                                            style={{ fontFamily: sampleFontFamily }}
                                                        >
                                                            {font.name}
                                                        </span>

                                                        {isActiveFont ? (
                                                            <span className="inline-flex items-center rounded-full border border-blue-100/80 bg-blue-50/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                                                                Applied
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white/92 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors group-hover:text-slate-500">
                                                                Select
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className="line-clamp-2 min-h-[2.45rem] break-words whitespace-pre-wrap text-slate-900"
                                                        style={{
                                                            fontFamily: sampleFontFamily,
                                                            fontSize: `${Math.min(
                                                                Math.max(
                                                                    (activeLineFontSize || fontSize) *
                                                                        0.38,
                                                                    15
                                                                ),
                                                                22
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
                                <div className="flex min-h-[68px] items-center justify-center rounded-[0.95rem] border border-dashed border-slate-200/80 bg-white/55 px-4 text-center">
                                    <div className="max-w-xs text-sm leading-5 text-slate-400">
                                        Select fonts above to assign them to preview lines.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200/80 pt-3">
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