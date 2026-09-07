import { useEffect, useRef, useState } from "react";
import CharacterTools from "./CharacterTools";
import MonogramMaker from "./MonogramMaker";
import CircularMonogram from "./CircularMonogram";
import SplitLetterMonogram from "./SplitLetterMonogram";
import Dialog from "./Dialog";
import EngravingPreview from "./EngravingPreview";
import FontRail from "./FontRail";
import RailWorkspace from "./RailWorkspace";
import {
  allFonts,
  defaultStyle,
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
import "./requestDialogs.css";
import "./rail.css";

const params = new URLSearchParams(window.location.search);
const sourceOrder = params.get("orderId") || "";
const draftKey = `arch-font-hub:font-rail:draft:${sourceOrder}`;
const receiptKey = `arch-font-hub:font-rail:receipt:${sourceOrder}`;
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
        Alternative lettering styles{" "}
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
        <p className="muted">No alternative styles included.</p>
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
            {{
              classic: "Classic monogram",
              flat: "Flat monogram",
              circular: "Circular monogram",
              split: "Split letter monogram",
            }[request.monogramInfo.data.type] || "Monogram"}
            {request.monogramInfo.data.type !== "circular" && (
              <>
                {" "}
                · {request.monogramInfo.data.font.name}
                {request.monogramInfo.data.style &&
                  " · " + styleLabel(request.monogramInfo.data.style)}
              </>
            )}
          </p>
          <p>
            {request.monogramInfo.data.text &&
              "Initials: " + request.monogramInfo.data.text.join(" / ")}
            {request.monogramInfo.data.name &&
              "Initial: " +
                request.monogramInfo.data.initial +
                " · Name: " +
                request.monogramInfo.data.name}
            {request.monogramInfo.data.frameStyle &&
              request.monogramInfo.data.frameStyle !== "none" &&
              " · Frame: " + styleLabel(request.monogramInfo.data.frameStyle)}
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
  const [category, setCategory] = useState(
    ["All", ...Object.keys(fontLibrary)].includes(saved.category)
      ? saved.category
      : "All",
  );
  const [search, setSearch] = useState(
    typeof saved.search === "string" ? saved.search : "",
  );
  const [expanded, setExpanded] = useState(Boolean(saved.expanded));
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [size, setSize] = useState(saved.size || 64);
  const [spacing, setSpacing] = useState(saved.spacing || 1);
  const [letterSpacing, setLetterSpacing] = useState(saved.letterSpacing || 0);
  const [align, setAlign] = useState(saved.align || "center");
  const [fit, setFit] = useState(saved.fit !== false);
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
  const pickerOrigin = useRef("line");
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
        letterSpacing,
        category,
        search,
        expanded,
        fit,
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
    letterSpacing,
    category,
    search,
    expanded,
    fit,
    align,
  ]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches)
        setModal((value) => (value === "fonts" ? null : value));
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function closePicker(forceLine = false) {
    setModal(null);
    if (forceLine === true || pickerOrigin.current === "line")
      requestAnimationFrame(() =>
        document
          .querySelector('.engraving-line[data-line="' + activeLine + '"]')
          ?.focus({ preventScroll: true }),
      );
  }
  function changeText(value) {
    const next = reconcileLines(text, value, assignments, history.current);
    history.current = next.history;
    setAssignments(next.assignments);
    setText(value);
    setActiveLine((index) => Math.min(index, value.split("\n").length - 1));
  }
  function activate(index, options = {}) {
    if (isMobile && options.source === "pointer") {
      pickerOrigin.current = "line";
      setModal("fonts");
    }
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
    keepPicker = false,
  ) {
    if (!hasText) {
      textRef.current?.focus();
      setAnnouncement("Enter your wording first, then choose lettering.");
      return;
    }
    if (modal === "fonts" && !keepPicker) closePicker(true);
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
        current.fontName === font.name
          ? current.styleKey
          : font.styles[styleMemory[font.name]]
            ? styleMemory[font.name]
            : defaultStyle(font),
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
        `${font.name} added to comparison. ${favorites.length + 1} of 3 saved.`,
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
      `${name} removed from comparison. Line lettering is unchanged.`,
    );
  }
  function insert(value) {
    setModal(null);
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
      "ALTERNATIVE LETTERING STYLES",
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
  const railProps = {
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
  };
  return (
    <div className={"font-hub" + (receipt ? " has-receipt" : "")}>
      <a href="#engraving-text" className="skip-link">
        Skip to wording
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#engraving-text"
          aria-label="Arch Engraving Font Hub"
        >
          <img src="/images/Arch Vector Logo White.svg" alt="Arch Engraving" />
          <span>
            Font Hub<small>LETTERING FOR YOUR ENGRAVING</small>
          </span>
        </a>
        <p className="header-guidance">
          Choose lettering for your engraving proof.
        </p>
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
      <RailWorkspace
        text={text}
        textRef={textRef}
        selection={selection}
        changeText={changeText}
        activeLine={activeLine}
        current={current}
        currentFont={currentFont}
        lines={lines}
        hasText={hasText}
        activate={activate}
        applyFont={applyFont}
        applyAll={() => {
          setAssignments(lines.map(() => ({ ...current })));
          setAnnouncement(current.fontName + " applied to every line.");
        }}
        size={size}
        setSize={setSize}
        spacing={spacing}
        setSpacing={setSpacing}
        letterSpacing={letterSpacing}
        setLetterSpacing={setLetterSpacing}
        align={align}
        setAlign={setAlign}
        fit={fit}
        setFit={setFit}
        expanded={expanded}
        isMobile={isMobile}
        openPicker={() => {
          pickerOrigin.current = "button";
          setModal("fonts");
        }}
        openModal={setModal}
        notes={notes}
        monogramInfo={monogramInfo}
        favorites={favorites}
        draftSaved={draftSaved}
        orderNumber={orderNumber}
        railProps={railProps}
        glyphNote={<GlyphNote lines={lines} />}
      />
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {modal === "fonts" && isMobile && (
        <Dialog
          title="Choose lettering"
          className="font-picker"
          onClose={closePicker}
        >
          <FontRail {...railProps} mobile />
        </Dialog>
      )}
      {["accents", "symbols", "hebrew"].includes(modal) && (
        <Dialog
          title={
            {
              accents: "Accented Characters",
              symbols: "Symbols",
              hebrew: "Hebrew",
            }[modal]
          }
          onClose={() => setModal(null)}
        >
          <div className="dialog-body character-dialog-body">
            <CharacterTools
              initialTab={{ symbols: 0, accents: 1, hebrew: 2 }[modal]}
              onClose={() => setModal(null)}
              onInsert={insert}
            />
          </div>
        </Dialog>
      )}
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
        <Dialog title="Compare options" wide onClose={() => setModal(null)}>
          <div className="dialog-body">
            <p>
              Keep up to three alternative styles for Arch to consider. Your
              applied line lettering is shown in the main preview.
            </p>
            {!favorites.length && (
              <div className="comparison-empty">
                <span aria-hidden="true">
                  Aa <i>Aa</i>
                </span>
                <h3>Room for a few possibilities.</h3>
                <p>
                  Use “Compare” beside a font to see your full wording in that
                  style. Adding an alternative does not change your lines.
                </p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setModal(isMobile ? "fonts" : null);
                    if (!isMobile)
                      requestAnimationFrame(() => searchRef.current?.focus());
                  }}
                >
                  Browse lettering
                </button>
              </div>
            )}
            <div className="comparison-grid">
              {favorites.map((font, i) => {
                const comparisonLines = (text || "Aa Bb Cc")
                  .split("\n")
                  .map((wording) => ({
                    text: wording,
                    fontName: font.name,
                    styleKey: font.activeStyle,
                  }));
                return (
                  <section
                    className="comparison-item favorite-slot"
                    key={font.name}
                  >
                    <div className="favorite-top">
                      <span className="favorite-number">0{i + 1}</span>
                      <h3>{font.name}</h3>
                      <button
                        className="icon-button"
                        aria-label={"Remove " + font.name + " from comparison"}
                        onClick={() => removeFavorite(font.name)}
                      >
                        ×
                      </button>
                    </div>
                    <StyleSelect
                      font={font}
                      value={font.activeStyle}
                      label={"Alternative " + (i + 1) + " style"}
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
                    <div className="favorite-actions">
                      <button
                        className="secondary-button"
                        disabled={!hasText}
                        onClick={() => {
                          applyFont(font, font.activeStyle);
                          setModal(null);
                        }}
                      >
                        Apply {font.name} to line {activeLine + 1}
                      </button>
                      <button
                        className="text-button"
                        aria-label={"Replace " + font.name}
                        onClick={() => {
                          setReplaceName(font.name);
                          setModal(isMobile ? "fonts" : null);
                          if (!isMobile)
                            requestAnimationFrame(() =>
                              searchRef.current?.focus(),
                            );
                        }}
                      >
                        Replace
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
            <p className="field-help">
              These alternatives are included in your request. You can send your
              applied lettering with no alternatives.
            </p>
            <button className="text-button" onClick={() => setModal(null)}>
              Back to my engraving
            </button>
          </div>
        </Dialog>
      )}
      {modal === "replace" && pendingFont && (
        <Dialog
          title={"Compare " + pendingFont.name}
          onClose={() => {
            setPendingFont(null);
            setModal(null);
          }}
        >
          <div className="dialog-body">
            <p>
              You have three alternatives. Choose one to replace with{" "}
              {pendingFont.name}. Your applied lettering stays the same.
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
                      font.name + " replaced with " + pendingFont.name + ".",
                    );
                    setPendingFont(null);
                    setModal(null);
                  }}
                >
                  Replace {font.name}
                </button>
              ))}
            </div>
            <button
              className="text-button"
              onClick={() => {
                setPendingFont(null);
                setModal(null);
              }}
            >
              Keep my alternatives
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
            <p>Included with your wording and alternatives in your request.</p>
            <button
              className="secondary-button"
              onClick={() => setModal("monogram")}
            >
              Replace monogram
            </button>
            <button
              className="text-button"
              onClick={() => {
                setMonogramInfo(null);
                setModal(null);
              }}
            >
              Remove monogram
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
