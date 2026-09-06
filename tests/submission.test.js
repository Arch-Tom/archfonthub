import test from "node:test";
import assert from "node:assert/strict";
import {
  WORKER_URL,
  createFilename,
  generateSvgContent,
  submitRequest,
} from "../src/submission.js";

const favorite = {
  name: "Arial",
  styles: { regular: "Arial", bold: "Arial Bold" },
  activeStyle: "bold",
};
const snapshot = () => ({
  text: "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026",
  favorites: [favorite],
  notes: "UX TEST ONLY — NOT A REAL PRODUCTION ORDER",
  customerName: "Astra UX Test",
  customerCompany: "Arch UX Test",
  orderNumber: "900526",
});

test("keeps the production deterministic filename contract for retries", () => {
  assert.equal(
    createFilename(snapshot()),
    "900526_Astra_UX_Test_Arch_UX_Test.svg",
  );
  assert.equal(
    createFilename({
      ...snapshot(),
      customerName: " Renée O'Connor ",
      customerCompany: "",
    }),
    "900526_Rene_OConnor.svg",
  );
});

test("preserves Unicode, punctuation, XML safety, blank lines, whitespace and chosen style", () => {
  const svg = generateSvgContent({
    ...snapshot(),
    text: "  Renée O'Connor\n\nDirector, R&D <team>\nSt. Louis • 2026",
    notes: 'שלום\n\n<script>"&',
  });
  assert.match(svg, /Renée O&apos;Connor/);
  assert.match(svg, /R&amp;D &lt;team&gt;/);
  assert.match(svg, /St\. Louis • 2026/);
  assert.match(svg, /שלום/);
  assert.match(svg, /xml:space="preserve"/);
  assert.match(svg, /font-family="Arial Bold"/);
  assert.match(svg, /<text[^>]+><\/text>/);
  assert.doesNotMatch(svg, /<script>/);
});

test("preserves exact source identity and wording in metadata", () => {
  const svg = generateSvgContent({
    ...snapshot(),
    customerName: "רנה Élodie",
    text: "A\n\nB\n",
  });
  assert.match(svg, /רנה Élodie/);
  assert.match(svg, /A\\n\\nB\\n/);
  assert.match(svg, /Exact engraving wording/);
  assert.equal((svg.match(/style="unicode-bidi:plaintext"/g) || []).length, 9);
});

test("escapes font labels and family attributes and preserves alignment", () => {
  const svg = generateSvgContent({
    ...snapshot(),
    textAlign: "right",
    favorites: [
      {
        name: "<Font>",
        styles: { regular: 'A" onclick="bad' },
        activeStyle: "regular",
      },
    ],
  });
  assert.match(svg, /&lt;Font&gt;/);
  assert.match(svg, /font-family="A&quot; onclick=&quot;bad"/);
  assert.match(svg, /text-anchor="end"/);
});

test("sizes long wording and notes without a fixed-width crop", () => {
  const svg = generateSvgContent({ ...snapshot(), text: "W".repeat(150) });
  const width = Number(svg.match(/width="(\d+)"/)[1]);
  assert.ok(width > 6000);
});

test("exports all four monogram styles, including split payload with no HTML", () => {
  for (const type of ["classic", "flat", "circular", "split"]) {
    const data = {
      type,
      text: ["A", "X", "T"],
      font: favorite,
      style: "bold",
      initial: "R",
      name: "RENÉE & CO",
      frameStyle: "double",
      isCircular: type === "circular",
    };
    const svg = generateSvgContent({
      ...snapshot(),
      text: "",
      favorites: [],
      monogramInfo: { data, htmlString: null },
    });
    assert.match(svg, /monogram/);
    if (type === "split") {
      assert.match(svg, /clipPath/);
      assert.match(svg, /RENÉE &amp; CO/);
    }
    if (type === "circular") {
      assert.match(svg, /LeftCircleMonogram/);
      assert.match(svg, /stroke="white"/);
    }
  }
});

test("rejects incomplete requests and more than three favorites before fetching", async () => {
  for (const change of [
    { text: "" },
    { favorites: [] },
    { favorites: Array(4).fill(favorite) },
    { customerName: " " },
    { monogramInfo: { data: { type: "split" } }, text: "" },
  ]) {
    await assert.rejects(
      submitRequest(
        { ...snapshot(), ...change },
        { fetchImpl: () => assert.fail("Must not send invalid requests") },
      ),
      { code: "validation" },
    );
  }
});

test("sends the exact established PUT contract without mutating the snapshot", async () => {
  const request = snapshot();
  const original = JSON.stringify(request);
  const calls = [];
  const result = await submitRequest(request, {
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response("Successfully uploaded", { status: 200 });
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0][0],
    `${WORKER_URL}/900526_Astra_UX_Test_Arch_UX_Test.svg`,
  );
  assert.equal(calls[0][1].method, "PUT");
  assert.deepEqual(calls[0][1].headers, { "Content-Type": "image/svg+xml" });
  assert.equal(calls[0][1].body, result.svg);
  assert.equal(result.filename, createFilename(request));
  assert.equal(JSON.stringify(request), original);
});

test("reports a duplicate as already saved without claiming a new success", async () => {
  await assert.rejects(
    submitRequest(snapshot(), {
      fetchImpl: async () => new Response("duplicate", { status: 409 }),
    }),
    (error) => {
      assert.equal(error.code, "duplicate");
      assert.equal(error.status, 409);
      assert.match(error.message, /already saved/);
      return true;
    },
  );
});

test("reports service failures with recoverable guidance, not raw server output", async () => {
  await assert.rejects(
    submitRequest(snapshot(), {
      fetchImpl: async () =>
        new Response("internal stack trace", { status: 503 }),
    }),
    (error) => {
      assert.equal(error.code, "server");
      assert.equal(error.status, 503);
      assert.match(error.message, /choices are still here/);
      assert.doesNotMatch(error.message, /stack trace/);
      return true;
    },
  );
});

test("reports network uncertainty and reuses the same filename when retried", async () => {
  const urls = [];
  await assert.rejects(
    submitRequest(snapshot(), {
      fetchImpl: async (url) => {
        urls.push(url);
        throw new TypeError("Failed to fetch");
      },
    }),
    { code: "network" },
  );
  await submitRequest(snapshot(), {
    fetchImpl: async (url) => {
      urls.push(url);
      return new Response("ok");
    },
  });
  assert.equal(urls[0], urls[1]);
});

test("ends a stalled upload with recoverable uncertainty instead of endless submitting", async () => {
  await assert.rejects(
    submitRequest(snapshot(), {
      timeoutMs: 5,
      fetchImpl: async (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    }),
    { code: "network" },
  );
});

test("shows accompanying wording visibly when a monogram has no favorite fonts", () => {
  const data = {
    type: "split",
    initial: "R",
    name: "REN\u00c9E",
    font: favorite,
    style: "bold",
  };
  const svg = generateSvgContent({
    ...snapshot(),
    favorites: [],
    monogramInfo: { data },
    textAlign: "center",
  });
  const visibleArtwork = svg.replace(/<metadata>.*?<\/metadata>/s, "");
  assert.match(visibleArtwork, /Ren\u00e9e O&apos;Connor/);
  assert.match(visibleArtwork, /Director, R&amp;D/);
  assert.match(visibleArtwork, /St\. Louis \u2022 2026/);
  assert.match(visibleArtwork, /font to be chosen with your designer/);
  assert.match(visibleArtwork, /text-anchor="middle"/);
});

test("shows favorite names visibly when a monogram is submitted without wording", () => {
  const data = {
    type: "classic",
    text: ["A", "X", "T"],
    font: favorite,
    style: "regular",
  };
  const svg = generateSvgContent({
    ...snapshot(),
    text: "",
    monogramInfo: { data },
  });
  const visibleArtwork = svg.replace(/<metadata>.*?<\/metadata>/s, "");
  assert.match(visibleArtwork, /Arial \(bold\)/);
  assert.match(visibleArtwork, /Classic monogram/);
});

function readMetadata(svg) {
  const xml = svg.match(/<metadata>(.*?)<\/metadata>/s)[1];
  return JSON.parse(xml.replace(/&(quot|apos|lt|gt|amp);/g, (_, entity) => ({
    quot: '"', apos: "'", lt: "<", gt: ">", amp: "&",
  })[entity]));
}

test("mixed line assignments remain independent of favorite full-wording specimens", () => {
  const request = snapshot();
  request.lines = request.text.split("\n").map((text, index) => ({
    text,
    fontName: ["Great Vibes", "Arial", "Garamond"][index],
    styleKey: ["regular", "bold", "italic"][index],
  }));
  const original = JSON.stringify(request);
  const svg = generateSvgContent(request);
  const metadata = readMetadata(svg);
  assert.deepEqual(metadata.lines, request.lines);
  assert.deepEqual(metadata.favorites, request.favorites);
  assert.equal(metadata.text, request.text);
  assert.match(svg, /Line 1: Great Vibes \(regular\)/);
  assert.match(svg, /Line 2: Arial \(bold\)/);
  assert.match(svg, /Line 3: Garamond \(italic\)/);
  assert.match(svg, /Favorite 1: Arial \(bold\)/);
  assert.match(svg, /font-family="Great Vibes"/);
  assert.match(svg, /font-family="EB Garamond Italic"/);
  assert.equal(JSON.stringify(request), original);
});

test("line assignments preserve exact Unicode and escape XML without recording preview settings", () => {
  const text = "  Ren\u00e9e <R&D>\n\n\u05e9\u05b8\u05c1\u05dc\u05d5\u05b9\u05dd \u2022 O'Connor\n";
  const request = { ...snapshot(), text, fontSize: 78, textAlign: "right", favorites: [] };
  request.lines = text.split("\n").map((text) => ({ text, fontName: "Arial", styleKey: "regular" }));
  const svg = generateSvgContent(request);
  const metadata = readMetadata(svg);
  assert.deepEqual(metadata.lines, request.lines);
  assert.equal(metadata.text, text);
  assert.ok(!("fontSize" in metadata));
  assert.ok(!("textAlign" in metadata));
  assert.match(svg, /Ren\u00e9e &lt;R&amp;D&gt;/);
  assert.doesNotMatch(svg, /<R&D>/);
  assert.match(svg, /Line 4: Arial/);
});

test("stale, incomplete or unknown line assignments cannot reach the Worker", async () => {
  const text = "Name\nTitle";
  const lines = text.split("\n").map((text) => ({ text, fontName: "Arial", styleKey: "regular" }));
  for (const invalid of [
    [lines[0]],
    [{ ...lines[0], text: "Old name" }, lines[1]],
    [{ ...lines[0], fontName: "Unknown font" }, lines[1]],
    [{ ...lines[0], styleKey: "unknown" }, lines[1]],
    "invalid",
  ]) {
    await assert.rejects(
      submitRequest({ ...snapshot(), text, lines: invalid }, {
        fetchImpl: () => assert.fail("Stale assignments must never be sent"),
      }),
      { code: "validation" },
    );
  }
});

test("long split-monogram names use the same fitting as the preview", () => {
  const name = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const svg = generateSvgContent({ ...snapshot(), text: "", favorites: [], monogramInfo: {
    data: { type: "split", initial: "A", name, font: favorite, style: "regular" },
  } });
  assert.ok(svg.includes(`font-size="${85 / (name.length * 0.7)}"`));
});


test("wide identity and designer-note text cannot be clipped by a short wording block", () => {
  const svg = generateSvgContent({ ...snapshot(), text: "A", customerName: "W".repeat(120), notes: "W".repeat(150) });
  const width = Number(svg.match(/width="(\d+)"/)[1]);
  assert.ok(width >= 3000, "receipt must accommodate long names and notes");
  assert.equal(readMetadata(svg).customerName, "W".repeat(120));
});


const optima = { name: "Optima", styles: { regular: "Optima", bold: "Optima Bold" }, activeStyle: "bold" };

test("exported Optima specimens cannot hand accents or bullets to a corrupt downstream font", () => {
  const text = "Ren\u00e9e O'Connor\nSt. Louis \u2022 2026";
  const request = {
    ...snapshot(), text, favorites: [optima],
    lines: text.split("\n").map((text) => ({ text, fontName: "Optima", styleKey: "bold" })),
  };
  const svg = generateSvgContent(request);
  const specimens = [...svg.matchAll(/<text[^>]*font-family="Optima Bold"[^>]*>(.*?)<\/text>/gs)].map((match) => match[1]);
  assert.equal(specimens.length, 4, "both line assignments and both favorite specimen lines must be present");
  for (const specimen of specimens) {
    assert.match(specimen, /<tspan font-family="Arial, sans-serif">[\u00e9\u2022]<\/tspan>/);
    const originalFontText = specimen.replace(/<tspan[^>]*>.*?<\/tspan>/gs, "");
    assert.ok(Array.from(originalFontText).every((character) => character.codePointAt(0) <= 0x7f), "legacy Optima may render verified ASCII only");
  }
  const metadata = readMetadata(svg);
  assert.equal(metadata.text, text);
  assert.deepEqual(metadata.lines, request.lines);
  assert.deepEqual(metadata.favorites, request.favorites);
  assert.ok(metadata.glyphWarnings.some((warning) => warning.context === "Line assignment 1" && warning.missingCharacters.includes("\u00e9")));
  assert.ok(metadata.glyphWarnings.some((warning) => warning.context === "Favorite 1: Optima, line 2" && warning.missingCharacters.includes("\u2022")));
  const artwork = svg.replace(/<metadata>.*?<\/metadata>/s, "");
  assert.match(artwork, /Character checks for your proof/);
  assert.match(artwork, /fallback lettering/);
});

test("explicit SVG fallback preserves whole combining and variation-selector graphemes", () => {
  const text = "e\u0301 \u05e9\u05b8\u05c1 \u2605\ufe0e";
  const svg = generateSvgContent({ ...snapshot(), text, favorites: [optima] });
  const metadata = readMetadata(svg);
  assert.equal(metadata.text, text, "normalization must not alter the customer's source wording");
  const specimen = [...svg.matchAll(/<text[^>]*font-family="Optima Bold"[^>]*>(.*?)<\/text>/gs)][0][1];
  assert.match(specimen, /<tspan[^>]*>e\u0301<\/tspan>/);
  assert.match(specimen, /<tspan[^>]*>\u05e9\u05b8\u05c1<\/tspan>/);
  assert.match(specimen, /<tspan[^>]*>\u2605\ufe0e<\/tspan>/);
  assert.ok(metadata.glyphWarnings.some((warning) => warning.unsupportedCharacters.includes("\u2605")));
});

test("every affected family reports unsupported symbols without claiming verified fallback", () => {
  const text = "Ren\u00e9e \u2605 \u{1f9ea}";
  const fonts = [
    { name: "Arial", styles: { regular: "Arial" }, activeStyle: "regular" },
    { name: "Collegiate", styles: { black: "CollegiateBlackFLF" }, activeStyle: "black" },
    { name: "I Love Glitter", styles: { regular: "I Love Glitter" }, activeStyle: "regular" },
  ];
  const svg = generateSvgContent({ ...snapshot(), text, favorites: fonts });
  const metadata = readMetadata(svg);
  for (const family of ["Arial", "CollegiateBlackFLF", "I Love Glitter"]) {
    const warning = metadata.glyphWarnings.find((item) => item.fontFamily === family && item.context.startsWith("Favorite"));
    assert.ok(warning, `missing characters in ${family} must be disclosed`);
    assert.deepEqual(warning.unsupportedCharacters, ["\u2605", "\u{1f9ea}"]);
    assert.match(warning.message, /cannot verify/);
  }
  assert.ok(metadata.glyphWarnings.some((warning) => warning.fontFamily === "CollegiateBlackFLF" && warning.missingCharacters.includes("\u00e9")));
  assert.equal(metadata.text, text);
  const artwork = svg.replace(/<metadata>.*?<\/metadata>/s, "");
  assert.match(artwork, /cannot verify/);
  assert.match(artwork, /\u{1f9ea}/u, "supplementary characters must not split at wrapped notice boundaries");
});

test("all monogram styles use explicit fallback for unsupported initials or names", () => {
  for (const type of ["classic", "flat", "circular", "split"]) {
    const data = { type, text: ["\u05e9", "B", "C"], font: optima, style: "bold", initial: "\u05e9", name: "REN\u00c9E", frameStyle: "outline", isCircular: type === "circular" };
    const svg = generateSvgContent({ ...snapshot(), text: "", favorites: [], monogramInfo: { data } });
    const metadata = readMetadata(svg);
    assert.deepEqual(metadata.monogram, data);
    assert.match(svg, /<tspan font-family="Arial, sans-serif">\u05e9<\/tspan>/);
    assert.ok(metadata.glyphWarnings.some((warning) => warning.missingCharacters.includes("\u05e9")));
    if (type === "split") {
      assert.match(svg, /<clipPath[^>]*><text[^>]*><tspan font-family="Arial, sans-serif">\u05e9<\/tspan><\/text><\/clipPath>/);
      assert.ok(metadata.glyphWarnings.some((warning) => warning.context === "Split monogram name"));
    }
  }
});

test("supported wording has no glyph warning noise", () => {
  const svg = generateSvgContent(snapshot());
  assert.deepEqual(readMetadata(svg).glyphWarnings, []);
  assert.doesNotMatch(svg, /Character checks for your proof/);
});
