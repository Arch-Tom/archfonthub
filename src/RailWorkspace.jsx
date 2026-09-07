import EngravingPreview from "./EngravingPreview";
import FontRail from "./FontRail";
import { sortedStyles, styleLabel } from "./fontLibrary";

export default function RailWorkspace({
  text,
  textRef,
  selection,
  changeText,
  activeLine,
  current,
  currentFont,
  lines,
  hasText,
  activate,
  applyFont,
  applyAll,
  size,
  setSize,
  spacing,
  setSpacing,
  letterSpacing,
  setLetterSpacing,
  align,
  setAlign,
  fit,
  setFit,
  expanded,
  isMobile,
  openPicker,
  openModal,
  notes,
  monogramInfo,
  favorites,
  draftSaved,
  orderNumber,
  railProps,
  glyphNote,
}) {
  return (
    <main
      className={`rail-workspace ${expanded ? "rail-workspace--wide" : ""}`}
    >
      <div className="engraving-workspace">
        <section className="wording-section" aria-labelledby="wording-title">
          <div className="section-heading">
            <h1 id="wording-title">Your wording</h1>
            <span>Exactly as you want it engraved.</span>
          </div>
          <label className="sr-only" htmlFor="engraving-text">
            Your engraving wording
          </label>
          <textarea
            id="engraving-text"
            ref={textRef}
            rows={3}
            dir="auto"
            value={text}
            onChange={(e) => {
              changeText(e.target.value);
              selection.current = {
                start: e.target.selectionStart,
                end: e.target.selectionEnd,
              };
            }}
            onSelect={(e) => {
              selection.current = {
                start: e.target.selectionStart,
                end: e.target.selectionEnd,
              };
            }}
            placeholder={
              "Type your engraving wording here…\nStart a new line for each line of text."
            }
          />
          <div className="quick-tools" aria-label="Engraving tools">
            <button onClick={() => openModal("accents")}>
              <span aria-hidden="true">À</span>Accented Characters
            </button>
            <button onClick={() => openModal("symbols")}>
              <span aria-hidden="true">Ω</span>Symbols
            </button>
            <button onClick={() => openModal("hebrew")}>
              <span aria-hidden="true">א</span>Hebrew
            </button>
            <button onClick={() => openModal("monogram")}>
              <span className="monogram-tool-icon" aria-hidden="true">
                ABC
              </span>
              Monogram Maker
            </button>
            <button
              className={notes ? "tool-has-value" : ""}
              onClick={() => openModal("notes")}
            >
              <span aria-hidden="true">✎</span>Designer Notes
              {notes && <b aria-label="Note added">✓</b>}
            </button>
          </div>
        </section>
        <section className="preview-section" aria-labelledby="preview-title">
          <div className="preview-heading">
            <div>
              <span className="eyebrow">Live preview</span>
              <h2 id="preview-title">Your engraving</h2>
            </div>
            <button
              className="fit-button"
              aria-pressed={fit}
              disabled={!hasText}
              onClick={() => {
                setFit(true);
                setSize(64);
              }}
            >
              ⛶ <span>Fit to Preview</span>
            </button>
          </div>
          <p className="direct-instruction">
            {isMobile
              ? "Tap a line. Choose its lettering."
              : "Click a line. Choose its lettering on the right."}
          </p>
          <EngravingPreview
            lines={lines}
            activeLine={activeLine}
            onActivate={activate}
            size={size}
            spacing={spacing}
            letterSpacing={letterSpacing}
            align={align}
            fit={fit}
          />
          {glyphNote}
          <div className="active-line-toolbar">
            <div className="current-font">
              <span className="line-chip">
                {hasText ? `Line ${activeLine + 1}` : "Lettering"}
              </span>
              <div>
                <span className="eyebrow">Applied font</span>
                <strong>{currentFont.name}</strong>
              </div>
            </div>
            <select
              aria-label="Current font style"
              value={current.styleKey}
              disabled={!hasText}
              onChange={(e) => applyFont(currentFont, e.target.value)}
            >
              {sortedStyles(currentFont).map((style) => (
                <option key={style} value={style}>
                  {styleLabel(style)}
                </option>
              ))}
            </select>
            <button
              className="text-button apply-all"
              disabled={!hasText}
              onClick={applyAll}
            >
              Use this font on all lines
            </button>
            {isMobile && (
              <button
                className="primary-button mobile-picker-button"
                disabled={!hasText}
                onClick={openPicker}
              >
                Choose lettering →
              </button>
            )}
          </div>
          <details className="preview-adjustments">
            <summary>
              <span>Preview controls</span>
              <span>{Math.round(spacing * 100)}% line spacing</span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className="preview-controls">
              <label>
                Size
                <input
                  type="range"
                  min="16"
                  max="100"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setFit(false);
                  }}
                />
                <output>{size}</output>
              </label>
              <label>
                Line spacing
                <input
                  type="range"
                  min="0.75"
                  max="1.8"
                  step="0.05"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                />
                <output>{Math.round(spacing * 100)}%</output>
              </label>
              <label>
                Letter spacing
                <input
                  type="range"
                  min="-0.03"
                  max="0.15"
                  step="0.01"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                />
                <output>{Math.round(letterSpacing * 100)}%</output>
              </label>
              <div className="align-controls" aria-label="Preview alignment">
                {["left", "center", "right"].map((value) => (
                  <button
                    key={value}
                    aria-label={`Align ${value}`}
                    aria-pressed={align === value}
                    onClick={() => setAlign(value)}
                  >
                    <span
                      className={`align-icon align-icon--${value}`}
                      aria-hidden="true"
                    >
                      <i />
                      <i />
                      <i />
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setSize(64);
                  setSpacing(1);
                  setLetterSpacing(0);
                  setAlign("center");
                  setFit(true);
                }}
              >
                Reset
              </button>
            </div>
            <p>
              Preview only. 100% is the default line spacing. Tell Arch about
              layout requests in Designer Notes.
            </p>
          </details>
        </section>
        <footer className="workspace-footer">
          <button
            className={`compare-opener ${favorites.length ? "has-options" : ""}`}
            onClick={() => openModal("compare")}
          >
            <span className="compare-icon" aria-hidden="true">
              Aa <b>Aa</b>
            </span>
            <span>
              <strong>
                Compare options <b>{favorites.length} / 3</b>
              </strong>
              <small>
                {favorites.length
                  ? favorites.map((font) => font.name).join(" · ")
                  : "Keep alternatives if you’d like."}
              </small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
          {monogramInfo && (
            <button
              className="monogram-status"
              onClick={() => openModal("monogram-preview")}
            >
              ✓ Monogram added
            </button>
          )}
          <div className="workspace-assurance">
            <span>
              {orderNumber
                ? `Order ${orderNumber}`
                : "Arch prepares your final proof."}
            </span>
            <small>
              {draftSaved
                ? "Draft saved on this device"
                : "Draft could not be saved. Keep this page open."}
            </small>
          </div>
        </footer>
      </div>
      {!isMobile && <FontRail {...railProps} />}
    </main>
  );
}
