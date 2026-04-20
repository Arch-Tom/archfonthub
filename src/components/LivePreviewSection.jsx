import { useEffect, useMemo, useState } from 'react';
import PreviewCanvas from './livePreview/PreviewCanvas';
import PreviewLayoutControls from './livePreview/PreviewLayoutControls';

const FONT_DRAG_DATA_TYPE = 'application/x-archfonthub-font';

const HebrewSupportWarning = () => (
    <div className="rounded-r-lg border-l-4 border-amber-400 bg-amber-50 p-4">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg
                    className="h-5 w-5 text-amber-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
            <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                    Please check each preview carefully as Hebrew character support can vary between fonts.
                </p>
            </div>
        </div>
    </div>
);

const LivePreviewSection = ({
    AlignIcon,
    customText,
    fontSize,
    getDefaultStyleKey,
    getFontOptionByName,
    getSortedStyleKeys,
    hebrewRegex,
    lineSpacing,
    monogramInfo,
    onApplyFontToAllLines,
    onApplyFontToLine,
    onApplyStyleToAllLines,
    onFontSizeChange,
    onLineSelect,
    onLineSpacingChange,
    onLineStyleChange,
    onTextAlignChange,
    previewLines,
    selectedPreviewLineIndex,
    selectedFonts = [],
    textAlign,
}) => {
    const [focusedStyleFontName, setFocusedStyleFontName] = useState(
        selectedFonts[0]?.name || ''
    );
    const [draggedFontName, setDraggedFontName] = useState('');

    const selectedPreviewLine = useMemo(
        () =>
            previewLines.find(
                (line) => line.lineIndex === selectedPreviewLineIndex
            ) || null,
        [previewLines, selectedPreviewLineIndex]
    );

    const styleFontName =
        selectedPreviewLine?.fontName ||
        focusedStyleFontName ||
        selectedFonts[0]?.name ||
        '';
    const styleFont =
        selectedFonts.find((font) => font.name === styleFontName) || null;
    const styleKeys = useMemo(
        () => getSortedStyleKeys?.(styleFont?.styles || {}) || [],
        [getSortedStyleKeys, styleFont]
    );
    const activeStyleKey =
        selectedPreviewLine?.fontName === styleFontName
            ? selectedPreviewLine.styleKey
            : styleFont?.activeStyle || getDefaultStyleKey(styleFontName);

    useEffect(() => {
        if (selectedPreviewLine?.fontName) {
            setFocusedStyleFontName(selectedPreviewLine.fontName);
            return;
        }

        if (
            focusedStyleFontName &&
            selectedFonts.some((font) => font.name === focusedStyleFontName)
        ) {
            return;
        }

        setFocusedStyleFontName(selectedFonts[0]?.name || '');
    }, [focusedStyleFontName, selectedFonts, selectedPreviewLine?.fontName]);

    const handleFontChipClick = (fontName) => {
        setFocusedStyleFontName(fontName);

        if (selectedPreviewLine) {
            onApplyFontToLine(selectedPreviewLine.lineIndex, fontName);
            return;
        }

        onApplyFontToAllLines(fontName);
    };

    const handleFontChipDragStart = (event, fontName) => {
        setDraggedFontName(fontName);
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData(FONT_DRAG_DATA_TYPE, fontName);
        event.dataTransfer.setData('text/plain', fontName);
    };

    const handleFontChipDragEnd = () => {
        setDraggedFontName('');
    };

    const handleFontDropToLine = (lineIndex, fontName) => {
        if (!fontName) return;

        setFocusedStyleFontName(fontName);
        onApplyFontToLine(lineIndex, fontName);
        onLineSelect(lineIndex);
    };

    const handleStyleChipClick = (styleKey) => {
        if (!styleFontName) return;

        if (selectedPreviewLine) {
            onLineStyleChange(selectedPreviewLine.lineIndex, styleKey);
            return;
        }

        onApplyStyleToAllLines(styleFontName, styleKey);
    };

    return (
        <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2
                        className="text-3xl font-bold tracking-normal text-slate-900"
                        style={{ fontFamily: 'Alumni Sans Regular' }}
                    >
                        Live Preview
                    </h2>
                    <p className="mt-1 text-slate-500">
                        Preview your text in one layout. Select a line to adjust it on its own.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                        {selectedPreviewLine
                            ? `Editing line ${selectedPreviewLine.lineIndex + 1}`
                            : 'Editing all lines'}
                    </span>
                    {selectedPreviewLine && (
                        <button
                            type="button"
                            onClick={() => onLineSelect(null)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                        >
                            Clear selection
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-5 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-200 p-6">
                <div className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Fonts
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedFonts.length > 0 ? (
                                    selectedFonts.map((font) => {
                                        const isActive = selectedPreviewLine
                                            ? selectedPreviewLine.fontName === font.name
                                            : styleFontName === font.name;

                                        return (
                                            <button
                                                key={font.name}
                                                type="button"
                                                draggable
                                                onDragStart={(event) =>
                                                    handleFontChipDragStart(event, font.name)
                                                }
                                                onDragEnd={handleFontChipDragEnd}
                                                onClick={() => handleFontChipClick(font.name)}
                                                aria-pressed={isActive}
                                                className={`cursor-grab rounded-lg border px-3 py-2 text-sm font-semibold transition-colors active:cursor-grabbing ${
                                                    isActive
                                                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                                                }`}
                                            >
                                                {font.name}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Select fonts above to edit the preview.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                {styleFont ? `Styles for ${styleFont.name}` : 'Styles'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {styleFont && styleKeys.length > 0 ? (
                                    styleKeys.map((styleKey) => {
                                        const isActive = activeStyleKey === styleKey;

                                        return (
                                            <button
                                                key={`${styleFont.name}-${styleKey}`}
                                                type="button"
                                                onClick={() => handleStyleChipClick(styleKey)}
                                                aria-pressed={isActive}
                                                className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                                                    isActive
                                                        ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                                                }`}
                                            >
                                                {styleKey}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Choose a font to see its styles.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <PreviewLayoutControls
                    AlignIcon={AlignIcon}
                    fontSize={fontSize}
                    lineSpacing={lineSpacing}
                    onFontSizeChange={onFontSizeChange}
                    onLineSpacingChange={onLineSpacingChange}
                    onTextAlignChange={onTextAlignChange}
                    textAlign={textAlign}
                />

                {monogramInfo && (
                    <div className="flex h-[200px] items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-6 shadow">
                        <div
                            className="h-full w-full"
                            dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
                        />
                    </div>
                )}

                {hebrewRegex.test(customText) && <HebrewSupportWarning />}

                <PreviewCanvas
                    draggedFontName={draggedFontName}
                    fontDragDataType={FONT_DRAG_DATA_TYPE}
                    fontSize={fontSize}
                    getDefaultStyleKey={getDefaultStyleKey}
                    getFontOptionByName={getFontOptionByName}
                    lineSpacing={lineSpacing}
                    lines={previewLines}
                    onFontDropToLine={handleFontDropToLine}
                    onLineSelect={onLineSelect}
                    selectedPreviewLineIndex={selectedPreviewLineIndex}
                    textAlign={textAlign}
                />
            </div>
        </section>
    );
};

export default LivePreviewSection;
