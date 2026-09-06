import coverage from "./fontCoverageData.js";

const fallbackFamilies = ["Arial", "Noto Rashi Hebrew Regular", "DejaVu Serif"];
const invisible = (character) => /^\s$/u.test(character) || [
  [0x200b, 0x200f], [0x202a, 0x202e], [0x2060, 0x2069], [0xfe00, 0xfe0f],
].some(([start, end]) => character.codePointAt(0) >= start && character.codePointAt(0) <= end);

function supports(family, character) {
  const codepoint = character.codePointAt(0);
  return coverage.faces[family]?.ranges.some(
    ([start, end]) => codepoint >= start && codepoint <= end,
  ) ?? false;
}

function characterList(characters) {
  const shown = characters.slice(0, 6).join(" ");
  return characters.length > 6 ? `${shown} and ${characters.length - 6} more` : shown;
}

/** Use bundled, audited fonts before relying on platform-specific fallback. */
export function getPreviewFontFamily(fontFamily) {
  const families = [...new Set([fontFamily, ...fallbackFamilies].filter(Boolean))];
  return `${families.map((family) => `"${family.replaceAll('"', "\\\"")}"`).join(", ")}, sans-serif`;
}

/**
 * Coverage is generated from actual browser font files and visible outlines.
 * This never changes, transliterates, or strips the customer's wording.
 * A missing character may be shown by browser fallback; the UI makes that clear.
 */
export function getFontCoverage(fontFamily, text = "") {
  const characters = [...new Set(Array.from(String(text)))].filter(
    (character) => !invisible(character),
  );
  const missingCharacters = characters.filter((character) => !supports(fontFamily, character));
  const unsupportedCharacters = missingCharacters.filter(
    (character) => !fallbackFamilies.some((family) => supports(family, character)),
  );
  const fallbackCharacters = missingCharacters.filter(
    (character) => !unsupportedCharacters.includes(character),
  );
  const notices = [];
  if (fallbackCharacters.length) {
    notices.push(`${fontFamily} uses fallback lettering for ${characterList(fallbackCharacters)}. Arch will confirm these characters in your proof.`);
  }
  if (unsupportedCharacters.length) {
    notices.push(`This preview cannot verify ${characterList(unsupportedCharacters)}. Your wording will be sent unchanged for Arch to check.`);
  }
  return {
    known: Boolean(coverage.faces[fontFamily]),
    missingCharacters,
    unsupportedCharacters,
    hasFallback: fallbackCharacters.length > 0,
    message: notices.join(" "),
  };
}
