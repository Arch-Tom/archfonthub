import { useEffect, useRef, useState } from "react";
import CharacterTools from "./CharacterTools";
import MonogramMaker from "./MonogramMaker";
import CircularMonogram from "./CircularMonogram";
import SplitLetterMonogram from "./SplitLetterMonogram";
import Dialog from "./Dialog";
import EngravingPreview from "./EngravingPreview";
import FontSpecimen from "./FontSpecimen";
import {
  allFonts,
  defaultStyle,
  familyFor,
  findFont,
  fontLibrary,
  sortedStyles,
  styleLabel,
} from "./fontLibrary";
import {
  cleanAssignment,
  initialAssignment,
  readStored,
  reconcileLines,
  writeStored,
} from "./draft";
import { submitRequest } from "./submission";
import { getFontCoverage, getPreviewFontFamily } from "./fontCoverage";
import "./definitive.css";

const params = new URLSearchParams(window.location.search);
const sourceOrder = params.get("orderId") || "";
const draftKey = `arch-font-hub:definitive:draft:${sourceOrder}`;
const receiptKey = `arch-font-hub:definitive:receipt:${sourceOrder}`;
const saved = readStored(draftKey) || {};
const savedReceipt = readStored(receiptKey);
const validReceipt =
  savedReceipt?.savedAt &&
  typeof savedReceipt.text === "string" &&
  Array.isArray(savedReceipt.favorites) &&
  Array.isArray(savedReceipt.lines)
    ? savedReceipt
    : null;

function StyleSelect({ font, value, onChange, label }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {sortedStyles(font).map((style) => (
        <option key={style} value={style}>
          {styleLabel(style)}
        </option>
      ))}
    </select>
  );
}
function GlyphNote({ lines }) {
  const warnings = [
    ...new Set(
      lines.flatMap((line) => {
        const font = findFont(line.fontName);
        const coverage = getFontCoverage(
          font.styles[line.styleKey] || font.styles[defaultStyle(font)],
          line.text,
        );
        return coverage.message ? [coverage.message] : [];
      }),
    ),
  ];
  return warnings.length ? (
    <div className="glyph-note" role="note">
      {warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  ) : null;
}
function MonogramSample({ info }) {
  const data = info.data;
  return (
    <div className="monogram-sample" aria-label="Your monogram preview">
      {data.type === "split" ? (
        <SplitLetterMonogram
          initial={data.initial}
          name={data.name}
          fontFamily={getPreviewFontFamily(data.font.styles[data.style])}
        />
      ) : (
        <CircularMonogram
          text={data.text}
          fontSize={80}
          fontFamily={getPreviewFontFamily(data.font.styles[data.style])}
          isCircular={data.isCircular}
          frameStyle={data.frameStyle}
          disableScaling={data.disableScaling}
        />
      )}
    </div>
  );
}
function RequestSummary({ request, sent = false }) {
  return (
    <div className="request-summary">
      <p className="eyebrow">{sent ? "Sent to Arch" : "To be sent to Arch"}</p>
      <h3>Exact engraving wording</h3>
      <p className="exact-wording" dir="auto">
        {request.text || "Monogram only"}
      </p>
      <h3>
        Favorite lettering styles{" "}
        <span className="count">{request.favorites.length} / 3</span>
      </h3>
      {request.favorites.length ? (
        <ol className="summary-favorites">
          {request.favorites.map((font) => (
            <li key={font.name}>
              <strong>{font.name}</strong> · {styleLabel(font.activeStyle)}
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">No separate favorites saved.</p>
      )}
      {!!request.text && (
        <>
          <h3>Line-by-line lettering</h3>
          <table className="line-summary">
            <thead>
              <tr>
                <th>Line</th>
                <th>Wording</th>
                <th>Font & style</th>
              </tr>
            </thead>
            <tbody>
              {request.lines.map((line, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td dir="auto">{line.text || "(Blank line)"}</td>
                  <td>
                    {line.fontName}
                    <small>{styleLabel(line.styleKey)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <GlyphNote lines={request.lines} />
        </>
      )}
      {request.monogramInfo && (
        <>
          <h3>Monogram</h3>
          <MonogramSample info={request.monogramInfo} />
          <p>
            {request.monogramInfo.data.type} ·{" "}
            {request.monogramInfo.data.font.name} ·{" "}
            {request.monogramInfo.data.style
              ? styleLabel(request.monogramInfo.data.style)
              : "Circular initials"}
            {request.monogramInfo.data.frameStyle &&
              ` · ${request.monogramInfo.data.frameStyle} frame`}
            {request.monogramInfo.data.text &&
              ` · ${request.monogramInfo.data.text.join(" / ")}`}
            {request.monogramInfo.data.name &&
              ` · ${request.monogramInfo.data.initial} / ${request.monogramInfo.data.name}`}
          </p>
        </>
      )}
      <h3>Designer Notes</h3>
      <p className="exact-notes">{request.notes || "No additional notes."}</p>
      <div className="preview-only">
        <p className="eyebrow">Preview-only settings</p>
        <p>
          Preview size, spacing, and alignment are for exploring your lettering.
          Arch prepares the final layout in your proof. Include any layout
          requests in Designer Notes.
        </p>
      </div>
    </div>
  );
}

export default function FontHub() {
  const [text, setText] = useState(
    typeof saved.text === "string" ? saved.text : "",
  );
  const [assignments, setAssignments] = useState(() =>
    Array.isArray(saved.assignments)
      ? saved.assignments.map(cleanAssignment)
      : [initialAssignment],
  );
  const [activeLine, setActiveLine] = useState(
    Number.isInteger(saved.activeLine)
      ? Math.max(
          0,
          Math.min(saved.activeLine, (saved.text || "").split("\n").length - 1),
        )
      : 0,
  );
  const [favorites, setFavorites] = useState(() =>
    (Array.isArray(saved.favorites) ? saved.favorites : [])
      .slice(0, 3)
      .flatMap((item) => {
        const font = allFonts.find((font) => font.name === item.name);
        return font
          ? [
              {
                ...font,
                activeStyle: font.styles[item.activeStyle]
                  ? item.activeStyle
                  : defaultStyle(font),
              },
            ]
          : [];
      }),
  );
  const [styleMemory, setStyleMemory] = useState(
    saved.styleMemory && typeof saved.styleMemory === "object"
      ? saved.styleMemory
      : {},
  );
  const [notes, setNotes] = useState(saved.notes || "");
  const [monogramInfo, setMonogramInfo] = useState(saved.monogramInfo || null);
  const [customerName, setCustomerName] = useState(
    saved.customerName ?? params.get("name") ?? "",
  );
  const [customerCompany, setCustomerCompany] = useState(
    saved.customerCompany ?? params.get("company") ?? "",
  );
  const [orderNumber, setOrderNumber] = useState(
    saved.orderNumber ?? sourceOrder,
  );
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [size, setSize] = useState(saved.size || 64);
  const [spacing, setSpacing] = useState(saved.spacing || 1.4);
  const [align, setAlign] = useState(saved.align || "center");
  const [fit, setFit] = useState(true);
  const [modal, setModal] = useState(validReceipt ? "receipt" : null);
  const [receipt, setReceipt] = useState(validReceipt);
  const [pendingFont, setPendingFont] = useState(null);
  const [replaceName, setReplaceName] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(true);
  const [receiptSaved, setReceiptSaved] = useState(true);
  const textRef = useRef(null);
  const searchRef = useRef(null);
  const selection = useRef({ start: text.length, end: text.length });
  const history = useRef({});
  const submitLock = useRef(false);
  const current = assignments[activeLine] || initialAssignment;
  const currentFont = findFont(current.fontName);
  const lines = text.split("\n").map((wording, i) => ({
    text: wording,
    ...(assignments[i] || initialAssignment),
  }));
  const hasText = Boolean(text.trim());
  const visibleFonts = allFonts.filter(
    (font) =>
      (category === "All" || category === font.category) &&
      font.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const request = {
    sourceOrder,
    text,
    favorites,
    lines,
    notes,
    monogramInfo,
    customerName,
    customerCompany,
    orderNumber,
  };
  useEffect(() => {
    setDraftSaved(
      writeStored(draftKey, {
        text,
        assignments,
        activeLine,
        favorites,
        styleMemory,
        notes,
        monogramInfo,
        customerName,
        customerCompany,
        orderNumber,
        size,
        spacing,
        align,
      }),
    );
  }, [
    text,
    assignments,
    activeLine,
    favorites,
    styleMemory,
    notes,
    monogramInfo,
    customerName,
    customerCompany,
    orderNumber,
    size,
    spacing,
    align,
  ]);
  function changeText(value) {
    const next = reconcileLines(text, value, assignments, history.current);
    history.current = next.history;
    setAssignments(next.assignments);
    setText(value);
    setActiveLine((index) => Math.min(index, value.split("\n").length - 1));
  }
  function activate(index) {
    setActiveLine(index);
    setAnnouncement(
      `Editing line ${index + 1}: ${lines[index].text || "Blank line"}. Font choices apply to this line.`,
    );
  }
  function applyFont(
    font,
    style = font.styles[styleMemory[font.name]]
      ? styleMemory[font.name]
      : defaultStyle(font),
  ) {
    if (!hasText) {
      textRef.current?.focus();
      setAnnouncement("Enter your wording first, then choose lettering.");
      return;
    }
    setStyleMemory((memory) => ({ ...memory, [font.name]: style }));
    setAssignments((items) =>
      lines.map((_, i) =>
        i === activeLine
          ? { fontName: font.name, styleKey: style }
          : items[i] || initialAssignment,
      ),
    );
    setAnnouncement(
      `${font.name}, ${styleLabel(style)}, applied to line ${activeLine + 1}.`,
    );
  }
  function saveFavorite(font) {
    if (favorites.some((item) => item.name === font.name)) {
      removeFavorite(font.name);
      return;
    }
    const favorite = {
      ...font,
      activeStyle:
        current.fontName === font.name ? current.styleKey : defaultStyle(font),
    };
    if (replaceName) {
      setFavorites((items) =>
        items.map((item) => (item.name === replaceName ? favorite : item)),
      );
      setAnnouncement(
        `${replaceName} replaced with ${font.name}. Line lettering is unchanged.`,
      );
      setReplaceName(null);
    } else if (favorites.length < 3) {
      setFavorites((items) => [...items, favorite]);
      setAnnouncement(
        `${font.name} saved as a favorite. ${favorites.length + 1} of 3 saved.`,
      );
    } else {
      setPendingFont(favorite);
      setModal("replace");
    }
  }
  function removeFavorite(name) {
    setFavorites((items) => items.filter((font) => font.name !== name));
    if (replaceName === name) setReplaceName(null);
    setAnnouncement(
      `${name} removed from favorites. Line lettering is unchanged.`,
    );
  }
  function insert(value) {
    const { start, end } = selection.current;
    changeText(text.slice(0, start) + value + text.slice(end));
    const cursor = start + value.length;
    selection.current = { start: cursor, end: cursor };
    requestAnimationFrame(() => {
      textRef.current?.focus();
      textRef.current?.setSelectionRange(cursor, cursor);
    });
    setAnnouncement(`Inserted ${value}.`);
  }
  function openReview() {
    if (!hasText && !monogramInfo) {
      textRef.current?.focus();
      setAnnouncement("Enter your wording or add a monogram before review.");
      return;
    }
    setError(null);
    setModal("review");
  }
  async function send(event) {
    event.preventDefault();
    if (submitLock.current) return;
    if (!orderNumber.trim() || !customerName.trim()) {
      setError({ message: "Enter your order number and name." });
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    setError(null);
    const snapshot = structuredClone(request);
    try {
      const result = await submitRequest(snapshot);
      const completed = {
        ...snapshot,
        filename: result.filename,
        savedAt: new Date().toISOString(),
      };
      setReceipt(completed);
      setReceiptSaved(writeStored(receiptKey, completed));
      setModal("receipt");
      setAnnouncement(
        "Your choices were received. Arch will prepare your proof.",
      );
    } catch (failure) {
      setError({ message: failure.message, code: failure.code });
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }
  function downloadReceipt() {
    const content = [
      "ARCH ENGRAVING — LETTERING REQUEST RECEIPT",
      `Received: ${new Date(receipt.savedAt).toLocaleString()}`,
      `Reference: ${receipt.filename}`,
      `Order: ${receipt.orderNumber}`,
      `Customer: ${receipt.customerName}`,
      `Company: ${receipt.customerCompany || "—"}`,
      "",
      "EXACT ENGRAVING WORDING",
      receipt.text,
      "",
      "FAVORITE LETTERING STYLES",
      ...receipt.favorites.map(
        (font) => `${font.name} — ${styleLabel(font.activeStyle)}`,
      ),
      "",
      "LINE-BY-LINE LETTERING",
      ...receipt.lines.map(
        (line, i) =>
          `${i + 1}. ${line.text} — ${line.fontName}, ${styleLabel(line.styleKey)}`,
      ),
      ...(receipt.monogramInfo
        ? ["", "MONOGRAM", JSON.stringify(receipt.monogramInfo.data, null, 2)]
        : []),
      "",
      "DESIGNER NOTES",
      receipt.notes || "None",
      "",
      "Preview size, spacing, and alignment are preview-only. Arch prepares the final layout in your proof.",
      "Your request was received. There is no need to send it again.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "Arch-lettering-receipt.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="font-hub">
      <a href="#engraving-text" className="skip-link">
        Skip to wording
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#engraving-text"
          aria-label="Arch Engraving Font Hub"
        >
          <img src="/images/Arch Vector Logo.svg" alt="Arch Engraving" />
          <span>
            Font Hub<small>LETTERING FOR YOUR ENGRAVING</small>
          </span>
        </a>
        <div className="header-guidance">
          Choose lettering styles for your engraving proof.
          <small>Arch will use your choices to prepare the final proof.</small>
        </div>
        <button className="primary-button" onClick={openReview}>
          Review & send <span aria-hidden="true">↗</span>
        </button>
      </header>
      {receipt && (
        <div className="receipt-banner">
          <span>✓ Request received for order {receipt.orderNumber}</span>
          <button onClick={() => setModal("receipt")}>View receipt</button>
        </div>
      )}
      <main className={`workspace ${expanded ? "workspace--expanded" : ""}`}>
        <section className="wording-section" aria-labelledby="wording-title">
          <div className="section-heading">
            <h1 id="wording-title">
              <span className="step-number">01</span>Your wording
            </h1>
            <span className="muted">
              Keep every line exactly as you want it.
            </span>
          </div>
          <p className="mobile-purpose">
            Arch uses your lettering choices to prepare your final proof.
          </p>
          <label className="sr-only" htmlFor="engraving-text">
            Your engraving wording
          </label>
          <textarea
            id="engraving-text"
            ref={textRef}
            rows={3}
            value={text}
            placeholder={
              "Enter your engraving wording…\nUse a new line for each line of text."
            }
            dir="auto"
            onChange={(event) => {
              changeText(event.target.value);
              selection.current = {
                start: event.target.selectionStart,
                end: event.target.selectionEnd,
              };
            }}
            onSelect={(event) => {
              selection.current = {
                start: event.target.selectionStart,
                end: event.target.selectionEnd,
              };
            }}
          />
          <div className="wording-extras">
            <CharacterTools onInsert={insert} />
            <button
              className="text-button"
              onClick={() => setModal("monogram")}
            >
              Monogram Maker <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
        <section className="catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <h2 id="catalog-title">
              <span className="step-number">02</span>Browse lettering
            </h2>
            <button
              className="text-button expand-button"
              aria-pressed={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Compact fonts" : "Expand fonts"}{" "}
              <span aria-hidden="true">{expanded ? "↙" : "↗"}</span>
            </button>
          </div>
          <div className="catalog-target" aria-live="polite">
            <span>
              {hasText
                ? `▸ Editing line ${activeLine + 1}`
                : "Start with your wording above"}
            </span>
            {hasText && (
              <strong dir="auto">
                {lines[activeLine]?.text || "(Blank line)"}
              </strong>
            )}
          </div>
          <div className="mobile-line-picker">
            <label htmlFor="catalog-line">Line to edit</label>
            <select
              id="catalog-line"
              value={activeLine}
              disabled={!hasText}
              onChange={(event) => activate(Number(event.target.value))}
            >
              {lines.map((line, i) => (
                <option key={i} value={i}>
                  Line {i + 1}: {line.text || "(Blank line)"}
                </option>
              ))}
            </select>
          </div>
          <div className="catalog-search">
            <label className="sr-only" htmlFor="font-search">
              Search fonts
            </label>
            <span aria-hidden="true">⌕</span>
            <input
              id="font-search"
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${allFonts.length} fonts`}
            />
            <span>{visibleFonts.length} fonts</span>
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
          <div className="current-font">
            <div>
              <span className="eyebrow">
                Current font{hasText ? ` · Line ${activeLine + 1}` : ""}
              </span>
              <strong>{currentFont.name}</strong>
            </div>
            <StyleSelect
              font={currentFont}
              value={current.styleKey}
              onChange={(style) => applyFont(currentFont, style)}
              label="Current font style"
            />
          </div>
          {replaceName && (
            <div className="replace-notice" role="status">
              Save a new favorite to replace {replaceName}.
              <button onClick={() => setReplaceName(null)}>Cancel</button>
            </div>
          )}
          <div className="font-grid" aria-label="Lettering collection">
            {visibleFonts.map((font) => {
              const chosen = current.fontName === font.name;
              const favorite = favorites.some(
                (item) => item.name === font.name,
              );
              const fontStyle = chosen ? current.styleKey : defaultStyle(font);
              const specimen = (lines[activeLine]?.text || "Aa").slice(0, 64);
              return (
                <div
                  className={`font-option ${chosen && hasText ? "font-option--current" : ""}`}
                  key={font.name}
                >
                  <button
                    className="font-apply"
                    aria-label={`Apply ${font.name} to line ${activeLine + 1}`}
                    aria-pressed={chosen && hasText}
                    onClick={() => applyFont(font)}
                  >
                    <FontSpecimen
                      text={specimen}
                      family={familyFor(font.name, fontStyle)}
                    />
                    <span className="font-label">
                      {font.name}
                      {chosen && hasText && (
                        <span className="current-check" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    className="favorite-toggle"
                    aria-label={`${favorite ? "Remove" : "Save"} ${font.name} ${favorite ? "from favorites" : "as favorite"}`}
                    aria-pressed={favorite}
                    onClick={() => saveFavorite(font)}
                    title={favorite ? "Remove favorite" : "Save favorite"}
                  >
                    {favorite ? "★" : "☆"}
                  </button>
                </div>
              );
            })}
            {!visibleFonts.length && (
              <div className="no-fonts">
                <h3>No matching fonts</h3>
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
          <a className="mobile-preview-link text-button" href="#preview-title">
            View mixed preview ↑
          </a>
          <p className="catalog-help">
            Click lettering to try it. <span aria-hidden="true">☆</span> saves a
            favorite.
          </p>
        </section>
        <section className="preview-section" aria-labelledby="preview-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Live engraving preview</p>
              <h2 id="preview-title">See your lettering together</h2>
            </div>
            <button
              className="secondary-button fit-button"
              aria-pressed={fit}
              onClick={() => {
                setFit(true);
                setSize(64);
              }}
              disabled={!hasText}
            >
              Fit to Preview
            </button>
          </div>
          <div className="active-line-bar">
            <div className="line-tabs" aria-label="Choose a line to edit">
              {lines.map((line, i) => (
                <button
                  key={i}
                  aria-label={`Activate line ${i + 1}`}
                  aria-pressed={activeLine === i}
                  onClick={() => activate(i)}
                  disabled={!hasText}
                >
                  {activeLine === i ? "▸ " : ""}Line {i + 1}
                </button>
              ))}
            </div>
            <span>
              {hasText
                ? `Editing line ${activeLine + 1}`
                : "Your preview appears as you type"}
            </span>
          </div>
          <EngravingPreview
            lines={lines}
            activeLine={activeLine}
            onActivate={activate}
            size={size}
            spacing={spacing}
            align={align}
            fit={fit}
          />
          <div className="preview-caption">
            <p>Click a line to change its lettering.</p>
            <a
              className="mobile-preview-link text-button"
              href="#catalog-title"
            >
              Browse fonts ↓
            </a>
            <button
              className="text-button"
              disabled={!hasText}
              onClick={() => {
                setAssignments(lines.map(() => ({ ...current })));
                setAnnouncement(
                  `${current.fontName} applied to every line. Favorites are unchanged.`,
                );
              }}
            >
              Use on every line
            </button>
          </div>
          <GlyphNote lines={lines} />
          {monogramInfo && (
            <div className="monogram-attached">
              <button
                className="text-button"
                onClick={() => setModal("monogram-preview")}
              >
                ✓ Monogram added · View
              </button>
              <button
                className="text-button"
                onClick={() => setMonogramInfo(null)}
              >
                Remove monogram
              </button>
            </div>
          )}
          <div className="preview-controls">
            <span className="eyebrow">Preview only</span>
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
            </label>
            <label>
              Spacing
              <input
                type="range"
                min="1"
                max="2"
                step="0.05"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
              />
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
                setSpacing(1.4);
                setAlign("center");
                setFit(true);
              }}
            >
              Reset
            </button>
          </div>
        </section>
        <section
          className="favorites-section"
          aria-labelledby="favorites-title"
        >
          <div className="favorites-heading">
            <div>
              <h2 id="favorites-title">
                <span className="star-accent" aria-hidden="true">
                  ★
                </span>
                Your favorites{" "}
                <span className="count">{favorites.length} / 3</span>
              </h2>
              <p>Styles you like, saved separately from your lines.</p>
            </div>
            <button
              className="text-button"
              disabled={!favorites.length || !hasText}
              onClick={() => setModal("compare")}
            >
              Compare favorites <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="favorite-slots">
            {[0, 1, 2].map((index) => {
              const font = favorites[index];
              return font ? (
                <div className="favorite-slot" key={index}>
                  <div className="favorite-top">
                    <span className="favorite-number">0{index + 1}</span>
                    <strong>{font.name}</strong>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${font.name} from favorites`}
                      onClick={() => removeFavorite(font.name)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="favorite-actions">
                    <StyleSelect
                      font={font}
                      value={font.activeStyle}
                      label={`Favorite ${index + 1} style`}
                      onChange={(style) =>
                        setFavorites((items) =>
                          items.map((item) =>
                            item.name === font.name
                              ? { ...item, activeStyle: style }
                              : item,
                          ),
                        )
                      }
                    />
                    <button
                      className="text-button"
                      aria-label={`Apply ${font.name} to line ${activeLine + 1}`}
                      disabled={!hasText}
                      onClick={() => applyFont(font, font.activeStyle)}
                    >
                      Apply to line {activeLine + 1}
                    </button>
                    <button
                      className="text-button"
                      aria-label={`Replace ${font.name}`}
                      onClick={() => {
                        setReplaceName(font.name);
                        searchRef.current?.focus();
                        searchRef.current?.scrollIntoView({ block: "nearest" });
                      }}
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="favorite-slot favorite-slot--empty" key={index}>
                  <span className="favorite-number">0{index + 1}</span>
                  <span>
                    Save a style with <strong>☆</strong>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <footer className="workspace-footer">
          <button className="notes-button" onClick={() => setModal("notes")}>
            <span aria-hidden="true">✎</span>
            <strong>Designer Notes</strong>
            <span>
              {notes ? "Note added" : "Optional requests for your proof"}
            </span>
            <span aria-hidden="true">↗</span>
          </button>
          <span className="draft-status">
            {draftSaved
              ? "Draft saved on this device"
              : "Draft could not be saved. Keep this page open."}
          </span>
          <button className="primary-button mobile-review" onClick={openReview}>
            Review & send ↗
          </button>
        </footer>
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {modal === "notes" && (
        <Dialog title="Designer Notes" onClose={() => setModal(null)}>
          <div className="dialog-body">
            <p>
              Tell your designer about size, placement, another font, or
              anything else for your proof.
            </p>
            <label htmlFor="designer-notes">Notes for your designer</label>
            <textarea
              id="designer-notes"
              rows={7}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please use script for the name and make it larger than the title."
            />
            <p className="field-help">
              Your notes are saved as you type and included in your request.
            </p>
            <button className="primary-button" onClick={() => setModal(null)}>
              Done
            </button>
          </div>
        </Dialog>
      )}
      {modal === "compare" && (
        <Dialog
          title="Compare your favorite lettering"
          wide
          onClose={() => setModal(null)}
        >
          <div className="dialog-body">
            <p>
              See your full wording in each saved style. Your line assignments
              stay as you set them.
            </p>
            <div className="comparison-grid">
              {favorites.map((font, i) => {
                const comparisonLines = text.split("\n").map((wording) => ({
                  text: wording,
                  fontName: font.name,
                  styleKey: font.activeStyle,
                }));
                return (
                  <section className="comparison-item" key={font.name}>
                    <h3>
                      <span className="favorite-number">0{i + 1}</span>
                      {font.name}
                    </h3>
                    <StyleSelect
                      font={font}
                      value={font.activeStyle}
                      label={`Compare ${font.name} style`}
                      onChange={(style) =>
                        setFavorites((items) =>
                          items.map((item) =>
                            item.name === font.name
                              ? { ...item, activeStyle: style }
                              : item,
                          ),
                        )
                      }
                    />
                    <EngravingPreview
                      lines={comparisonLines}
                      sample
                      size={40}
                    />
                    <GlyphNote lines={comparisonLines} />
                    <button
                      className="secondary-button"
                      onClick={() => {
                        applyFont(font, font.activeStyle);
                        setModal(null);
                      }}
                    >
                      Apply {font.name} to line {activeLine + 1}
                    </button>
                  </section>
                );
              })}
            </div>
            <button className="text-button" onClick={() => setModal(null)}>
              Back to my mixed preview
            </button>
          </div>
        </Dialog>
      )}
      {modal === "replace" && (
        <Dialog
          title={`Save ${pendingFont.name}`}
          onClose={() => {
            setPendingFont(null);
            setModal(null);
          }}
        >
          <div className="dialog-body">
            <p>
              You have three favorites. Choose one to replace with{" "}
              {pendingFont.name}. Your line assignments will stay the same.
            </p>
            <div className="replacement-options">
              {favorites.map((font) => (
                <button
                  className="secondary-button"
                  key={font.name}
                  onClick={() => {
                    setFavorites((items) =>
                      items.map((item) =>
                        item.name === font.name ? pendingFont : item,
                      ),
                    );
                    setAnnouncement(
                      `${font.name} replaced with ${pendingFont.name}.`,
                    );
                    setPendingFont(null);
                    setModal(null);
                  }}
                >
                  Replace {font.name}
                </button>
              ))}
            </div>
            <button className="text-button" onClick={() => setModal(null)}>
              Keep my favorites
            </button>
          </div>
        </Dialog>
      )}
      {modal === "monogram" && (
        <MonogramMaker
          fontLibrary={fontLibrary}
          onClose={() => setModal(null)}
          onInsert={(info) => {
            setMonogramInfo(info);
            setModal(null);
            setAnnouncement("Monogram added to your request.");
          }}
        />
      )}
      {modal === "monogram-preview" && (
        <Dialog title="Your monogram" onClose={() => setModal(null)}>
          <div className="dialog-body">
            <MonogramSample info={monogramInfo} />
            <p>Included with your wording and favorites in your request.</p>
            <button
              className="secondary-button"
              onClick={() => setModal("monogram")}
            >
              Replace monogram
            </button>
          </div>
        </Dialog>
      )}
      {modal === "review" && (
        <Dialog
          title="Review your request"
          wide
          busy={submitting}
          onClose={() => setModal(null)}
        >
          <form onSubmit={send} aria-busy={submitting} className="review-form">
            <div className="review-content">
              <div>
                <RequestSummary request={request} />
                <button
                  className="text-button"
                  disabled={submitting}
                  onClick={() => setModal(null)}
                  type="button"
                >
                  ← Edit wording & choices
                </button>
              </div>
              <section className="customer-section">
                <h3>Your order details</h3>
                <p>Help us match these choices to your engraving order.</p>
                <fieldset disabled={submitting}>
                  <label htmlFor="order-number">
                    Order number <span>Required</span>
                  </label>
                  <input
                    id="order-number"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    autoComplete="off"
                  />
                  <label htmlFor="customer-name">
                    Your name <span>Required</span>
                  </label>
                  <input
                    id="customer-name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoComplete="name"
                  />
                  <label htmlFor="company">
                    Company <span>Optional</span>
                  </label>
                  <input
                    id="company"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    autoComplete="organization"
                  />
                </fieldset>
                <div className="next-step">
                  <strong>Next, Arch prepares your proof.</strong>
                  <p>
                    Our designer will use your lettering preferences and notes
                    to prepare the final layout for your review.
                  </p>
                </div>
              </section>
            </div>
            <div className="review-submit">
              {error && (
                <div className="submission-error" role="alert">
                  <strong>We couldn’t confirm your submission.</strong>
                  <p>{error.message}</p>
                  <p>Your wording, choices, and details are still here.</p>
                  {error.code === "duplicate" && (
                    <a
                      href="https://archengraving.com/contact"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Contact Arch about this request ↗
                    </a>
                  )}
                </div>
              )}
              <div role="status">
                {submitting
                  ? "Sending your choices… Please keep this page open."
                  : "You’ll receive a confirmation and a downloadable receipt here."}
              </div>
              <button
                className="primary-button"
                type="submit"
                disabled={submitting || error?.code === "duplicate"}
              >
                {submitting
                  ? "Sending…"
                  : error
                    ? "Try sending again"
                    : "Send my choices to Arch"}{" "}
                {!submitting && <span aria-hidden="true">↗</span>}
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal === "receipt" && receipt && (
        <Dialog
          title="Your choices were received"
          wide
          onClose={() => setModal(null)}
        >
          <div className="dialog-body">
            <div className="receipt-success">
              <span className="success-check" aria-hidden="true">
                ✓
              </span>
              <div>
                <p className="eyebrow">Sent to Arch Engraving</p>
                <h3>Next, we’ll prepare your proof.</h3>
                <p>
                  Thank you, {receipt.customerName}. Your request has been
                  received. You can close this page; there’s no need to send it
                  again.
                </p>
              </div>
            </div>
            <div className="receipt-details">
              <div>
                <strong>Order {receipt.orderNumber}</strong>
                <p>
                  {receipt.customerName}
                  {receipt.customerCompany && ` · ${receipt.customerCompany}`}
                </p>
                <p>Received {new Date(receipt.savedAt).toLocaleString()}</p>
              </div>
              <button className="primary-button" onClick={downloadReceipt}>
                Save receipt ↓
              </button>
            </div>
            {!receiptSaved && (
              <p role="alert">
                Your browser could not retain this receipt. Save a copy before
                closing.
              </p>
            )}
            <RequestSummary request={receipt} sent />
          </div>
        </Dialog>
      )}
    </div>
  );
}
