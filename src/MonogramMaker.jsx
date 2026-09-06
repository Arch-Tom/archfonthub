import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
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
      if (!splitInitial || !splitName) return;
      monogramData = {
        type: "split",
        initial: splitInitial,
        name: splitName,
        font: selectedFont,
        style: activeStyle,
      };
    } else {
      const [first, middle, last] = initials;
      if (!first || !middle || !last) return;
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
              fontFamily={selectedFont.styles?.[activeStyle]}
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
      return !splitInitial || !splitName;
    }
    return !initials[0] || !initials[1] || !initials[2];
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
      className="monogram-dialog"
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
        className="monogram-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="monogram-header">
          <div>
            <h2 id="monogram-title" className="monogram-title">
              Monogram Maker
            </h2>
            <p id="monogram-help" className="monogram-help">
              Add a monogram preference for your designer.
            </p>
          </div>
          <button
            className="monogram-close"
            type="button"
            onClick={onClose}
            aria-label="Close Monogram Maker"
          >
            &times;
          </button>
        </header>

        <div className="monogram-workspace">
          <div className="monogram-controls">
            <div className="monogram-setup">
              {/* Monogram Style Selection */}
              <div className="monogram-mode-selector">
                {["classic", "flat", "circular", "split"].map((style) => (
                  <button
                    type="button"
                    key={style}
                    aria-pressed={monogramStyle === style}
                    onClick={() => setMonogramStyle(style)}
                    className="monogram-mode"
                  >
                    {style === "split" ? "Split Letter" : style}
                  </button>
                ))}
              </div>

              {/* Conditional Inputs based on Style */}
              {monogramStyle === "split" ? (
                <div className="monogram-initials-section">
                  <h3 className="monogram-section-title">Initial & Name</h3>
                  <p id="monogram-mode-help" className="monogram-mode-help">
                    Enter an initial and a name to insert your monogram.
                  </p>
                  <div className="monogram-inputs monogram-split-inputs">
                    <input
                      aria-label="Split monogram initial"
                      aria-describedby="monogram-mode-help"
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
                      className="monogram-initial-input"
                    />
                    <input
                      aria-label="Split monogram name"
                      aria-describedby="monogram-mode-help"
                      maxLength={30}
                      ref={splitNameInputRef}
                      type="text"
                      placeholder="SMITH"
                      value={splitName}
                      onChange={(e) => setSplitName(e.target.value.toUpperCase())}
                      className="monogram-name-input"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="monogram-section-title">Your Initials</h3>
                  <p id="monogram-mode-help" className="monogram-mode-help">
                    {monogramStyle === "classic"
                      ? "Enter all three initials in display order. The larger center letter is usually the last-name initial."
                      : monogramStyle === "flat"
                        ? "Enter all three initials in display order. All letters will be the same size."
                        : "Enter all three initials in display order to create your circular monogram."}
                  </p>
                  <div className="monogram-inputs">
                    {initials.map((initial, index) => (
                      <label className="monogram-initial-field" key={index}>
                        <span>{["Left", "Center", "Right"][index]}</span>
                        <input
                          aria-label={
                            [
                              "Left initial",
                              "Center initial (larger in classic style)",
                              "Right initial",
                            ][index]
                          }
                          aria-describedby="monogram-mode-help"
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          placeholder={["N", "X", "D"][index]}
                          value={initial}
                          onChange={(e) => handleInitialChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          maxLength={1}
                          className="monogram-initial-input"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Frame Style for Circular Monogram */}
            {monogramStyle === "circular" && (
              <div className="monogram-frames">
                <h3 className="monogram-section-title">Frame Style</h3>
                <div className="monogram-frame-selector">
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
                      className="monogram-frame"
                    >
                      {style.replace("-", " & ")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview Area */}
            <div className="monogram-preview-section">
              <div className="monogram-preview-surface">
                <span className="monogram-preview-label">Preview</span>
                <div
                  id="monogram-preview-box"
                  className="monogram-preview-box"
                >
                  {monogramStyle === "split" ? (
                    <SplitLetterMonogram
                      initial={splitInitial || "S"}
                      name={splitName || "NAME"}
                      fontFamily={selectedFont?.styles?.[activeStyle]}
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
                      fontFamily={selectedFont?.styles?.[activeStyle]}
                      fontSize={fontSize}
                      disableScaling={monogramStyle === "flat"}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Font Selection Grid */}
          {monogramStyle !== "circular" && (
            <div className="monogram-fonts">
              <h3 className="monogram-section-title">
                Choose a Font {monogramStyle === "split" && "for the Initial"}
              </h3>
              <div className="monogram-font-grid">
                {visibleFonts.map((font) => (
                  <button
                    type="button"
                    key={font.name}
                    aria-pressed={selectedFont.name === font.name}
                    onClick={() => {
                      setSelectedFont(font);
                      setActiveStyle(Object.keys(font.styles)[0]);
                    }}
                    className="monogram-font-option"
                  >
                    <CircularMonogram
                      isCircular={false}
                      text={["N", "X", "D"]}
                      fontFamily={font.styles?.[Object.keys(font.styles)[0]]}
                      fontSize={32}
                      disableScaling={monogramStyle === "flat"}
                      sideScale={1.2}
                      middleScale={1.5}
                    />
                    <span className="monogram-font-name">
                      {font.name}
                    </span>
                    <span className="monogram-font-category">
                      {font.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="monogram-footer">
          <button
            type="button"
            onClick={handleInsert}
            disabled={isInsertDisabled()}
            className="monogram-insert"
          >
            Insert Monogram
          </button>
          <button
            type="button"
            onClick={onClose}
            className="monogram-cancel"
          >
            Cancel
          </button>
        </footer>
      </div>
    </dialog>
  );
}
