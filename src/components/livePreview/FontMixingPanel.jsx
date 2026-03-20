import React from 'react';
import ActiveLineControls from './ActiveLineControls';
import PreviewLineList from './PreviewLineList';
import { getSafeFontFamilyPreview } from './utils';

const renderMixingSampleText = (activePreviewLine, safePreviewLines) => {
    if (activePreviewLine?.text != null && String(activePreviewLine.text).trim()) {
        return String(activePreviewLine.text);
    }

    const joined = safePreviewLines
        .map((line) => (line?.text == null ? '' : String(line.text)))
        .filter((value) => value.trim())
        .join('\n');

    return joined || 'Select a line to apply this font.';
};

const FontMixingPanel = ({
    activeLineFontSize,
    activePreviewLine,
    activeStyleKeys,
    AlignIcon,
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    handleApplyFontToActiveLine,
    handleLineFontSizeOverrideChange,
    handleLineSpacingChange,
    handleLineStyleChange,
    isUsingDefaultLineSize,
    lineSpacing,
    openPreviewLineIndex,
    safePreviewLines,
    safeSelectedFonts,
    setOpenPreviewLineIndex,
    setTextAlign,
    textAlign,
}) => {
    const mixingSampleText = renderMixingSampleText(activePreviewLine, safePreviewLines);

    return (
        <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)] sm:p-6">
                <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-[36rem]">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Font Mixing
                            </div>
                            <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                                Assign selected fonts to individual lines
                            </div>
                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                The composition stays in the same flow. Select a line, tune its
                                settings, then apply fonts from the shared font area below.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.9))] px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-[0_14px_24px_-20px_rgba(37,99,235,0.26)]">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            {activePreviewLine
                                ? `Editing line ${activePreviewLine.lineIndex + 1}`
                                : 'Select a line to begin'}
                        </div>
                    </div>

                    {activePreviewLine && (
                        <ActiveLineControls
                            activeLineFontSize={activeLineFontSize}
                            activePreviewLine={activePreviewLine}
                            activeStyleKeys={activeStyleKeys}
                            AlignIcon={AlignIcon}
                            handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
                            handleLineSpacingChange={handleLineSpacingChange}
                            handleLineStyleChange={handleLineStyleChange}
                            isUsingDefaultLineSize={isUsingDefaultLineSize}
                            lineSpacing={lineSpacing}
                            setTextAlign={setTextAlign}
                            textAlign={textAlign}
                        />
                    )}
                </div>

                <div className="mt-5 space-y-5">
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
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

                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-6 sm:py-6">
                        {safeSelectedFonts.length > 0 ? (
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Selected Fonts
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            Apply a font to the active line
                                        </div>
                                    </div>

                                    <p className="max-w-md text-xs leading-5 text-slate-500">
                                        Same area, different behavior: in Standard this is for
                                        comparison, in Font Mixing it assigns fonts to the selected
                                        line.
                                    </p>
                                </div>

                                {safeSelectedFonts.map((font) => {
                                    const fallbackFontFamily = getSafeFontFamilyPreview(font);
                                    const fallbackStyleKey =
                                        getDefaultStyleKey(font.name) || 'regular';
                                    const sampleFontFamily =
                                        font?.styles?.[fallbackStyleKey] || fallbackFontFamily;
                                    const isActiveFont =
                                        activePreviewLine?.fontName === font.name;

                                    return (
                                        <section
                                            key={`mixing-font-${font.name}`}
                                            className={`rounded-[1.35rem] border p-4 shadow-[0_20px_36px_-30px_rgba(15,23,42,0.14)] transition-all sm:p-5 ${
                                                isActiveFont
                                                    ? 'border-blue-200/90 bg-[linear-gradient(180deg,rgba(239,246,255,0.86),rgba(248,250,252,0.9))]'
                                                    : 'border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))]'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <div
                                                            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold shadow-[0_12px_22px_-18px_rgba(15,23,42,0.4)] ${
                                                                isActiveFont
                                                                    ? 'border border-blue-600 bg-blue-600 text-white'
                                                                    : 'border border-slate-800/90 bg-slate-800 text-white'
                                                            }`}
                                                            style={{ fontFamily: sampleFontFamily }}
                                                        >
                                                            {font.name}
                                                        </div>

                                                        {isActiveFont && (
                                                            <span className="inline-flex items-center rounded-full border border-blue-100/80 bg-blue-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                                                                Applied to active line
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleApplyFontToActiveLine(font.name)
                                                        }
                                                        disabled={!activePreviewLine}
                                                        className={`inline-flex items-center justify-center rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition-all ${
                                                            !activePreviewLine
                                                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                                : isActiveFont
                                                                  ? 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                                                                  : 'bg-slate-900 text-white shadow-[0_12px_22px_-18px_rgba(15,23,42,0.34)] hover:-translate-y-px'
                                                        }`}
                                                    >
                                                        {activePreviewLine
                                                            ? `Apply to line ${activePreviewLine.lineIndex + 1}`
                                                            : 'Select a line first'}
                                                    </button>
                                                </div>

                                                <div className="rounded-[1.1rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(249,251,253,0.9))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-5 sm:py-5">
                                                    <div
                                                        className="max-w-[min(100%,38rem)] break-words whitespace-pre-wrap text-slate-900"
                                                        style={{
                                                            fontFamily: sampleFontFamily,
                                                            fontSize: `${Math.min(
                                                                activeLineFontSize || fontSize,
                                                                72
                                                            )}px`,
                                                            lineHeight: Math.max(lineSpacing, 0.9),
                                                            textAlign,
                                                            overflowWrap: 'anywhere',
                                                        }}
                                                        dir="auto"
                                                    >
                                                        {mixingSampleText}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex min-h-[220px] items-center justify-center text-center">
                                <div className="max-w-xs text-sm leading-6 text-slate-400">
                                    Select fonts above to assign them to individual preview lines
                                    here.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FontMixingPanel;