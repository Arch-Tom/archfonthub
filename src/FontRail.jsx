import FontSpecimen from "./FontSpecimen";
import {
  defaultStyle,
  familyFor,
  fontLibrary,
  sortedStyles,
  styleLabel,
} from "./fontLibrary";

export default function FontRail({
  lines,
  activeLine,
  current,
  currentFont,
  hasText,
  visibleFonts,
  styleMemory,
  category,
  setCategory,
  search,
  setSearch,
  expanded,
  setExpanded,
  favorites,
  saveFavorite,
  applyFont,
  replaceName,
  setReplaceName,
  searchRef,
  activate,
  mobile = false,
}) {
  const wording = lines[activeLine]?.text || "";
  return (
    <section
      className={`catalog font-rail ${mobile ? "font-rail--mobile" : ""}`}
      aria-labelledby="catalog-title"
    >
      <div className="rail-top">
        <div className="rail-heading">
          <h2 id="catalog-title">
            Lettering <span>{visibleFonts.length}</span>
          </h2>
          {!mobile && (
            <button
              className="rail-width-button"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Standard font rail" : "Wider font rail"}
              aria-pressed={expanded}
              title={expanded ? "Standard font rail" : "Wider font rail"}
            >
              <span aria-hidden="true">{expanded ? "↘" : "↖"}</span>
              <span>{expanded ? "Standard" : "Wider"}</span>
            </button>
          )}
        </div>
        <div className="catalog-target" aria-live="polite">
          <span>
            {hasText
              ? `Editing line ${activeLine + 1}`
              : "Start with your wording"}
          </span>
          <strong dir="auto">
            {hasText
              ? wording || "(Blank line)"
              : "Then click a line to try lettering."}
          </strong>
        </div>
        {mobile && (
          <div className="picker-line-selector">
            <label htmlFor="catalog-line">Line to edit</label>
            <select
              id="catalog-line"
              value={activeLine}
              onChange={(e) =>
                activate(Number(e.target.value), { source: "picker" })
              }
            >
              {lines.map((line, i) => (
                <option key={i} value={i}>
                  Line {i + 1}: {line.text || "(Blank line)"}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="catalog-search">
          <span aria-hidden="true">⌕</span>
          <label className="sr-only" htmlFor="font-search">
            Search fonts
          </label>
          <input
            ref={searchRef}
            id="font-search"
            type="search"
            placeholder="Find a font…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search"
              aria-label="Clear font search"
              onClick={() => {
                setSearch("");
                searchRef.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>
        <div className="category-filters" aria-label="Font categories">
          {["All", ...Object.keys(fontLibrary)].map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {mobile && (
          <div className="picker-current">
            <div>
              <span>Applied to this line</span>
              <strong>{currentFont.name}</strong>
            </div>
            <select
              aria-label="Picker font style"
              value={current.styleKey}
              onChange={(e) => applyFont(currentFont, e.target.value, true)}
            >
              {sortedStyles(currentFont).map((style) => (
                <option key={style} value={style}>
                  {styleLabel(style)}
                </option>
              ))}
            </select>
          </div>
        )}
        {replaceName && (
          <div className="replace-notice" role="status">
            <span>
              Add an option to replace <strong>{replaceName}</strong>.
            </span>
            <button onClick={() => setReplaceName(null)}>Cancel</button>
          </div>
        )}
      </div>
      <div className="font-grid" aria-label="Lettering collection">
        {visibleFonts.map((font) => {
          const applied = hasText && current.fontName === font.name;
          const alternative = favorites.some((item) => item.name === font.name);
          const style = applied
            ? current.styleKey
            : font.styles[styleMemory[font.name]]
              ? styleMemory[font.name]
              : defaultStyle(font);
          return (
            <article
              key={font.name}
              className={`font-option ${applied ? "font-option--current" : ""}`}
            >
              <button
                className="font-apply"
                aria-label={`Apply ${font.name} to line ${activeLine + 1}`}
                aria-pressed={applied}
                onClick={() => applyFont(font)}
              >
                <span className="font-label">
                  <span>{font.name}</span>
                  {applied && <span className="applied-label">✓ Applied</span>}
                </span>
                <FontSpecimen
                  text={hasText ? wording || "Blank line" : "Aa Bb Cc"}
                  family={familyFor(font.name, style)}
                />
              </button>
              <button
                className="comparison-toggle"
                aria-label={`${alternative ? "Remove" : "Add"} ${font.name} ${alternative ? "from" : "to"} comparison`}
                aria-pressed={alternative}
                onClick={() => saveFavorite(font)}
              >
                {alternative ? "✓ In comparison" : "+ Compare"}
              </button>
            </article>
          );
        })}
        {!visibleFonts.length && (
          <div className="no-fonts">
            <h3>No fonts found</h3>
            <p>Try another name or category.</p>
            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
                searchRef.current?.focus();
              }}
            >
              Show all fonts
            </button>
          </div>
        )}
      </div>
      <div className="rail-footer">
        <span>Click a font to apply it.</span>
        <span>Comparison is optional.</span>
      </div>
    </section>
  );
}
