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
  assert.equal((svg.match(/style="unicode-bidi:plaintext"/g) || []).length, 5);
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
