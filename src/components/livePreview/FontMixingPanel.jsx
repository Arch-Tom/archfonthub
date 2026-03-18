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
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_50px_-36px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6">
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
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                {activePreviewLine && (
                    <div className="mb-4">
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
);

export default FontMixingPanel;
