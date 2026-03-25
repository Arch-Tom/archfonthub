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
        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.18)] sm:p-5">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-[34rem]">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Font Mixing
                        </div>
                        <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-[1.1rem]">
                            Build the layout one line at a time
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            Select a line, apply a font, and adjust its style while keeping the full
                            composition easy to read.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                        {activePreviewLine ? `Editing line ${activeLineNumber}` : 'Select a line'}
                    </div>
                </div>

                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                        Active target
                                    </span>

                                    {activePreviewLine ? (
                                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                            Line {activeLineNumber}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            No line selected
                                        </span>
                                    )}

                                    {activeFontName && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
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
                                                            ? 'border-slate-900 bg-slate-900 text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
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
                                        const isActiveFont = activePreviewLine?.fontName === font.name;

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
                                                className={`group overflow-hidden rounded-[1rem] border p-3 text-left transition-all duration-200 ${
                                                    !activePreviewLine
                                                        ? 'cursor-not-allowed border-slate-200 bg-white opacity-70'
                                                        : isActiveFont
                                                          ? 'border-slate-900 bg-white shadow-[0_14px_28px_-24px_rgba(15,23,42,0.3)]'
                                                          : 'border-slate-200 bg-white hover:-translate-y-px hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex h-full flex-col gap-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
                                                                isActiveFont
                                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                                                            }`}
                                                            style={{ fontFamily: sampleFontFamily }}
                                                        >
                                                            {font.name}
                                                        </span>

                                                        {isActiveFont ? (
                                                            <span className="inline-flex items-center rounded-full border border-slate-900 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                                                                Applied
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors group-hover:text-slate-700">
                                                                Select
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="rounded-[0.9rem] border border-slate-200 bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                                        <div
                                                            className="line-clamp-2 min-h-[2.65rem] break-words whitespace-pre-wrap text-slate-900"
                                                            style={{
                                                                fontFamily: sampleFontFamily,
                                                                fontSize: `${Math.min(
                                                                    Math.max(
                                                                        (activeLineFontSize || fontSize) * 0.42,
                                                                        16
                                                                    ),
                                                                    24
                                                                )}px`,
                                                                lineHeight: Math.max(lineSpacing, 0.96),
                                                                textAlign,
                                                                overflowWrap: 'anywhere',
                                                                color: '#0f172a',
                                                            }}
                                                            dir="auto"
                                                        >
                                                            {mixingSampleText}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-[68px] items-center justify-center rounded-[0.95rem] border border-dashed border-slate-200 bg-white px-4 text-center">
                                    <div className="max-w-xs text-sm leading-5 text-slate-500">
                                        Select fonts above to assign them to preview lines.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200 pt-4">
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
