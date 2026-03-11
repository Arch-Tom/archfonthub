import React from 'react';

const LivePreviewSection = ({
    monogramInfo,
    combinedText,
    hebrewRegex,
    hasStandardSelection,
    previewLines,
    openPreviewLineIndex,
    setOpenPreviewLineIndex,
    selectedFonts,
    getFontOptionByName,
    getDefaultStyleKey,
    getSortedStyleKeys,
    fontSize,
    lineSpacing,
    textAlign,
    setTextAlign,
    handleFontSizeChange,
    handleLineSpacingChange,
    handleApplyFontToActiveLine,
    handleLineStyleChange,
    handleLineFontSizeOverrideChange,
    AlignIcon,
}) => {
    const activePreviewLine = previewLines.find(line => line.lineIndex === openPreviewLineIndex) || previewLines[0];
    const activeFont = activePreviewLine ? getFontOptionByName(activePreviewLine.fontName) : null;
    const activeStyleKeys = activeFont ? getSortedStyleKeys(activeFont.styles) : [];
    const activeLineFontSize = activePreviewLine?.fontSizeOverride ?? fontSize;
    const isUsingDefaultLineSize = activePreviewLine?.fontSizeOverride == null;

    return (
        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
            <div className="mb-5 space-y-4">
                <div className="max-w-[42rem]">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Live Preview</h2>
                    <p className="text-slate-500 mt-1">
                        Here's your text preview. When you're happy with your selection hit the button below!
                        If you don't like a font feel free to deselect it above and try a new one out!
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.9))] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_-18px_rgba(15,23,42,0.22)]">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem] md:gap-4">
                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor="fontSizeSlider" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Size</label>
                                <span className="inline-flex min-w-[4.25rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                                    {fontSize}
                                </span>
                            </div>
                            <input
                                id="fontSizeSlider"
                                type="range"
                                min="36"
                                max="100"
                                step="1"
                                value={fontSize}
                                onChange={handleFontSizeChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor="lineSpacingSlider" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Spacing</label>
                                <span className="inline-flex min-w-[4.25rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                                    {lineSpacing.toFixed(1)}
                                </span>
                            </div>
                            <input
                                id="lineSpacingSlider"
                                type="range"
                                min="1"
                                max="2"
                                step="0.1"
                                value={lineSpacing}
                                onChange={handleLineSpacingChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)] md:justify-self-end md:w-full md:max-w-[18rem]">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Alignment</span>
                                <span className="inline-flex min-w-[4.75rem] items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold capitalize text-slate-700 shadow-sm">
                                    {textAlign}
                                </span>
                            </div>
                            <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                                {(['left', 'center', 'right']).map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => setTextAlign(a)}
                                        className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center ${textAlign === a
                                            ? 'bg-slate-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                                            : 'bg-transparent text-slate-600 hover:bg-white/80'
                                            }`}
                                        title={`Align ${a}`}
                                        aria-label={`Align ${a}`}
                                    >
                                        <AlignIcon align={a} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="space-y-5">
                {monogramInfo && (
                    <div className="rounded-[1.35rem] border border-blue-200 bg-blue-50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_-24px_rgba(15,23,42,0.22)] flex justify-center items-center h-[200px]">
                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }} />
                    </div>
                )}

                {hebrewRegex.test(combinedText) && (
                    <div className="p-4 mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800 font-medium">
                                    Please check each preview carefully as Hebrew character support can vary between fonts.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {hasStandardSelection ? (
                    <>
                        {activePreviewLine && (
                            <div className="rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_26px_-24px_rgba(15,23,42,0.25)]">
                                <div className="text-sm font-semibold text-slate-700">
                                    Editing line {activePreviewLine.lineIndex + 1}
                                </div>

                                <div className="mt-2.5 space-y-2.5">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFonts.map((font) => {
                                            const isActiveFont = activePreviewLine.fontName === font.name;

                                            return (
                                                <button
                                                    key={font.name}
                                                    type="button"
                                                    onClick={() => handleApplyFontToActiveLine(font.name)}
                                                    className={`min-w-[9.5rem] rounded-xl border px-3.5 py-2.5 text-left transition-all ${isActiveFont
                                                        ? 'border-[rgb(50,75,106)] bg-[rgb(50,75,106)] text-white shadow-[0_10px_22px_-18px_rgba(50,75,106,0.8)]'
                                                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    aria-pressed={isActiveFont}
                                                    title={`Apply ${font.name} to line ${activePreviewLine.lineIndex + 1}`}
                                                >
                                                    <div
                                                        className={`text-base leading-tight ${isActiveFont ? 'text-white' : 'text-slate-800'}`}
                                                        style={{
                                                            fontFamily: font.name === 'Alumni Sans'
                                                                ? 'Alumni Sans Regular'
                                                                : font.styles[Object.keys(font.styles)[0]]
                                                        }}
                                                    >
                                                        {font.name}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {activeStyleKeys.map((styleKey) => {
                                            const isActiveStyle = activePreviewLine.styleKey === styleKey;

                                            return (
                                                <button
                                                    key={styleKey}
                                                    type="button"
                                                    onClick={() => handleLineStyleChange(activePreviewLine.lineIndex, styleKey)}
                                                    className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors ${isActiveStyle
                                                        ? 'border-slate-700 bg-slate-700 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    aria-pressed={isActiveStyle}
                                                >
                                                    {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Size</span>
                                        <input
                                            type="range"
                                            min="12"
                                            max="160"
                                            step="1"
                                            value={activeLineFontSize}
                                            onChange={(e) => handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, e.target.value)}
                                            className="h-2 min-w-[10rem] flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                                            aria-label={`Adjust size for line ${activePreviewLine.lineIndex + 1}`}
                                        />
                                        <input
                                            type="number"
                                            min="12"
                                            step="1"
                                            value={activeLineFontSize}
                                            onChange={(e) => handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, e.target.value)}
                                            className="w-14 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:outline-none"
                                            aria-label={`Size for line ${activePreviewLine.lineIndex + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleLineFontSizeOverrideChange(activePreviewLine.lineIndex, null)}
                                            disabled={isUsingDefaultLineSize}
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${isUsingDefaultLineSize
                                                ? 'cursor-default bg-slate-100 text-slate-400'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            Use Default
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-[1.35rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(226,232,240,0.88))] p-5 sm:p-6 min-h-[150px] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_-24px_rgba(15,23,42,0.35)] ring-1 ring-white/70">
                            <div className="space-y-1">
                            {previewLines.map((line, index) => {
                                const font = getFontOptionByName(line.fontName);
                                const activeFontFamily = font?.styles[line.styleKey] || font?.styles[getDefaultStyleKey(line.fontName)] || 'inherit';
                                const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                                const isControlsOpen = openPreviewLineIndex === line.lineIndex;

                                return (
                                    <div
                                        key={`preview-line-${line.lineIndex}`}
                                        className="group relative"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenPreviewLineIndex(line.lineIndex)}
                                            className="block w-full px-0 py-2 text-left"
                                            aria-label={`Edit line ${index + 1}`}
                                            aria-pressed={isControlsOpen}
                                        >
                                            <div className="relative flex items-start gap-3">
                                                <span
                                                    className={`mt-[0.8em] h-3 w-3 flex-shrink-0 rounded-full border transition-all duration-200 ${isControlsOpen
                                                        ? 'border-blue-300 bg-white shadow-[0_0_0_4px_rgba(191,219,254,0.7)]'
                                                        : 'border-transparent bg-transparent group-hover:border-slate-300/70'
                                                        }`}
                                                    aria-hidden="true"
                                                />
                                                {isControlsOpen && (
                                                    <span
                                                        className="pointer-events-none absolute inset-x-4 -inset-y-1 rounded-[1.5rem] bg-[radial-gradient(circle_at_left_center,rgba(191,219,254,0.5),rgba(191,219,254,0.12)_40%,transparent_72%)]"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <p
                                                    className={`relative min-w-0 flex-1 break-words text-slate-800 transition-colors ${isControlsOpen ? 'text-slate-900' : ''}`}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        fontFamily: activeFontFamily,
                                                        fontSize: `${effectiveFontSize}px`,
                                                        lineHeight: lineSpacing,
                                                        textAlign: textAlign,
                                                    }}
                                                    dir="auto"
                                                >
                                                    {line.text || '\u00A0'}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    </>
                ) : (
                    !monogramInfo && (
                        <div className="rounded-[1.35rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(226,232,240,0.88))] p-5 sm:p-6 min-h-[150px] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_-24px_rgba(15,23,42,0.35)] ring-1 ring-white/70">
                            <div className="flex items-center justify-center h-full">
                                <p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

export default LivePreviewSection;
