import { useEffect, useRef, useState } from "react";
import MonogramMaker from "./MonogramMaker";
import CircularMonogram from "./CircularMonogram";
import SplitLetterMonogram from "./SplitLetterMonogram";
import CharacterTools from "./CharacterTools";
import { allFonts, defaultStyle, fontLibrary, styleLabel } from "./fontLibrary";
import { submitRequest } from "./submission";
import "./v3.css";

const DRAFT_KEY = "arch-font-hub:v3:draft";
const RECEIPT_KEY = "arch-font-hub:v3:receipt";
const readSaved = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};
const save = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const params = new URLSearchParams(window.location.search);
const linkedOrder = params.get("orderId");
const matchesLink = (saved) =>
  !linkedOrder || (saved.sourceOrder ?? saved.orderNumber) === linkedOrder;
const storedDraft = readSaved(DRAFT_KEY);
const initialDraft = storedDraft && matchesLink(storedDraft) ? storedDraft : {};
const storedReceipt = readSaved(RECEIPT_KEY);
const initialReceipt =
  storedReceipt?.savedAt &&
  Array.isArray(storedReceipt.favorites) &&
  matchesLink(storedReceipt) &&
  (!initialDraft.orderNumber ||
    initialDraft.orderNumber === storedReceipt.orderNumber)
    ? storedReceipt
    : null;
const familyFor = (font) =>
  `"${font.styles[font.activeStyle || defaultStyle(font)]}", "Noto Rashi Hebrew Regular", Arial, sans-serif`;

function TextPreview({ text, font, large = false }) {
  const ref = useRef(null);
  const [size, setSize] = useState(large ? 56 : 32);
  const family = familyFor(font);
  useEffect(() => {
    const element = ref.current;
    let cancelled = false;
    const fit = () => {
      if (cancelled || !element?.clientWidth) return;
      const ctx = document.createElement("canvas").getContext("2d");
      const max = large ? 56 : 32;
      ctx.font = `${max}px ${family}`;
      const widest = Math.max(
        1,
        ...text.split("\n").map((line) => ctx.measureText(line).width),
      );
      setSize(
        Math.max(
          16,
          Math.min(max, Math.floor((max * element.clientWidth) / widest)),
        ),
      );
    };
    fit();
    document.fonts.ready.then(fit);
    document.fonts.addEventListener("loadingdone", fit);
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => {
      cancelled = true;
      document.fonts.removeEventListener("loadingdone", fit);
      observer.disconnect();
    };
  }, [text, family, large]);
  return (
    <div
      ref={ref}
      className="wording-preview"
      dir="auto"
      style={{
        fontFamily: family,
        fontSize: size,
        "--preview-size": `${size}px`,
      }}
    >
      {text || "Your wording goes here"}
    </div>
  );
}

function FontName({ font }) {
  const ref = useRef(null);
  const [size, setSize] = useState(42);
  const family = familyFor(font);
  useEffect(() => {
    const element = ref.current;
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = "42px " + family;
      const widestWord = Math.max(
        ...font.name.split(" ").map((word) => ctx.measureText(word).width),
        1,
      );
      setSize(
        Math.min(42, Math.max(20, (42 * element.clientWidth) / widestWord)),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    document.fonts.ready.then(fit);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [family, font.name]);
  return (
    <span
      ref={ref}
      className="font-name"
      style={{
        fontFamily: family,
        fontSize: size,
        "--preview-size": `${size}px`,
      }}
    >
      {font.name}
    </span>
  );
}

const inspirationFont = allFonts.find((font) => font.name === "Garamond");
// Introduce the range of lettering before the complete collection.
const openingFonts = [
  "Garamond",
  "Great Vibes",
  "Graphik",
  "Copperplate",
  "Old English",
];
const galleryFonts = [
  ...openingFonts.map((name) => allFonts.find((font) => font.name === name)),
  ...allFonts.filter((font) => !openingFonts.includes(font.name)),
];

function MonogramSample({ info }) {
  const data = info.data;
  return (
    <div className="monogram-sample" aria-label="Your monogram preview">
      {data.type === "split" ? (
        <SplitLetterMonogram
          initial={data.initial}
          name={data.name}
          fontFamily={data.font.styles[data.style]}
        />
      ) : (
        <CircularMonogram
          text={data.text}
          fontSize={72}
          fontFamily={data.font.styles?.[data.style]}
          isCircular={data.isCircular}
          frameStyle={data.frameStyle}
          disableScaling={data.disableScaling}
        />
      )}
    </div>
  );
}

function FontGuidance({ font, text }) {
  if (font.name === "Great Vibes" && text.includes("•"))
    return (
      <p className="glyph-note">
        This font has a large bullet character. Your designer will check its
        size in the proof.
      </p>
    );
  if (
    (font.name === "Collegiate" && /[éÉ]/.test(text)) ||
    (font.name === "I Love Glitter" && text.includes("•"))
  )
    return (
      <p className="glyph-note">
        Some characters use a supporting font. Your designer will check them in
        the proof.
      </p>
    );
  return null;
}

function RequestSummary({ request }) {
  return (
    <div className="request-summary">
      <h2>Your request</h2>
      <h3>Engraving wording</h3>
      <p className="exact-wording" dir="auto">
        {request.text || "Monogram only"}
      </p>
      <h3>Lettering favorites · {request.favorites.length}</h3>
      {request.favorites.map((font, i) => (
        <div className="summary-font" key={font.name}>
          <span className="favorite-number">{i + 1}</span>
          <div>
            <strong>{font.name}</strong>
            <span className="muted"> · {styleLabel(font.activeStyle)}</span>
            <TextPreview text={request.text} font={font} />
            <FontGuidance text={request.text} font={font} />
          </div>
        </div>
      ))}
      {request.monogramInfo && (
        <>
          <h3>Monogram</h3>
          <MonogramSample info={request.monogramInfo} />
        </>
      )}
      <h3>Designer Notes</h3>
      <p className="exact-notes">{request.notes || "No additional notes."}</p>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState(initialDraft.text || "");
  const [favorites, setFavorites] = useState(() =>
    (initialDraft.favorites || [])
      .flatMap((saved) => {
        const font = allFonts.find((item) => item.name === saved.name);
        return font
          ? [
              {
                ...font,
                activeStyle: font.styles[saved.activeStyle]
                  ? saved.activeStyle
                  : defaultStyle(font),
              },
            ]
          : [];
      })
      .slice(0, 3),
  );
  const [notes, setNotes] = useState(initialDraft.notes || "");
  const [orderNumber, setOrderNumber] = useState(
    initialDraft.orderNumber ?? linkedOrder ?? "",
  );
  const [customerName, setCustomerName] = useState(
    initialDraft.customerName ?? params.get("name") ?? "",
  );
  const [customerCompany, setCustomerCompany] = useState(
    initialDraft.customerCompany ?? params.get("company") ?? "",
  );
  const [monogramInfo, setMonogramInfo] = useState(
    initialDraft.monogramInfo || null,
  );
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [workspaceView, setWorkspaceView] = useState("browse");
  const [comparisonExpanded, setComparisonExpanded] = useState(false);
  const comparisonRef = useRef(null);
  const replacementRef = useRef(null);
  const [replaceName, setReplaceName] = useState(null);
  const [pendingFont, setPendingFont] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [step, setStep] = useState(initialReceipt ? "receipt" : "choose");
  const [receipt, setReceipt] = useState(initialReceipt);
  const [showMonogram, setShowMonogram] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receiptSaved, setReceiptSaved] = useState(true);
  const [draftSaved, setDraftSaved] = useState(true);
  const submitLock = useRef(false);
  const textRef = useRef(null);
  const selectionRef = useRef({ start: text.length, end: text.length });
  const pageHeading = useRef(null);
  const catalogRef = useRef(null);
  const previousStep = useRef(step);
  const request = {
    sourceOrder: linkedOrder,
    text,
    favorites,
    notes,
    monogramInfo,
    customerName,
    customerCompany,
    orderNumber,
    textAlign: "center",
  };
  const ready = Boolean(monogramInfo || (text.trim() && favorites.length));
  const visibleFonts = (category === "All" ? galleryFonts : allFonts).filter(
    (font) =>
      (category === "All" || font.category === category) &&
      font.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (step === "choose" || step === "review")
      setDraftSaved(
        save(DRAFT_KEY, {
          sourceOrder: linkedOrder,
          text,
          favorites,
          notes,
          monogramInfo,
          customerName,
          customerCompany,
          orderNumber,
        }),
      );
  }, [
    text,
    favorites,
    notes,
    monogramInfo,
    customerName,
    customerCompany,
    orderNumber,
    step,
  ]);
  useEffect(() => {
    if (step !== "choose" || previousStep.current !== step) {
      pageHeading.current?.focus();
      window.scrollTo(0, 0);
    }
    previousStep.current = step;
  }, [step]);

  const switchWorkspace = (view, moveFocus = false) => {
    setWorkspaceView(view);
    if (moveFocus)
      requestAnimationFrame(() => {
        const target =
          view === "browse" ? catalogRef.current : comparisonRef.current;
        target?.focus();
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      });
  };
  const chooseFont = (font) => {
    if (favorites.some((item) => item.name === font.name)) {
      removeFont(font.name);
      return;
    }
    const chosen = { ...font, activeStyle: defaultStyle(font) };
    if (replaceName) {
      setFavorites((items) =>
        items.map((item) => (item.name === replaceName ? chosen : item)),
      );
      setAnnouncement(`${replaceName} replaced with ${font.name}.`);
      setReplaceName(null);
      switchWorkspace("compare", true);
    } else if (favorites.length < 3) {
      setFavorites((items) => [...items, chosen]);
      setAnnouncement(
        `${font.name} added. ${favorites.length + 1} of 3 selected.`,
      );
    } else {
      setPendingFont(chosen);
      requestAnimationFrame(() => {
        replacementRef.current?.focus();
        replacementRef.current?.scrollIntoView({
          block: "start",
          behavior: "instant",
        });
      });
      setAnnouncement(
        "Three favorites selected. Choose a favorite to replace.",
      );
    }
  };
  const removeFont = (name) => {
    setFavorites((items) => items.filter((font) => font.name !== name));
    if (replaceName === name) setReplaceName(null);
    setPendingFont(null);
    setAnnouncement(`${name} removed. You can choose another font.`);
    if (workspaceView === "compare")
      requestAnimationFrame(() =>
        comparisonRef.current?.focus({ preventScroll: true }),
      );
  };
  const insert = (value) => {
    const { start, end } = selectionRef.current;
    setText((current) => current.slice(0, start) + value + current.slice(end));
    const cursor = start + value.length;
    selectionRef.current = { start: cursor, end: cursor };
    requestAnimationFrame(() => {
      textRef.current?.focus();
      textRef.current?.setSelectionRange(cursor, cursor);
    });
    setAnnouncement(`Inserted ${value} into your wording.`);
  };
  const openReview = () => {
    if (!ready) {
      setAnnouncement(
        "Enter your wording and choose at least one favorite, or add a monogram.",
      );
      textRef.current?.focus();
      return;
    }
    setError(null);
    setStep("review");
  };
  const send = async (event) => {
    event.preventDefault();
    if (submitLock.current) return;
    if (!orderNumber.trim() || !customerName.trim()) {
      setError({ message: "Please enter your order number and name." });
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
      setReceiptSaved(save(RECEIPT_KEY, completed));
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* Receipt stays available on screen. */
      }
      setStep("receipt");
    } catch (failure) {
      setError({ message: failure.message, code: failure.code });
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };
  const downloadReceipt = () => {
    const content = [
      "ARCH ENGRAVING — LETTERING REQUEST RECEIPT",
      `Received: ${new Date(receipt.savedAt).toLocaleString()}`,
      `Order: ${receipt.orderNumber}`,
      `Customer: ${receipt.customerName}`,
      `Company: ${receipt.customerCompany || "—"}`,
      "",
      "ENGRAVING WORDING",
      receipt.text,
      "",
      "FAVORITES",
      ...receipt.favorites.map(
        (font) => `${font.name} — ${styleLabel(font.activeStyle)}`,
      ),
      ...(receipt.monogramInfo
        ? ["", "MONOGRAM", JSON.stringify(receipt.monogramInfo.data, null, 2)]
        : []),
      "",
      "DESIGNER NOTES",
      receipt.notes || "None",
      "",
      "Arch will use these preferences to prepare your proof.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "Arch-lettering-receipt.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="font-hub">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#main" aria-label="Arch Engraving Font Hub">
          <img src="/images/Arch Vector Logo White.svg" alt="Arch Engraving" />
          <span>
            Font Hub<small>ARCH ENGRAVING</small>
          </span>
        </a>
        <div className="header-context">
          <span>LETTERING PREFERENCES</span>
          <strong>
            {step === "receipt"
              ? "Request received"
              : step === "review"
                ? "Review & send"
                : orderNumber
                  ? `Order ${orderNumber}`
                  : "For your engraving order"}
          </strong>
        </div>
      </header>
      <main id="main" className="page-main">
        {step === "choose" ? (
          <>
            <div className="workspace">
              <section
                className="wording-section"
                aria-label="Engraving wording editor"
              >
                <div className="wording-label">
                  <h1 ref={pageHeading} tabIndex={-1}>
                    Choose lettering for your order
                  </h1>
                  <p>
                    Choose up to three lettering styles for your engraving
                    proof.
                  </p>
                </div>
                <div className="wording-input">
                  <label className="sr-only" htmlFor="engraving-text">
                    Your engraving wording
                  </label>
                  <textarea
                    ref={textRef}
                    id="engraving-text"
                    rows={3}
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      selectionRef.current = {
                        start: event.target.selectionStart,
                        end: event.target.selectionEnd,
                      };
                    }}
                    onBlur={(event) => {
                      selectionRef.current = {
                        start: event.target.selectionStart,
                        end: event.target.selectionEnd,
                      };
                    }}
                    onSelect={(event) => {
                      selectionRef.current = {
                        start: event.target.selectionStart,
                        end: event.target.selectionEnd,
                      };
                    }}
                    placeholder={
                      "Type the wording from your order…\nInclude line breaks and special characters."
                    }
                    dir="auto"
                    aria-describedby="wording-help"
                  />
                  <p id="wording-help" className="field-help">
                    These samples show lettering preferences. Arch will prepare
                    the final layout in your proof.
                  </p>
                  <div className="wording-extras">
                    <CharacterTools onInsert={insert} />
                    <button
                      className="text-button"
                      onClick={() => setShowMonogram(true)}
                    >
                      Monogram Maker <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                  <details className="notes-disclosure">
                    <summary>
                      Designer Notes{" "}
                      <span>{notes ? "Note added" : "Optional"}</span>
                    </summary>
                    <label className="sr-only" htmlFor="designer-notes">
                      Designer Notes
                    </label>
                    <p className="field-help" id="designer-notes-help">
                      Have a favorite, a font not listed, or a special request?
                      Tell your designer.
                    </p>
                    <textarea
                      id="designer-notes"
                      aria-describedby="designer-notes-help"
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="e.g., Please make the name larger than the title."
                    />
                  </details>
                </div>
              </section>
              <nav className="workspace-nav" aria-label="Lettering workspace">
                <button
                  aria-label="Browse fonts"
                  aria-pressed={workspaceView === "browse"}
                  onClick={() => switchWorkspace("browse", true)}
                >
                  Browse fonts <span>{allFonts.length}</span>
                </button>
                <button
                  aria-label="Compare choices"
                  aria-pressed={workspaceView === "compare"}
                  onClick={() => switchWorkspace("compare", true)}
                >
                  Compare choices <span>{favorites.length}</span>
                </button>
                <button
                  className="edit-wording"
                  onClick={() => {
                    textRef.current?.focus();
                    textRef.current?.scrollIntoView({ block: "center" });
                  }}
                >
                  Edit wording <span aria-hidden="true">↑</span>
                </button>
              </nav>
              <section
                className="font-section"
                hidden={workspaceView !== "browse"}
                aria-labelledby="browse-title"
                ref={catalogRef}
                tabIndex={-1}
              >
                <h2 id="browse-title" className="sr-only">
                  Browse lettering
                </h2>
                <div className="browse-controls">
                  <div className="categories" aria-label="Font categories">
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
                  <label className="font-search">
                    <span className="sr-only">Search fonts</span>
                    <input
                      type="search"
                      placeholder="Search fonts"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <button
                    className="text-button sample-toggle"
                    aria-pressed={expanded}
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded ? "Compact samples" : "Larger samples"}{" "}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
                {replaceName && (
                  <div className="inline-notice" role="status">
                    Choose a new font to replace <strong>{replaceName}</strong>.
                    <button
                      className="text-button"
                      onClick={() => setReplaceName(null)}
                    >
                      Cancel replacement
                    </button>
                  </div>
                )}
                {pendingFont && (
                  <div
                    className="limit-notice"
                    role="alert"
                    ref={replacementRef}
                    tabIndex={-1}
                  >
                    <strong>You have 3 favorites.</strong>
                    <p>To add {pendingFont.name}, choose one to replace:</p>
                    <div className="replacement-options">
                      {favorites.map((font) => (
                        <button
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
                            switchWorkspace("compare", true);
                          }}
                        >
                          {font.name}
                        </button>
                      ))}
                      <button onClick={() => setPendingFont(null)}>
                        Keep my favorites
                      </button>
                    </div>
                  </div>
                )}
                <div className="catalog-caption">
                  <span>
                    {visibleFonts.length} lettering{" "}
                    {visibleFonts.length === 1 ? "style" : "styles"}
                  </span>
                  <span>
                    Choose a font to add it <span aria-hidden="true">＋</span>
                  </span>
                </div>
                <div
                  className={`font-catalog ${expanded ? "expanded" : ""}`}
                  role="region"
                  aria-label="Lettering styles"
                  tabIndex={0}
                >
                  {visibleFonts.map((font) => {
                    const selected = favorites.some(
                      (item) => item.name === font.name,
                    );
                    return (
                      <button
                        key={font.name}
                        className={`font-option ${selected ? "selected" : ""}`}
                        aria-label={`${selected ? "Remove" : "Add"} ${font.name}${selected ? " from" : " to"} favorites`}
                        aria-pressed={selected}
                        onClick={() => chooseFont(font)}
                      >
                        <span className="font-option-top">
                          <span className="font-option-label">{font.name}</span>
                          <span className="selection-mark" aria-hidden="true">
                            {selected ? "✓" : "+"}
                          </span>
                        </span>
                        {text ? (
                          <span
                            className="font-sample"
                            dir="auto"
                            style={{
                              fontFamily: familyFor(
                                favorites.find(
                                  (item) => item.name === font.name,
                                ) || font,
                              ),
                            }}
                          >
                            {expanded ? text : text.split("\n")[0]}
                          </span>
                        ) : (
                          <FontName font={font} />
                        )}
                        <span className="font-meta">
                          {selected
                            ? "✓ Selected"
                            : text
                              ? font.category
                              : font.category +
                                " · " +
                                Object.keys(font.styles).length +
                                (Object.keys(font.styles).length === 1
                                  ? " style"
                                  : " styles")}
                        </span>
                      </button>
                    );
                  })}
                  {!visibleFonts.length && (
                    <div className="empty-search">
                      <h3>No fonts found</h3>
                      <p>Try a different name or category.</p>
                      <button
                        className="text-button"
                        onClick={() => {
                          setSearch("");
                          setCategory("All");
                        }}
                      >
                        Show all fonts
                      </button>
                    </div>
                  )}
                </div>
              </section>
              <section
                id="favorites"
                className={`favorites-panel ${comparisonExpanded ? "comparison-expanded" : ""}`}
                hidden={workspaceView !== "compare"}
                ref={comparisonRef}
                tabIndex={-1}
                data-count={favorites.length}
                data-wording={Boolean(text.trim())}
                aria-labelledby="favorites-title"
              >
                <div className="favorites-heading">
                  <div className="section-heading">
                    <h2 id="favorites-title">Your lettering choices</h2>
                    <div className="comparison-actions">
                      <button
                        className="secondary-button comparison-toggle"
                        aria-pressed={comparisonExpanded}
                        onClick={() => setComparisonExpanded((value) => !value)}
                      >
                        {comparisonExpanded
                          ? "Compact previews"
                          : "Larger previews"}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => switchWorkspace("browse", true)}
                      >
                        Browse more fonts <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                  <p>
                    These are the fonts you’ll send to Arch. Compare the
                    lettering, adjust a style, or replace a choice.
                  </p>
                </div>
                <div className="favorite-previews">
                  {favorites.map((font, index) => (
                    <article
                      className="favorite-card"
                      key={font.name}
                      aria-label={`Favorite ${index + 1}: ${font.name}`}
                    >
                      <div className="favorite-card-top">
                        <span className="favorite-number">{index + 1}</span>
                        <h3>{font.name}</h3>
                        <button
                          className="remove-button"
                          onClick={() => removeFont(font.name)}
                          aria-label={`Remove ${font.name}`}
                        >
                          ×
                        </button>
                      </div>
                      <TextPreview text={text} font={font} large />
                      <FontGuidance text={text} font={font} />
                      <div className="favorite-card-bottom">
                        <label>
                          <span className="sr-only">{font.name} style</span>
                          <select
                            aria-label={`${font.name} style`}
                            value={font.activeStyle}
                            onChange={(event) =>
                              setFavorites((items) =>
                                items.map((item) =>
                                  item.name === font.name
                                    ? {
                                        ...item,
                                        activeStyle: event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                          >
                            {Object.keys(font.styles).map((style) => (
                              <option value={style} key={style}>
                                {styleLabel(style)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          className="text-button"
                          onClick={() => {
                            setReplaceName(font.name);
                            setPendingFont(null);
                            switchWorkspace("browse", true);
                          }}
                        >
                          Replace
                        </button>
                      </div>
                    </article>
                  ))}
                  {!favorites.length && (
                    <div className="empty-favorites">
                      <div>
                        <h3>No favorites selected</h3>
                        <p>
                          Nothing selected yet. Add a font to compare your
                          wording.
                        </p>
                        <button
                          className="secondary-button"
                          onClick={() => switchWorkspace("browse", true)}
                        >
                          Explore all lettering
                        </button>
                      </div>
                      {text.trim() && (
                        <div className="unselected-sample">
                          <span className="eyebrow">
                            GARAMOND · SAMPLE ONLY
                          </span>
                          <div className="inspiration-preview">
                            <TextPreview
                              text={text}
                              font={inspirationFont}
                              large
                            />
                          </div>
                          <button
                            className="text-button"
                            onClick={() => chooseFont(inspirationFont)}
                          >
                            Keep Garamond +
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {favorites.length > 0 && favorites.length < 3 && (
                    <div className="favorite-slot">
                      <span aria-hidden="true">＋</span> Room for{" "}
                      {3 - favorites.length} more. One favorite is fine, too.
                    </div>
                  )}
                  {monogramInfo && (
                    <article className="favorite-card">
                      <div className="favorite-card-top">
                        <h3>Your monogram</h3>
                        <button
                          className="remove-button"
                          aria-label="Remove monogram"
                          onClick={() => setMonogramInfo(null)}
                        >
                          ×
                        </button>
                      </div>
                      <MonogramSample info={monogramInfo} />
                      <button
                        className="text-button"
                        onClick={() => setShowMonogram(true)}
                      >
                        Create a different monogram
                      </button>
                    </article>
                  )}
                </div>
                <p className="proof-note">
                  Arch will use your choices to prepare an engraving proof for
                  your review.
                </p>
              </section>
            </div>
            <div className="selection-dock mobile-shortlist">
              <div className="dock-selection">
                <a
                  href="#favorites"
                  onClick={(event) => {
                    event.preventDefault();
                    switchWorkspace("compare", true);
                  }}
                >
                  <span className="dock-label">YOUR CHOICES</span>
                  <span className="count-badge">
                    {favorites.length} of 3 selected
                  </span>
                </a>
                <div className="dock-fonts" aria-label="Selected favorites">
                  {favorites.map((font, index) => (
                    <button
                      key={font.name}
                      onClick={() => switchWorkspace("compare", true)}
                    >
                      <span>{index + 1}</span>
                      {font.name}
                    </button>
                  ))}
                  {!favorites.length && (
                    <span>
                      {text.trim()
                        ? "Select a font to compare your wording."
                        : "Start with the wording from your order."}
                    </span>
                  )}
                  {monogramInfo && (
                    <button onClick={() => switchWorkspace("compare", true)}>
                      ✓ Monogram added
                    </button>
                  )}
                </div>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  if (ready) openReview();
                  else if (text.trim()) switchWorkspace("browse", true);
                  else {
                    textRef.current?.focus();
                    textRef.current?.scrollIntoView({ block: "center" });
                  }
                }}
              >
                {ready
                  ? "Review my choices"
                  : text.trim()
                    ? "Choose a font"
                    : "Enter wording"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {!draftSaved && (
              <p role="status" className="inline-notice">
                Your browser could not save this draft. Keep this page open
                until you finish.
              </p>
            )}
          </>
        ) : step === "review" ? (
          <>
            <button
              className="back-link"
              disabled={submitting}
              onClick={() => setStep("choose")}
            >
              ← Back to my choices
            </button>
            <div className="review-intro">
              <p className="eyebrow">REVIEW & SEND</p>
              <h1 ref={pageHeading} tabIndex={-1}>
                Ready to send to Arch?
              </h1>
              <p>
                Check your wording and favorites, then tell us which order they
                belong to.
              </p>
            </div>
            <form
              onSubmit={send}
              className="review-layout"
              aria-busy={submitting}
            >
              <section className="customer-section">
                <h2>Your order details</h2>
                <p className="muted">
                  So we can match your choices to your engraving order.
                </p>
                <fieldset disabled={submitting}>
                  <label htmlFor="order-number">
                    Order number <span>Required</span>
                  </label>
                  <input
                    id="order-number"
                    name="orderNumber"
                    required
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                    autoComplete="off"
                  />
                  <label htmlFor="customer-name">
                    Your name <span>Required</span>
                  </label>
                  <input
                    id="customer-name"
                    name="name"
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    autoComplete="name"
                  />
                  <label htmlFor="company">
                    Company <span>Optional</span>
                  </label>
                  <input
                    id="company"
                    name="organization"
                    value={customerCompany}
                    onChange={(event) => setCustomerCompany(event.target.value)}
                    autoComplete="organization"
                  />
                </fieldset>
                <div className="next-step">
                  <h3>What happens next?</h3>
                  <p>
                    Our designer will use your preferences to prepare your proof
                    for review.
                  </p>
                </div>
                {error && (
                  <div className="submission-error" role="alert">
                    <h3>
                      {error.code === "duplicate"
                        ? "An existing request needs a check"
                        : "We couldn’t confirm your submission"}
                    </h3>
                    <p>{error.message}</p>
                    <p>Your wording, favorites, and details are still here.</p>
                    <a
                      className="text-button contact-link"
                      href="https://archengraving.com/contact"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Contact Arch <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                )}
                <div className="submit-status" role="status">
                  {submitting
                    ? "Sending your choices… Please keep this page open."
                    : ""}
                </div>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Sending…"
                    : error && error.code !== "duplicate"
                      ? "Try sending again"
                      : "Send my choices to Arch"}
                  {!submitting && <span aria-hidden="true">→</span>}
                </button>
                <p className="review-help">
                  You’ll see a confirmation and a copy of your request.
                </p>
              </section>
              <RequestSummary request={request} />
            </form>
          </>
        ) : (
          <div className="receipt-page">
            <div className="receipt-intro">
              <span className="success-check" aria-hidden="true">
                ✓
              </span>
              <p className="eyebrow">SENT TO ARCH ENGRAVING</p>
              <h1 ref={pageHeading} tabIndex={-1}>
                Your choices are in.
              </h1>
              <p>
                Thank you, {receipt.customerName}. Your lettering request has
                been received.
              </p>
              <div className="receipt-next">
                <strong>Next, we’ll prepare your proof.</strong>
                <p>
                  Our designer will use your favorites and notes. You can close
                  this page; there’s no need to submit again.
                </p>
              </div>
            </div>
            <section className="receipt-details">
              <div>
                <span className="eyebrow">YOUR RECEIPT</span>
                <h2>Order {receipt.orderNumber}</h2>
                <p>
                  {receipt.customerName}
                  {receipt.customerCompany && ` · ${receipt.customerCompany}`}
                </p>
                <p className="muted small">
                  Received {new Date(receipt.savedAt).toLocaleString()}
                </p>
              </div>
              <button className="secondary-button" onClick={downloadReceipt}>
                Save receipt ↓
              </button>
            </section>
            {!receiptSaved && (
              <p className="inline-notice">
                Your browser couldn’t retain this receipt. Save a copy before
                closing.
              </p>
            )}
            <RequestSummary request={receipt} />
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>ARCH ENGRAVING</span>
        <p>Lettering preferences. Prepared into a proof by Arch.</p>
        <span>Font Hub</span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      {showMonogram && (
        <MonogramMaker
          fontLibrary={fontLibrary}
          onClose={() => setShowMonogram(false)}
          onInsert={(info) => {
            setMonogramInfo(info);
            setShowMonogram(false);
          }}
        />
      )}
    </div>
  );
}
