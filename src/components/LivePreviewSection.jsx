import React, { useEffect, useMemo, useState } from 'react';

const FONT_DRAG_DATA_TYPE = 'application/x-archfonthub-font';

const formatStyleLabel = (styleKey = '') =>
    styleKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const HebrewSupportWarning = () => (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
        <div className="flex items-start gap-3">
            <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
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
            <p className="text-sm font-medium leading-6 text-amber-800">
                Please check each preview carefully as Hebrew character support can vary between fonts.
            </p>
        </div>
    </div>
);

export default function LivePreviewSection({
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
    onLineFontSizeOverrideChange,
    onLineSelect,
    onLineSpacingChange,
    onLineStyleChange,
    onTextAlignChange,
    previewLines,
    selectedPreviewLineIndex,
    selectedFonts = [],
    textAlign,
}) {
    const [focusedStyleFontName, setFocusedStyleFontName] = useState(
        selectedFonts[0]?.name || ''
    );
    const [draggedFontName, setDraggedFontName] = useState('');
    const [dropTargetLineIndex, setDropTargetLineIndex] = useState(null);

    const safePreviewLines = Array.isArray(previewLines) ? previewLines : [];
    const safeSelectedFonts = Array.isArray(selectedFonts) ? selectedFonts : [];

    const visiblePreviewLines = useMemo(
        () => safePreviewLines.filter((line) => line.text.trim() !== ''),
        [safePreviewLines]
    );

    const hasText = visiblePreviewLines.length > 0;

    const selectedLine = useMemo(
        () =>
            safePreviewLines.find(
                (line) => line.lineIndex === selectedPreviewLineIndex
            ) || null,
        [safePreviewLines, selectedPreviewLineIndex]
    );

    const styleFontName =
        selectedLine?.fontName ||
        focusedStyleFontName ||
        safeSelectedFonts[0]?.name ||
        '';

    const styleFont =
        safeSelectedFonts.find((font) => font.name === styleFontName) || null;

    const styleKeys = useMemo(
        () => getSortedStyleKeys?.(styleFont?.styles || {}) || [],
        [getSortedStyleKeys, styleFont]
    );

    const activeStyleKey =
        selectedLine?.fontName === styleFontName
            ? selectedLine.styleKey
            : styleFont?.activeStyle || getDefaultStyleKey(styleFontName);

    const selectedLineFontSize = selectedLine
        ? selectedLine.fontSizeOverride ?? fontSize
        : fontSize;

    const selectedLineUsesBaseSize = selectedLine?.fontSizeOverride == null;

    useEffect(() => {
        if (selectedLine?.fontName) {
            setFocusedStyleFontName(selectedLine.fontName);
            return;
        }

        if (
            focusedStyleFontName &&
            safeSelectedFonts.some((font) => font.name === focusedStyleFontName)
        ) {
            return;
        }

        setFocusedStyleFontName(safeSelectedFonts[0]?.name || '');
    }, [focusedStyleFontName, safeSelectedFonts, selectedLine?.fontName]);

    const handleFontChipClick = (fontName) => {
        setFocusedStyleFontName(fontName);

        if (selectedLine) {
            onApplyFontToLine?.(selectedLine.lineIndex, fontName);
            return;
        }

        onApplyFontToAllLines?.(fontName);
    };

    const handleStyleChipClick = (styleKey) => {
        if (!styleFontName) return;

        if (selectedLine) {
            onLineStyleChange?.(selectedLine.lineIndex, styleKey);
            return;
        }

        onApplyStyleToAllLines?.(styleFontName, styleKey);
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

    const isFontDrag = (event) =>
        Boolean(draggedFontName) ||
        Array.from(event.dataTransfer?.types || []).includes(FONT_DRAG_DATA_TYPE);

    const handleLineDragOver = (event, lineIndex) => {
        if (!isFontDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDropTargetLineIndex(lineIndex);
    };

    const handleLineDragLeave = (event, lineIndex) => {
        if (
            dropTargetLineIndex === lineIndex &&
            !event.currentTarget.contains(event.relatedTarget)
        ) {
            setDropTargetLineIndex(null);
        }
    };

    const handleLineDrop = (event, lineIndex) => {
        event.preventDefault();
        event.stopPropagation();

        const droppedFontName =
            event.dataTransfer.getData(FONT_DRAG_DATA_TYPE) ||
            event.dataTransfer.getData('text/plain') ||
            draggedFontName;

        setDropTargetLineIndex(null);

        if (!droppedFontName) return;

        setFocusedStyleFontName(droppedFontName);
        onApplyFontToLine?.(lineIndex, droppedFontName);
        onLineSelect?.(lineIndex);
    };

    const renderPreviewLine = (line, index) => {
        const font = getFontOptionByName?.(line.fontName);
        const fallbackStyleKey = getDefaultStyleKey?.(line.fontName);
        const activeFontFamily =
            font?.styles?.[line.styleKey] ||
            font?.styles?.[fallbackStyleKey] ||
            'inherit';

        const effectiveFontSize = line.fontSizeOverride ?? fontSize;
        const isSelected = selectedPreviewLineIndex === line.lineIndex;
        const isDropTarget = dropTargetLineIndex === line.lineIndex;
        const gapAfter =
            index === visiblePreviewLines.length - 1
                ? 0
                : Math.max(0, (Number(lineSpacing) - 1) * effectiveFontSize);

        return (
            <button
                key={`preview-line-${line.lineIndex}`}
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onLineSelect?.(line.lineIndex);
                }}
                onDragOver={(event) => handleLineDragOver(event, line.lineIndex)}
                onDragLeave={(event) => handleLineDragLeave(event, line.lineIndex)}
                onDrop={(event) => handleLineDrop(event, line.lineIndex)}
                aria-label={`Select line ${index + 1} for editing`}
                aria-pressed={isSelected}
                className="group w-full bg-transparent py-0.5 text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                style={{ marginBottom: `${gapAfter}px` }}
            >
                <span className="block w-full" style={{ textAlign }}>
                    <span
                        className={`inline-block max-w-full whitespace-pre-wrap break-words rounded-xl border px-[0.26em] py-[0.08em] text-slate-800 shadow-sm transition-all ${
                            isDropTarget
                                ? 'border-emerald-400 bg-emerald-50/90'
                                : isSelected
                                ? 'border-blue-300 bg-blue-50/90'
                                : 'border-transparent bg-transparent group-hover:border-slate-200 group-hover:bg-slate-50/90'
                        }`}
                        style={{
                            fontFamily: activeFontFamily,
                            fontSize: `${effectiveFontSize}px`,
                            lineHeight: 1.05,
                            overflowWrap: 'anywhere',
                        }}
                        dir="auto"
                    >
                        {line.text}
                    </span>
                </span>
            </button>
        );
    };

    return (
        <section className="rounded-[2rem] border border-[rgba(148,180,193,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.996),rgba(242,247,248,0.986))] p-8 shadow-[0_32px_84px_-48px_rgba(24,28,34,0.14)]">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-[48rem]">
                    <div className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.18)] bg-[rgba(236,239,202,0.72)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#213448] shadow-sm">
                        Live Preview
                    </div>
                    <h2
                        className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem]"
                        style={{ fontFamily: 'Alumni Sans Regular' }}
                    >
                        Fine-tune your layout
                    </h2>
                    <p className="mt-2 text-[15px] leading-7 text-slate-600">
                        Apply fonts to all lines, drag fonts onto a single line to mix them, and click a line to edit that line only.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
                        {selectedLine
                            ? `Editing line ${selectedLine.lineIndex + 1}`
                            : 'Editing all lines'}
                    </span>

                    {selectedLine && (
                        <button
                            type="button"
                            onClick={() => onLineSelect?.(null)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                        >
                            Back to all lines
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-5 rounded-[1.55rem] border border-[rgba(148,180,193,0.14)] bg-[linear-gradient(180deg,rgba(249,250,250,0.995),rgba(238,244,246,0.98))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        Click a font = all lines
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        Drag a font to a line = one line
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        Click a line = line-only editing
                    </span>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                    <div className="rounded-[1.35rem] border border-[rgba(148,180,193,0.16)] bg-white/92 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Fonts
                            </p>
                            <span className="text-xs font-medium text-slate-500">
                                Click or drag
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                            {safeSelectedFonts.length > 0 ? (
                                safeSelectedFonts.map((font) => {
                                    const isActive = selectedLine
                                        ? selectedLine.fontName === font.name
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
                                            className={`cursor-grab rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all active:cursor-grabbing ${
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
                                    Select fonts above to begin editing the preview.
                                </p>
                            )}
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Styles
                                </p>
                                {styleFont && (
                                    <span className="text-xs font-medium text-slate-500">
                                        {styleFont.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {styleFont && styleKeys.length > 0 ? (
                                    styleKeys.map((styleKey) => {
                                        const isActive = activeStyleKey === styleKey;

                                        return (
                                            <button
                                                key={`${styleFont.name}-${styleKey}`}
                                                type="button"
                                                onClick={() => handleStyleChipClick(styleKey)}
                                                aria-pressed={isActive}
                                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                                    isActive
                                                        ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                                                }`}
                                            >
                                                {formatStyleLabel(styleKey)}
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

                    <div className="rounded-[1.35rem] border border-[rgba(148,180,193,0.16)] bg-white/92 p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Layout
                            </p>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {selectedLine ? `Line ${selectedLine.lineIndex + 1}` : 'All lines'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <label
                                    htmlFor="globalSizeSlider"
                                    className="w-20 text-sm font-medium text-slate-600"
                                >
                                    Base size
                                </label>
                                <input
                                    id="globalSizeSlider"
                                    type="range"
                                    min="36"
                                    max="100"
                                    step="1"
                                    value={fontSize}
                                    onChange={onFontSizeChange}
                                    className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 lg:w-48"
                                />
                                <span className="w-12 text-sm font-medium text-slate-600">
                                    {fontSize}px
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <label
                                    htmlFor="lineSizeSlider"
                                    className="w-20 text-sm font-medium text-slate-600"
                                >
                                    Line size
                                </label>
                                <input
                                    id="lineSizeSlider"
                                    type="range"
                                    min="12"
                                    max="140"
                                    step="1"
                                    value={selectedLineFontSize}
                                    onChange={(event) =>
                                        selectedLine &&
                                        onLineFontSizeOverrideChange?.(
                                            selectedLine.lineIndex,
                                            event.target.value
                                        )
                                    }
                                    disabled={!selectedLine}
                                    className={`h-2 w-40 appearance-none rounded-lg lg:w-48 ${
                                        selectedLine
                                            ? 'cursor-pointer bg-slate-200 accent-blue-600'
                                            : 'cursor-not-allowed bg-slate-200 accent-slate-300'
                                    }`}
                                />
                                <span
                                    className={`w-12 text-sm font-medium ${
                                        selectedLine ? 'text-slate-600' : 'text-slate-400'
                                    }`}
                                >
                                    {selectedLineFontSize}px
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs text-slate-500">
                                    {selectedLine
                                        ? 'Adjust the selected line independently.'
                                        : 'Click a line below to size it independently.'}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        selectedLine &&
                                        onLineFontSizeOverrideChange?.(
                                            selectedLine.lineIndex,
                                            null
                                        )
                                    }
                                    disabled={!selectedLine || selectedLineUsesBaseSize}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        !selectedLine || selectedLineUsesBaseSize
                                            ? 'cursor-default bg-slate-100 text-slate-400'
                                            : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                                    }`}
                                >
                                    Use base size
                                </button>
                            </div>

                            <div className="border-t border-slate-100 pt-4" />

                            <div className="flex flex-wrap items-center gap-3">
                                <label
                                    htmlFor="lineSpacingSlider"
                                    className="w-20 text-sm font-medium text-slate-600"
                                >
                                    Spacing
                                </label>
                                <input
                                    id="lineSpacingSlider"
                                    type="range"
                                    min="0.4"
                                    max="3"
                                    step="0.05"
                                    value={lineSpacing}
                                    onChange={onLineSpacingChange}
                                    className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 lg:w-48"
                                />
                                <span className="w-14 text-sm font-medium text-slate-600">
                                    {Math.round(Number(lineSpacing) * 100)}%
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="w-20 text-sm font-medium text-slate-600">
                                    Align
                                </span>
                                <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
                                    {['left', 'center', 'right'].map((alignment) => (
                                        <button
                                            key={alignment}
                                            type="button"
                                            onClick={() => onTextAlignChange?.(alignment)}
                                            className={`flex h-10 w-11 items-center justify-center transition-colors ${
                                                textAlign === alignment
                                                    ? 'bg-slate-700 text-white'
                                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                            }`}
                                            title={`Align ${alignment}`}
                                            aria-label={`Align ${alignment}`}
                                            aria-pressed={textAlign === alignment}
                                        >
                                            <AlignIcon align={alignment} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {monogramInfo && (
                    <div className="rounded-[1.35rem] border border-blue-200 bg-white/96 p-6 shadow-sm">
                        <div className="mb-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                                Monogram
                            </span>
                        </div>
                        <div
                            className="flex min-h-[220px] items-center justify-center rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(249,250,251,0.98),rgba(244,248,249,0.96))] p-4"
                            dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }}
                        />
                    </div>
                )}

                {hebrewRegex.test(customText) && <HebrewSupportWarning />}

                <div className="rounded-[1.35rem] border border-[rgba(148,180,193,0.16)] bg-white/94 p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-600">
                            {hasText
                                ? 'Click a line to edit only that line. Click the preview background to return to all-lines editing.'
                                : 'Select fonts and enter text above to start your preview.'}
                        </p>

                        {selectedLine && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Line {selectedLine.lineIndex + 1} selected
                            </span>
                        )}
                    </div>

                    {hasText ? (
                        <div
                            className="flex min-h-[260px] w-full items-center justify-center rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.998),rgba(248,250,251,0.99))] px-5 py-7 shadow-inner"
                            onClick={() => onLineSelect?.(null)}
                        >
                            <div className="inline-flex w-fit max-w-full flex-col items-stretch">
                                {visiblePreviewLines.map((line, index) =>
                                    renderPreviewLine(line, index)
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/60 text-center">
                            <svg
                                className="mb-3 h-12 w-12 text-slate-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 6h16M4 12h16M4 18h7"
                                />
                            </svg>
                            <p className="text-lg font-semibold text-slate-500">
                                Your preview is empty
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Select fonts and type some text above to preview it here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}