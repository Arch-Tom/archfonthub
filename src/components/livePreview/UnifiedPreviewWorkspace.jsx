import React, { useEffect, useMemo, useState } from 'react';
import PreviewCanvas from './PreviewCanvas';
import PreviewLayoutControls from './PreviewLayoutControls';

const formatStyleLabel = (styleKey = '') =>
  styleKey
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSafeFontFamilyPreview = (font) => {
  if (!font?.styles) return 'inherit';
  const styleValues = Object.values(font.styles);
  return styleValues[0] || 'inherit';
};

const UnifiedPreviewWorkspace = ({
  AlignIcon,
  fontSize,
  getDefaultStyleKey,
  getFontOptionByName,
  getSortedStyleKeys,
  handleApplyFontToAllLines,
  handleApplyFontToLine,
  handleApplyStyleToAllLines,
  handleFontSizeChange,
  handleLineFontSizeOverrideChange,
  handleLineSpacingChange,
  handleLineStyleChange,
  lineSpacing,
  openPreviewLineIndex,
  previewLines = [],
  selectedFonts = [],
  setOpenPreviewLineIndex,
  setTextAlign,
  textAlign,
}) => {
  const [dragOverLineIndex, setDragOverLineIndex] = useState(null);
  const [globalStyleFontName, setGlobalStyleFontName] = useState(
    selectedFonts[0]?.name || ''
  );

  const safeSelectedFonts = useMemo(
    () => (Array.isArray(selectedFonts) ? selectedFonts : []),
    [selectedFonts]
  );
  const safePreviewLines = useMemo(
    () => (Array.isArray(previewLines) ? previewLines : []),
    [previewLines]
  );

  const activePreviewLine =
    safePreviewLines.find((line) => line.lineIndex === openPreviewLineIndex) ||
    null;
  const selectedFontNames = safeSelectedFonts.map((font) => font.name).join('|');

  useEffect(() => {
    setGlobalStyleFontName((currentName) => {
      if (safeSelectedFonts.some((font) => font.name === currentName)) {
        return currentName;
      }

      return safeSelectedFonts[0]?.name || '';
    });
  }, [safeSelectedFonts, selectedFontNames]);

  const styleFontName =
    activePreviewLine?.fontName ||
    globalStyleFontName ||
    safeSelectedFonts[0]?.name ||
    '';

  const styleFont =
    safeSelectedFonts.find((font) => font.name === styleFontName) || null;

  const styleKeys = useMemo(() => {
    if (!styleFont) return [];
    return getSortedStyleKeys?.(styleFont.styles || {}) || [];
  }, [getSortedStyleKeys, styleFont]);

  const activeLineFontSize = activePreviewLine?.fontSizeOverride ?? fontSize;
  const isUsingDefaultLineSize = activePreviewLine?.fontSizeOverride == null;

  const handleFontChipClick = (fontName) => {
    setGlobalStyleFontName(fontName);

    if (activePreviewLine) {
      handleApplyFontToLine?.(activePreviewLine.lineIndex, fontName);
      return;
    }

    handleApplyFontToAllLines?.(fontName);
  };

  const handleStyleChipClick = (styleKey) => {
    if (!styleFontName) return;

    if (activePreviewLine) {
      handleLineStyleChange?.(activePreviewLine.lineIndex, styleKey);
      return;
    }

    handleApplyStyleToAllLines?.(styleFontName, styleKey);
  };

  const handleDropFontOnLine = (lineIndex, fontName) => {
    setGlobalStyleFontName(fontName);
    handleApplyFontToLine?.(lineIndex, fontName);
    setOpenPreviewLineIndex?.(lineIndex);
  };

  const hasLines = safePreviewLines.length > 0;
  const hasFonts = safeSelectedFonts.length > 0;
  const targetLabel = activePreviewLine
    ? `Line ${activePreviewLine.lineIndex + 1}`
    : 'All lines';

  return (
    <div className="rounded-[1.65rem] border border-[rgba(148,180,193,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.992),rgba(241,246,248,0.972))] p-4 shadow-[0_24px_54px_-40px_rgba(28,35,41,0.14),inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Live preview
            </div>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {targetLabel}
            </h3>
            <p className="mt-1 max-w-[40rem] text-sm leading-6 text-slate-500">
              Select a line for local edits, or clear the selection to update the full preview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activePreviewLine ? (
              <button
                type="button"
                onClick={() => setOpenPreviewLineIndex?.(null)}
                className="rounded-full border border-[rgba(148,180,193,0.16)] bg-[rgba(236,239,202,0.72)] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#213448] transition-all hover:bg-[rgba(236,239,202,0.94)]"
              >
                Clear selection
              </button>
            ) : (
              <span className="rounded-full border border-[rgba(148,180,193,0.16)] bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                Global edits
              </span>
            )}
          </div>
        </div>

        <PreviewLayoutControls
          activeLineFontSize={activeLineFontSize}
          activePreviewLine={activePreviewLine}
          AlignIcon={AlignIcon}
          fontSize={fontSize}
          handleFontSizeChange={handleFontSizeChange}
          handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
          handleLineSpacingChange={handleLineSpacingChange}
          isUsingDefaultLineSize={isUsingDefaultLineSize}
          lineSpacing={lineSpacing}
          onClearLineSelection={() => setOpenPreviewLineIndex?.(null)}
          setTextAlign={setTextAlign}
          textAlign={textAlign}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.38fr)_minmax(0,1fr)]">
          <div className="space-y-3 rounded-[1.35rem] border border-[rgba(197,184,161,0.22)] bg-[linear-gradient(180deg,rgba(253,250,245,0.98),rgba(244,239,231,0.94))] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.1)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full border border-[rgba(148,180,193,0.16)] bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                Fonts
              </span>
              <span className="text-xs leading-5 text-slate-500">
                Click or drag
              </span>
            </div>

            {hasFonts ? (
              <div className="flex flex-wrap gap-2.5">
                {safeSelectedFonts.map((font) => {
                  const fontFamily =
                    font.styles?.[getDefaultStyleKey?.(font.name)] ||
                    getSafeFontFamilyPreview(font);
                  const isActiveForLine = activePreviewLine?.fontName === font.name;
                  const allLinesUseFont =
                    safePreviewLines.length > 0 &&
                    safePreviewLines.every((line) => line.fontName === font.name);
                  const isActiveGlobally =
                    !activePreviewLine &&
                    (allLinesUseFont || styleFontName === font.name);
                  const isActiveFont = isActiveForLine || isActiveGlobally;

                  return (
                    <button
                      key={`unified-font-${font.name}`}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/x-font-name', font.name);
                        event.dataTransfer.setData('text/plain', font.name);
                        event.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => handleFontChipClick(font.name)}
                      className={`rounded-xl border px-5 py-3 font-semibold transition-all duration-150 ${
                        isActiveFont
                          ? 'border-[rgba(212,194,161,0.38)] bg-[linear-gradient(180deg,#2f4258_0%,#213142_100%)] text-white shadow-[0_18px_28px_-18px_rgba(33,49,66,0.56)]'
                          : 'border-[rgba(197,184,161,0.34)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,242,235,0.97))] text-slate-700 hover:border-[rgba(83,103,130,0.34)] hover:bg-white'
                      }`}
                      style={{ fontFamily }}
                    >
                      {font.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Select fonts above to begin.
              </p>
            )}

            {styleFont && styleKeys.length > 0 && (
              <div className="border-t border-[rgba(197,184,161,0.24)] pt-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Style
                  </div>
                  <span className="text-xs text-slate-500">{styleFont.name}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {styleKeys.map((styleKey) => {
                    const isActiveStyle = activePreviewLine
                      ? activePreviewLine.styleKey === styleKey
                      : safePreviewLines.length > 0 &&
                        safePreviewLines.every(
                          (line) =>
                            line.fontName === styleFont.name &&
                            line.styleKey === styleKey
                        );

                    return (
                      <button
                        key={`${styleFont.name}-${styleKey}`}
                        type="button"
                        onClick={() => handleStyleChipClick(styleKey)}
                        aria-pressed={isActiveStyle}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          isActiveStyle
                            ? 'border-[rgba(212,194,161,0.36)] bg-[linear-gradient(180deg,#2f4258_0%,#213142_100%)] text-white shadow-[0_14px_22px_-18px_rgba(33,49,66,0.52)]'
                            : 'border-[rgba(197,184,161,0.34)] bg-white text-slate-600 hover:bg-[rgba(247,244,238,0.95)] hover:text-slate-900'
                        }`}
                      >
                        {formatStyleLabel(styleKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <PreviewCanvas
            lines={safePreviewLines}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            textAlign={textAlign}
            selectedLineIndex={openPreviewLineIndex}
            onSelectLine={setOpenPreviewLineIndex}
            onClearLineSelection={() => setOpenPreviewLineIndex?.(null)}
            getFontOptionByName={getFontOptionByName}
            getDefaultStyleKey={getDefaultStyleKey}
            onDropFontOnLine={handleDropFontOnLine}
            dragOverLineIndex={dragOverLineIndex}
            setDragOverLineIndex={setDragOverLineIndex}
          />
        </div>

        {!hasLines && (
          <p className="text-sm leading-6 text-slate-500">
            Add preview text above to see each line here.
          </p>
        )}
      </div>
    </div>
  );
};

export default UnifiedPreviewWorkspace;
