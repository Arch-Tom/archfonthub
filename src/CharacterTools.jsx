import { useId, useRef, useState } from "react";
import "./CharacterTools.css";

const symbols = [
  "©",
  "®",
  "™",
  "&",
  "#",
  "+",
  "–",
  "—",
  "…",
  "•",
  "°",
  "·",
  "♥",
  "♡",
  "♦",
  "♢",
  "♣",
  "♧",
  "♠",
  "♤",
  "★",
  "☆",
  "♪",
  "♫",
  "←",
  "→",
  "↑",
  "↓",
  "∞",
  "†",
  "✡\uFE0E",
  "✞",
  "✠",
  "±",
  "½",
  "¼",
  "Α",
  "Β",
  "Γ",
  "Δ",
  "Ε",
  "Ζ",
  "Η",
  "Θ",
  "Ι",
  "Κ",
  "Λ",
  "Μ",
  "Ν",
  "Ξ",
  "Ο",
  "Π",
  "Ρ",
  "Σ",
  "Τ",
  "Υ",
  "Φ",
  "Χ",
  "Ψ",
  "Ω",
];
const accents = {
  A: "ÀàÁáÂâÃãÄäÅåÆæ",
  C: "Çç",
  E: "ÈèÉéÊêËë",
  I: "ÌìÍíÎîÏï",
  N: "Ññ",
  O: "ÒòÓóÔôÕõÖöØøŒœ",
  S: "Ššß",
  U: "ÙùÚúÛûÜü",
  Y: "ÝýŸÿ",
  Z: "Žž",
};
const letters = [
  ["א", "Alef"],
  ["ב", "Bet"],
  ["ג", "Gimel"],
  ["ד", "Dalet"],
  ["ה", "He"],
  ["ו", "Vav"],
  ["ז", "Zayin"],
  ["ח", "Het"],
  ["ט", "Tet"],
  ["י", "Yod"],
  ["כ", "Kaf"],
  ["ך", "Final kaf"],
  ["ל", "Lamed"],
  ["מ", "Mem"],
  ["ם", "Final mem"],
  ["נ", "Nun"],
  ["ן", "Final nun"],
  ["ס", "Samekh"],
  ["ע", "Ayin"],
  ["פ", "Pe"],
  ["ף", "Final pe"],
  ["צ", "Tsadi"],
  ["ץ", "Final tsadi"],
  ["ק", "Qof"],
  ["ר", "Resh"],
  ["ש", "Shin"],
  ["ת", "Tav"],
];
const vowels = [
  ["ְ", "Shva"],
  ["ַ", "Patah"],
  ["ָ", "Qamats"],
  ["ֶ", "Segol"],
  ["ֵ", "Tsere"],
  ["ִ", "Hiriq"],
  ["ֹ", "Holam"],
  ["ּ", "Dagesh"],
  ["ֻ", "Qubuts"],
  ["ֿ", "Rafe"],
  ["ׁ", "Shin dot"],
  ["ׂ", "Sin dot"],
  ["ֱ", "Hataf segol"],
  ["ֲ", "Hataf patah"],
  ["ֳ", "Hataf qamats"],
];
const tabs = ["Symbols", "Accents", "Hebrew"];

export default function CharacterTools({ onInsert }) {
  const id = useId();
  const disclosureRef = useRef(null);
  const tabRefs = useRef([]);
  const hebrewRef = useRef(null);
  const cursorRef = useRef({ start: 0, end: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [hebrewText, setHebrewText] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const insertCharacter = (character) => {
    onInsert(character);
    setAnnouncement(`Inserted ${character} into your wording.`);
  };
  const closeTools = () => {
    disclosureRef.current.open = false;
    disclosureRef.current.querySelector("summary").focus();
  };
  const moveTab = (event) => {
    const next =
      event.key === "ArrowRight"
        ? (activeTab + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (activeTab + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };
  const saveCursor = () => {
    const field = hebrewRef.current;
    if (field)
      cursorRef.current = {
        start: field.selectionStart,
        end: field.selectionEnd,
      };
  };
  const updateHebrew = (inserted, backspace = false) => {
    let { start, end } = cursorRef.current;
    if (backspace && start === end) {
      const beforeCursor = hebrewText.slice(0, start);
      const previous =
        typeof Intl.Segmenter === "function"
          ? Array.from(
              new Intl.Segmenter("he", { granularity: "grapheme" }).segment(
                beforeCursor,
              ),
            ).at(-1)?.segment
          : beforeCursor.match(/[^\p{Mark}]\p{Mark}*$/u)?.[0] ||
            Array.from(beforeCursor).at(-1);
      start -= previous?.length || 0;
    }
    const next = hebrewText.slice(0, start) + inserted + hebrewText.slice(end);
    const position = start + inserted.length;
    setHebrewText(next);
    cursorRef.current = { start: position, end: position };
    requestAnimationFrame(() => {
      hebrewRef.current?.focus();
      hebrewRef.current?.setSelectionRange(position, position);
    });
  };
  const insertHebrew = () => {
    if (!hebrewText.trim()) return;
    onInsert(hebrewText);
    setHebrewText("");
    cursorRef.current = { start: 0, end: 0 };
    disclosureRef.current.open = false;
    setAnnouncement("Hebrew text inserted into your wording.");
  };

  return (
    <details
      className="character-tools"
      ref={disclosureRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && disclosureRef.current.open) {
          event.preventDefault();
          closeTools();
        }
      }}
    >
      <summary>Symbols & languages</summary>
      <div className="character-tools-panel">
        <div className="character-tools-heading">
          <div
            role="tablist"
            aria-label="Character tools"
            className="character-tools-tabs"
            onKeyDown={moveTab}
          >
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={activeTab === index}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={activeTab === index ? 0 : -1}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="character-tools-close"
            onClick={closeTools}
            aria-label="Close character tools"
          >
            ×
          </button>
        </div>
        {tabs.map((tab, index) => (
          <div
            key={tab}
            role="tabpanel"
            id={`${id}-panel-${index}`}
            aria-labelledby={`${id}-tab-${index}`}
            hidden={activeTab !== index}
            tabIndex={0}
            className="character-tools-content"
          >
            {index === 0 && (
              <>
                <p>
                  Choose a symbol to insert at your cursor in the wording above.
                </p>
                <div className="character-tools-grid">
                  {symbols.map((symbol) => (
                    <button
                      type="button"
                      key={symbol}
                      aria-label={`Insert ${symbol}`}
                      onClick={() => insertCharacter(symbol)}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </>
            )}
            {index === 1 && (
              <>
                <p>Choose an accented character to insert into your wording.</p>
                <div className="character-tools-accents">
                  {Object.entries(accents).map(([letter, characters]) => (
                    <div
                      key={letter}
                      className="character-tools-accent-row"
                      role="group"
                      aria-label={`${letter} characters`}
                    >
                      <span aria-hidden="true">{letter}</span>
                      <div className="character-tools-grid">
                        {Array.from(characters).map((character) => (
                          <button
                            type="button"
                            key={character}
                            aria-label={`Insert ${character}`}
                            onClick={() => insertCharacter(character)}
                          >
                            {character}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {index === 2 && (
              <>
                <label htmlFor={`${id}-hebrew`}>Compose Hebrew text</label>
                <p id={`${id}-hebrew-help`}>
                  Type or use the keys below. Add vowel marks after a letter,
                  then insert your text.
                </p>
                <textarea
                  id={`${id}-hebrew`}
                  ref={hebrewRef}
                  dir="rtl"
                  lang="he"
                  rows={2}
                  aria-describedby={`${id}-hebrew-help`}
                  value={hebrewText}
                  onSelect={saveCursor}
                  onChange={(event) => {
                    setHebrewText(event.target.value);
                    saveCursor();
                  }}
                />
                <div
                  className="character-tools-grid character-tools-hebrew"
                  dir="rtl"
                  role="group"
                  aria-label="Hebrew letters"
                >
                  {letters.map(([letter, name]) => (
                    <button
                      type="button"
                      key={letter}
                      lang="he"
                      aria-label={name}
                      title={name}
                      onClick={() => updateHebrew(letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <p className="character-tools-vowel-label">
                  Vowel marks (niqqud)
                </p>
                <div
                  className="character-tools-grid character-tools-hebrew"
                  dir="rtl"
                  role="group"
                  aria-label="Hebrew vowel marks"
                >
                  {vowels.map(([mark, name]) => (
                    <button
                      type="button"
                      key={mark}
                      lang="he"
                      aria-label={name}
                      title={name}
                      onClick={() => updateHebrew(mark)}
                    >
                      א{mark}
                    </button>
                  ))}
                </div>
                <div className="character-tools-actions">
                  <button type="button" onClick={() => updateHebrew(" ")}>
                    Space
                  </button>
                  <button
                    type="button"
                    title="Remove the previous letter and its vowel marks"
                    onClick={() => updateHebrew("", true)}
                    disabled={!hebrewText}
                  >
                    Backspace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHebrewText("");
                      cursorRef.current = { start: 0, end: 0 };
                      hebrewRef.current?.focus();
                    }}
                    disabled={!hebrewText}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="character-tools-insert"
                    onClick={insertHebrew}
                    disabled={!hebrewText.trim()}
                  >
                    Insert Hebrew text
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <span role="status" className="character-tools-status">
          {announcement}
        </span>
      </div>
    </details>
  );
}
