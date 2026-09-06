import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import { getFontCoverage, getPreviewFontFamily } from "./fontCoverage.js";
import CircularMonogram from "./CircularMonogram.jsx";
import SplitLetterMonogram from "./SplitLetterMonogram.jsx";
import "./MonogramMaker.css";

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
  const monogramFonts = useMemo(() => {
    const fonts = Object.entries(fontLibrary).flatMap(([category, fonts]) =>
      fonts.map((font) => ({ ...font, category })),
    );
    return [
      ...fonts,
      {
        name: "Circular Monogram",
        category: "Special",
        circular: true,
        styles: {},
      },
    ];
  }, [fontLibrary]);

  const defaultFont = useMemo(
    () => monogramFonts.find((f) => !f.circular) || monogramFonts[0],
    [monogramFonts],
  );

  const [monogramStyle, setMonogramStyle] = useState("classic");
  const [selectedFont, setSelectedFont] = useState(defaultFont);
  const [activeStyle, setActiveStyle] = useState(
    Object.keys(defaultFont.styles)[0],
  );

  // State for classic/flat/circular
  const [initials, setInitials] = useState(["", "", ""]);
  const [frameStyle, setFrameStyle] = useState("none");

  // State for split-letter
  const [splitInitial, setSplitInitial] = useState("");
  const [splitName, setSplitName] = useState("");

  const [fontSize] = useState(100);
  const dialogRef = useRef(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previouslyFocused?.focus();
    };
  }, []);
  const splitInitialInputRef = useRef(null);
  const splitNameInputRef = useRef(null);

  useEffect(() => {
    if (monogramStyle === "split") {
      splitInitialInputRef.current?.focus();
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [monogramStyle]);

  // UPDATE: This effect now sets the default font based on the selected monogram style.
  useEffect(() => {
    if (monogramStyle === "circular") {
      const circularFont = monogramFonts.find((f) => f.circular);
      if (circularFont) {
        setSelectedFont(circularFont);
        setActiveStyle(null);
      }
    } else if (monogramStyle === "split") {
      const timesFont = monogramFonts.find((f) => f.name === "Times New Roman");
      if (timesFont) {
        setSelectedFont(timesFont);
        setActiveStyle(Object.keys(timesFont.styles)[0] || "regular");
      } else {
        // Fallback to the first available font if Times New Roman isn't found
        const firstStandardFont = monogramFonts.find((f) => !f.circular);
        if (firstStandardFont) {
          setSelectedFont(firstStandardFont);
          setActiveStyle(Object.keys(firstStandardFont.styles)[0]);
        }
      }
    } else {
      // 'classic' or 'flat'
      const firstStandardFont = monogramFonts.find((f) => !f.circular);
      if (firstStandardFont) {
        setSelectedFont(firstStandardFont);
        setActiveStyle(Object.keys(firstStandardFont.styles)[0]);
      }
    }
  }, [monogramStyle, monogramFonts]);

  const visibleFonts = monogramFonts.filter((font) => !font.circular);
  const coverageNotice = monogramStyle === "circular"
    ? initials.map((initial, index) => getFontCoverage(
        ["LeftCircleMonogram", "MiddleCircleMonogram", "RightCircleMonogram"][index], initial,
      ).message).filter(Boolean).join(" ")
    : getFontCoverage(selectedFont?.styles?.[activeStyle],
        monogramStyle === "split" ? splitInitial + splitName : initials.join(""),
      ).message;

  const handleInitialChange = (e, index) => {
    const newInitials = [...initials];
    newInitials[index] =
      Array.from(e.target.value.normalize("NFC"))[0]?.toLocaleUpperCase() || "";
    setInitials(newInitials);
    if (e.target.value && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !initials[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInsert = () => {
    let monogramData;
    let htmlString = null;

    if (monogramStyle === "split") {
      if (!splitInitial.trim() || !splitName.trim()) return;
      monogramData = {
        type: "split",
        initial: splitInitial,
        name: splitName,
        font: selectedFont,
        style: activeStyle,
      };
    } else {
      const [first, middle, last] = initials;
      if ([first, middle, last].some((initial) => !initial.trim())) return;
      monogramData = {
        type: monogramStyle,
        text: [first, middle, last],
        font: selectedFont,
        style: activeStyle,
        fontSize,
        isCircular: monogramStyle === "circular",
        frameStyle: monogramStyle === "circular" ? frameStyle : "none",
        disableScaling: monogramStyle === "flat",
      };

      const previewComponent = (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {monogramStyle === "circular" ? (
            <CircularMonogram
              text={initials}
              fontSize={80}
              isCircular={true}
              frameStyle={frameStyle}
            />
          ) : (
            <CircularMonogram
              isCircular={false}
              text={initials}
              fontFamily={getPreviewFontFamily(selectedFont.styles?.[activeStyle])}
              fontSize={fontSize}
              disableScaling={monogramStyle === "flat"}
            />
          )}
        </div>
      );
      htmlString = ReactDOMServer.renderToStaticMarkup(previewComponent);
    }

    onInsert({ htmlString, data: monogramData });
    onClose();
  };

  const isInsertDisabled = () => {
    if (monogramStyle === "split") {
      return !splitInitial.trim() || !splitName.trim();
    }
    return initials.some((initial) => !initial.trim());
  };

  const keepFocusInDialog = (event) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      ),
    ].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="monogram-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-[3px] p-0 sm:p-2"
      aria-labelledby="monogram-title"
      aria-describedby="monogram-help"
      onKeyDown={keepFocusInDialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="monogram-dialog-content relative bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl h-screen sm:h-[90vh] flex flex-col overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 bg-white/95 border-b border-slate-200 flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4">
          <div>
            <h2
              id="monogram-title"
              className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight"
            >
              Monogram Maker
            </h2>
            <p id="monogram-help" className="text-slate-500 text-xs sm:text-sm">
              Add a monogram preference for your designer.
            </p>
          </div>
          <button
            className="text-3xl font-light text-slate-400 hover:text-slate-800 transition p-2 -mr-2"
            type="button"
            onClick={onClose}
            aria-label="Close Monogram Maker"
          >
            &times;
          </button>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto pb-6 items-center px-4 sm:px-6">
          <div className="w-full max-w-xl flex flex-col gap-4 mt-6">
            {/* Monogram Style Selection */}
            <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1 rounded-xl shadow-inner overflow-x-auto">
              {["classic", "flat", "circular", "split"].map((style) => (
                <button
                  type="button"
                  key={style}
                  aria-pressed={monogramStyle === style}
                  onClick={() => setMonogramStyle(style)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition capitalize ${monogramStyle === style ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
                >
                  {style === "split" ? "Split Letter" : style}
                </button>
              ))}
            </div>

            {/* Conditional Inputs based on Style */}
            {monogramStyle === "split" ? (
              <div className="flex flex-col items-center gap-3 mt-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-1 text-center">
                  Initial & Name
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <input
                    aria-label="Split monogram initial"
                    ref={splitInitialInputRef}
                    type="text"
                    placeholder="S"
                    value={splitInitial}
                    onChange={(e) =>
                      setSplitInitial(
                        Array.from(
                          e.target.value.normalize("NFC"),
                        )[0]?.toLocaleUpperCase() || "",
                      )
                    }
                    maxLength={1}
                    className="w-16 h-16 bg-white border-2 border-slate-200 text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <input
                    aria-label="Split monogram name"
                    maxLength={30}
                    ref={splitNameInputRef}
                    type="text"
                    placeholder="SMITH"
                    value={splitName}
                    onChange={(e) => setSplitName(e.target.value.toUpperCase())}
                    className="h-16 px-4 bg-white border-2 border-slate-200 text-2xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-48"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                  Your Initials
                </h3>
                <div className="flex justify-center gap-3">
                  {initials.map((initial, index) => (
                    <input
                      aria-label={
                        [
                          "Left initial",
                          "Center initial (larger in classic style)",
                          "Right initial",
                        ][index]
                      }
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      placeholder={["N", "X", "D"][index]}
                      value={initial}
                      onChange={(e) => handleInitialChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      maxLength={1}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-2xl sm:text-3xl md:text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Frame Style for Circular Monogram */}
          {monogramStyle === "circular" && (
            <div className="w-full max-w-xl mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                Frame Style
              </h3>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-xl shadow-inner">
                {[
                  "none",
                  "solid",
                  "double",
                  "dotted",
                  "outline",
                  "thick-thin",
                ].map((style) => (
                  <button
                    type="button"
                    key={style}
                    aria-pressed={frameStyle === style}
                    onClick={() => setFrameStyle(style)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize transition w-full ${frameStyle === style ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
                  >
                    {style.replace("-", " & ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {monogramStyle !== "circular" && Object.keys(selectedFont.styles).length > 1 && (
            <div className="w-full max-w-xl mt-6">
              <label htmlFor="monogram-font-style" className="block text-sm font-semibold text-slate-700 mb-2">
                Monogram font style
              </label>
              <select
                id="monogram-font-style"
                value={activeStyle || ""}
                onChange={(event) => setActiveStyle(event.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-900"
              >
                {Object.keys(selectedFont.styles).map((style) => (
                  <option value={style} key={style}>{style.replace(/([A-Z])/g, " $1")}</option>
                ))}
              </select>
            </div>
          )}

          {/* Live Preview Area */}
          <div className="w-full max-w-xl mt-6">
            <div className="w-full flex flex-col items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 mb-1">
                Preview
              </span>
              <div
                id="monogram-preview-box"
                className="w-full max-w-[400px] flex items-center justify-center rounded-xl border border-slate-200 shadow-inner bg-white px-2"
                style={{ height: "180px", minHeight: "180px" }}
              >
                {monogramStyle === "split" ? (
                  <SplitLetterMonogram
                    initial={splitInitial || "S"}
                    name={splitName || "NAME"}
                    fontFamily={getPreviewFontFamily(selectedFont?.styles?.[activeStyle])}
                  />
                ) : monogramStyle === "circular" ? (
                  <CircularMonogram
                    text={initials.map((i) => i || "A")}
                    fontSize={80}
                    isCircular={true}
                    frameStyle={frameStyle}
                  />
                ) : (
                  <CircularMonogram
                    isCircular={false}
                    text={[
                      initials[0] || "N",
                      initials[1] || "X",
                      initials[2] || "D",
                    ]}
                    fontFamily={getPreviewFontFamily(selectedFont?.styles?.[activeStyle])}
                    fontSize={fontSize}
                    disableScaling={monogramStyle === "flat"}
                  />
                )}
              </div>
            </div>
          </div>

          {coverageNotice && (
            <p className="monogram-coverage-notice w-full max-w-xl mt-4 text-sm text-slate-700" role="status">
              {coverageNotice}
            </p>
          )}

          {/* Font Selection Grid */}
          {monogramStyle !== "circular" && (
            <div className="w-full max-w-2xl mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                Choose a Font {monogramStyle === "split" && "for the Initial"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visibleFonts.map((font) => (
                  <button
                    type="button"
                    key={font.name}
                    aria-pressed={selectedFont.name === font.name}
                    onClick={() => {
                      setSelectedFont(font);
                      setActiveStyle(Object.keys(font.styles)[0]);
                    }}
                    className={`group flex flex-col items-center justify-between rounded-xl border-2 transition h-32 w-full p-3 ${selectedFont.name === font.name ? "border-blue-600 bg-blue-50 shadow-md" : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"}`}
                  >
                    <CircularMonogram
                      isCircular={false}
                      text={["N", "X", "D"]}
                      fontFamily={getPreviewFontFamily(font.styles?.[Object.keys(font.styles)[0]])}
                      fontSize={32}
                      disableScaling={monogramStyle === "flat"}
                      sideScale={1.2}
                      middleScale={1.5}
                    />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 text-center">
                      {font.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {font.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="shrink-0 w-full bg-white/95 border-t border-slate-200 px-4 py-3 flex flex-row-reverse justify-between gap-3 z-20">
          <button
            type="button"
            onClick={handleInsert}
            disabled={isInsertDisabled()}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Monogram
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-slate-200 text-slate-700 rounded-2xl hover:bg-slate-300 font-semibold transition-colors shadow-sm text-base"
          >
            Cancel
          </button>
        </footer>
      </div>
    </dialog>
  );
}
