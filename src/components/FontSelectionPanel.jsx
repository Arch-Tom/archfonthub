import { scriptFontsToAdjust } from '../constants/fontConfig';

const FontSelectionPanel = ({
  categoryFilters,
  currentCategory,
  fontHeading,
  fontSupportCopy,
  fontOptions,
  selectedFontOption,
  selectedFontStyleKeys,
  selectedStyleKey,
  selectedStyleLabel,
  selectedLineFontName,
  hasAnyRealText,
  selectedPreviewLineIndex,
  allFonts,
  formatStyleLabel,
  getDefaultStyleKey,
  getSortedStyleKeys,
  onCategoryChange,
  onFontSelect,
  onStyleSelect,
}) => {
  const canChooseFont = hasAnyRealText && selectedPreviewLineIndex != null;

  return (
    <div className="font-rack mt-4 border-t border-[#e4dccd] pt-4">
      <div className="font-rack__header">
        <div className="min-w-0">
          <h2 className="font-rack__title">{fontHeading}</h2>
          <p className="font-rack__support">{fontSupportCopy}</p>
        </div>
        <span className="font-rack__current-category">{currentCategory}</span>
      </div>

      <div className="font-rack__filters" aria-label="Font categories">
        {categoryFilters.map((filterLabel) => (
          <button
            key={filterLabel}
            type="button"
            onClick={() => onCategoryChange(filterLabel)}
            aria-pressed={currentCategory === filterLabel}
            className="font-rack__filter"
          >
            {filterLabel}
          </button>
        ))}
      </div>

      {selectedFontOption && (
        <div className="font-rack__current-font">
          <div className="font-rack__current-summary">
            <span className="font-rack__eyebrow">Current Font</span>
            <span className="font-rack__current-name">
              {selectedFontOption.name}
            </span>
            {selectedStyleLabel && (
              <span className="font-rack__current-style">
                {selectedStyleLabel}
              </span>
            )}
          </div>

          {selectedFontStyleKeys.length > 1 && (
            <div className="font-rack__styles" aria-label="Font styles">
              {selectedFontStyleKeys.map((styleKey) => (
                <button
                  key={`${selectedFontOption.name}-${styleKey}`}
                  type="button"
                  onClick={() => onStyleSelect(styleKey)}
                  aria-pressed={selectedStyleKey === styleKey}
                  className="font-rack__style"
                >
                  {formatStyleLabel(styleKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="font-rack__body" aria-label="Choose a font">
        <div className="font-rack__grid">
          {fontOptions.map((font) => {
            const previewStyleKey = getDefaultStyleKey(font.name, allFonts);
            const previewFontFamily =
              font.name === 'Alumni Sans'
                ? 'Alumni Sans Regular'
                : font.styles[previewStyleKey] ||
                  font.styles[getSortedStyleKeys(font.styles)[0]];
            const isSelected = selectedLineFontName === font.name;
            const isScriptFont = scriptFontsToAdjust.includes(font.name);

            return (
              <button
                key={`${font.category}-${font.name}`}
                type="button"
                onClick={() => onFontSelect(font.name)}
                disabled={!canChooseFont}
                aria-pressed={isSelected}
                className="font-rack__font"
              >
                <span
                  className={
                    isScriptFont
                      ? 'font-rack__font-preview font-rack__font-preview--script'
                      : 'font-rack__font-preview'
                  }
                  style={{ fontFamily: previewFontFamily }}
                >
                  {font.name}
                </span>
                <span className="font-rack__font-meta">{font.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="font-rack__helper">
        {hasAnyRealText
          ? 'Fonts and styles stay tied to the active line. Click a different line to restyle it.'
          : 'Enter text first, then click a line to style it.'}
      </p>
    </div>
  );
};

export default FontSelectionPanel;
