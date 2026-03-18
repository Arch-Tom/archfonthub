import React from 'react';
import ActiveLineControls from './ActiveLineControls';
import PreviewLineList from './PreviewLineList';

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
}) => (
    <div className="space-y-4">
        <div className="overflow-hidden rounded-[1.85rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.99),rgba(242,246,250,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_28px_54px_-38px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200/75 bg-white/35 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-[40rem]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Font Mixing
                        </div>
                        <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                            Build a custom multi-font composition
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                            Select a line, adjust its styling, then compare the full composition
                            below.
                        </p>
                    </div>

                    {activePreviewLine && (
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.9))] px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-[0_14px_24px_-20px_rgba(37,99,235,0.26)]">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Click any line to switch focus
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                <div className="space-y-5">
                    {activePreviewLine && (
                        <div className="rounded-[1.45rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.12)] sm:p-5">
                            <ActiveLineControls
                                activeLineFontSize={activeLineFontSize}
                                activePreviewLine={activePreviewLine}
                                activeStyleKeys={activeStyleKeys}
                                AlignIcon={AlignIcon}
                                handleApplyFontToActiveLine={handleApplyFontToActiveLine}
                                handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
                                handleLineSpacingChange={handleLineSpacingChange}
                                handleLineStyleChange={handleLineStyleChange}
                                isUsingDefaultLineSize={isUsingDefaultLineSize}
                                lineSpacing={lineSpacing}
                                safeSelectedFonts={safeSelectedFonts}
                                setTextAlign={setTextAlign}
                                textAlign={textAlign}
                            />
                        </div>
                    )}

                    <div className="rounded-[1.6rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,251,253,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_20px_40px_-34px_rgba(15,23,42,0.14)] sm:p-5">
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

export default FontMixingPanel;