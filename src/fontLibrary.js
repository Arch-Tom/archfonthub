import { getPreviewFontFamily } from "./fontCoverage";
import { fontLibrary, styleSortOrder } from "./constants/fontConfig";
export { fontLibrary };
export const allFonts = Object.entries(fontLibrary).flatMap(
  ([category, fonts]) => fonts.map((font) => ({ ...font, category })),
);
export const defaultStyle = (font) =>
  font.styles.regular ? "regular" : Object.keys(font.styles)[0];
export const styleLabel = (style = "") =>
  String(style || "regular")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
export const sortedStyles = (font) =>
  Object.keys(font.styles).sort(
    (a, b) => styleSortOrder.indexOf(a) - styleSortOrder.indexOf(b),
  );
export const findFont = (name) =>
  allFonts.find((font) => font.name === name) ||
  allFonts.find((font) => font.name === "Garamond");
export const familyFor = (name, style) =>
  getPreviewFontFamily(
    findFont(name).styles[style] ||
      findFont(name).styles[defaultStyle(findFont(name))],
  );
