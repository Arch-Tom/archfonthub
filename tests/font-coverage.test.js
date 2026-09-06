import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { brotliDecompressSync, inflateSync } from "node:zlib";
import { getFontCoverage, getPreviewFontFamily } from "../src/fontCoverage.js";
import data from "../src/fontCoverageData.js";

// Parse cmap bytes independently of the FontTools audit generator, including
// the WOFF2 files browsers actually load. No font parser dependency is required.
function cmapTable(buffer) {
  const signature = buffer.toString("ascii", 0, 4);
  if (signature === "wOF2") {
    let cursor = 48;
    let dataOffset = 0;
    let cmap;
    const base128 = () => {
      let value = 0;
      for (let i = 0; i < 5; i++) {
        const byte = buffer[cursor++];
        value = value * 128 + (byte & 127);
        if (!(byte & 128)) return value;
      }
      throw new Error("Invalid WOFF2 length");
    };
    for (let i = 0; i < buffer.readUInt16BE(12); i++) {
      const flags = buffer[cursor++];
      const index = flags & 63;
      const tag = index === 63 ? buffer.toString("ascii", cursor, cursor += 4) : index;
      const originalLength = base128();
      const transformed = [10, 11, "glyf", "loca"].includes(tag)
        ? (flags >> 6) !== 3
        : (flags >> 6) !== 0;
      const length = transformed ? base128() : originalLength;
      if (tag === 0 || tag === "cmap") {
        assert.equal(transformed, false, "cmap must be untransformed");
        cmap = { offset: dataOffset, length };
      }
      dataOffset += length;
    }
    assert.ok(cmap, "WOFF2 must contain cmap");
    const decompressed = brotliDecompressSync(
      buffer.subarray(cursor, cursor + buffer.readUInt32BE(20)),
    );
    return decompressed.subarray(cmap.offset, cmap.offset + cmap.length);
  }
  const woff = signature === "wOFF";
  const count = buffer.readUInt16BE(woff ? 12 : 4);
  for (let i = 0; i < count; i++) {
    const cursor = (woff ? 44 : 12) + i * (woff ? 20 : 16);
    if (buffer.toString("ascii", cursor, cursor + 4) !== "cmap") continue;
    const offset = buffer.readUInt32BE(cursor + (woff ? 4 : 8));
    const length = buffer.readUInt32BE(cursor + (woff ? 8 : 12));
    const table = buffer.subarray(offset, offset + length);
    return woff && length < buffer.readUInt32BE(cursor + 12) ? inflateSync(table) : table;
  }
  throw new Error("Font has no cmap");
}

function unicodeMappings(cmap) {
  const mappings = new Set();
  for (let i = 0; i < cmap.readUInt16BE(2); i++) {
    const record = 4 + i * 8;
    const platform = cmap.readUInt16BE(record);
    const encoding = cmap.readUInt16BE(record + 2);
    if (platform !== 0 && !(platform === 3 && encoding === 1)) continue;
    const offset = cmap.readUInt32BE(record + 4);
    assert.equal(cmap.readUInt16BE(offset), 4, "Optima's Unicode cmap is format 4");
    const segments = cmap.readUInt16BE(offset + 6) / 2;
    for (let segment = 0; segment < segments; segment++) {
      const end = cmap.readUInt16BE(offset + 14 + segment * 2);
      const start = cmap.readUInt16BE(offset + 16 + segments * 2 + segment * 2);
      const delta = cmap.readInt16BE(offset + 16 + segments * 4 + segment * 2);
      const rangeLocation = offset + 16 + segments * 6 + segment * 2;
      const range = cmap.readUInt16BE(rangeLocation);
      for (let cp = start; cp <= end && cp < 0xffff; cp++) {
        const glyph = range === 0
          ? (cp + delta) & 0xffff
          : cmap.readUInt16BE(rangeLocation + range + (cp - start) * 2);
        if (glyph) mappings.add(cp);
      }
    }
  }
  return [...mappings].sort((a, b) => a - b);
}

for (const file of ["OPTIMA.TTF", "OPTIMA_0.TTF", "Optima.woff", "Optima.woff2", "Optima-Bold.woff", "Optima-Bold.woff2"]) {
  test(`${file} cannot map é or bullet to corrupt legacy outlines`, () => {
    const buffer = readFileSync(new URL(`../public/fonts/${file}`, import.meta.url));
    assert.deepEqual(unicodeMappings(cmapTable(buffer)), Array.from({ length: 95 }, (_, i) => i + 32));
  });
}

test("every audited browser font matches the asset used to derive its coverage", () => {
  assert.equal(Object.keys(data.faces).length, 102);
  for (const [family, face] of Object.entries(data.faces)) {
    const buffer = readFileSync(new URL(`../public${face.source}`, import.meta.url));
    assert.equal(createHash("sha256").update(buffer).digest("hex"), face.sha256, family);
  }
});

test("exact customer wording has known, explained gaps and safe bundled fallback", () => {
  const expected = {
    Optima: ["é", "•"],
    "Optima Bold": ["é", "•"],
    CollegiateBlackFLF: ["é"],
    CollegiateOutlineFLF: ["é"],
    "I Love Glitter": ["•"],
  };
  for (const family of Object.keys(data.faces).filter((name) => !name.includes("CircleMonogram"))) {
    const result = getFontCoverage(family, data.samples.customerWording);
    assert.deepEqual(result.missingCharacters, expected[family] || [], family);
    assert.deepEqual(result.unsupportedCharacters, [], family);
    assert.equal(Boolean(result.message), Boolean(expected[family]), family);
  }
});

test("Optima fallback is disclosed without rewriting customer text", () => {
  const wording = data.samples.customerWording;
  const result = getFontCoverage("Optima", wording);
  assert.equal(result.hasFallback, true);
  assert.match(result.message, /Optima uses fallback lettering for é •/);
  assert.equal(wording, "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026");
  assert.equal(getFontCoverage("Optima", "Renee O'Connor, R&D 2026").message, "");
});

test("representative accents, Hebrew niqqud and symbols distinguish bundled fallback from unverified shapes", () => {
  assert.deepEqual(getFontCoverage("Arial", data.samples.accents).missingCharacters, []);
  assert.deepEqual(getFontCoverage("Noto Rashi Hebrew Regular", data.samples.hebrew).missingCharacters, []);
  const result = getFontCoverage("Optima", `${data.samples.accents}${data.samples.hebrew}${data.samples.punctuationAndSymbols}`);
  // No bundled face contains the black star; disclose reliance on platform fonts.
  assert.deepEqual(result.unsupportedCharacters, ["★"]);
  assert.match(result.message, /cannot verify ★/);
  assert.equal(result.hasFallback, true);
});

test("unsupported supplementary-plane text is explicitly reported as a whole character", () => {
  const result = getFontCoverage("Optima", "A\u{1f984}\u{1f984}");
  assert.deepEqual(result.unsupportedCharacters, ["🦄"]);
  assert.match(result.message, /cannot verify 🦄/);
  assert.match(result.message, /wording will be sent unchanged/);
});

test("line breaks, spacing and Hebrew direction controls do not raise false warnings", () => {
  assert.equal(getFontCoverage("Arial", "\n\t A \u200fB\u200e\n").message, "");
  assert.equal(getFontCoverage("Arial", "").message, "");
});

test("font stack keeps the chosen style and audited Hebrew, Latin and symbol fallbacks", () => {
  assert.equal(getPreviewFontFamily("Optima"), '"Optima", "Arial", "Noto Rashi Hebrew Regular", "DejaVu Serif", sans-serif');
  assert.equal(getPreviewFontFamily("Arial").match(/"Arial"/g).length, 1);
});
