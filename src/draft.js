import { defaultStyle, findFont } from "./fontLibrary";

export const initialAssignment = { fontName: "Garamond", styleKey: "regular" };
export const cleanAssignment = (value) => {
  const font = findFont(value?.fontName);
  return {
    fontName: font.name,
    styleKey: font.styles[value?.styleKey]
      ? value.styleKey
      : defaultStyle(font),
  };
};

// Keep existing lines with their lettering when lines are inserted or removed.
// The history also restores lettering when wording is temporarily replaced.
export function reconcileLines(
  previousText,
  nextText,
  assignments,
  history = {},
) {
  const previous = previousText.split("\n");
  const next = nextText.split("\n");
  const saved = { ...history };
  previous.forEach((line, i) => {
    if (line) saved[`${i}:${line}`] = assignments[i] || initialAssignment;
  });
  let prefix = 0;
  while (
    prefix < previous.length &&
    prefix < next.length &&
    previous[prefix] === next[prefix]
  )
    prefix++;
  let suffix = 0;
  while (
    suffix < previous.length - prefix &&
    suffix < next.length - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  )
    suffix++;
  const result = next.map((line, i) => {
    if (i < prefix) return assignments[i] || initialAssignment;
    if (i >= next.length - suffix)
      return (
        assignments[previous.length - next.length + i] || initialAssignment
      );
    return (
      saved[`${i}:${line}`] ||
      assignments[i] ||
      assignments[Math.max(0, i - 1)] ||
      initialAssignment
    );
  });
  return {
    assignments: result,
    history: Object.fromEntries(Object.entries(saved).slice(-150)),
  };
}

export function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}
export function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
