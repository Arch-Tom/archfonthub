import { test, expect } from "@playwright/test";

const standard = [
  { text: "Renée O'Connor", fontName: "Great Vibes", styleKey: "regular" },
  { text: "Director, R&D", fontName: "Graphik", styleKey: "regular" },
  { text: "St. Louis • 2026", fontName: "Garamond", styleKey: "regular" },
];

async function mountPreview(
  page,
  props = {},
  box = { width: 720, height: 440 },
) {
  // Mount the real preview with its font stylesheet, independently of the app shell.
  await page.route("**/src/main.jsx", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "import '/src/index.css';",
    }),
  );
  await page.goto("/");
  await page.evaluate(
    async ({ props, box, standard }) => {
      const { default: React } = await import(
        "/node_modules/.vite/deps/react.js"
      );
      const { default: ReactDOM } = await import(
        "/node_modules/.vite/deps/react-dom_client.js"
      );
      const { default: Preview } = await import("/src/EngravingPreview.jsx");
      const holder = document.createElement("div");
      holder.id = "geometry-test";
      holder.style.cssText = `position:fixed;z-index:10000;left:0;top:0;width:${box.width}px;height:${box.height}px;display:flex;background:white`;
      document.body.append(holder);
      const root = ReactDOM.createRoot(holder);
      let current = { lines: standard, activeLine: 0, ...props };
      const render = () =>
        root.render(
          React.createElement(Preview, {
            ...current,
            onActivate: (index, metadata) => {
              window.__previewActivation = { index, ...metadata };
              current = { ...current, activeLine: index };
              render();
            },
          }),
        );
      window.__updateGeometryPreview = (options, dimensions) => {
        current = { ...current, ...options };
        if (dimensions) {
          holder.style.width = `${dimensions.width}px`;
          holder.style.height = `${dimensions.height}px`;
        }
        render();
      };
      render();
    },
    { props, box, standard },
  );
  await expect(page.locator("#geometry-test .line-wording")).toHaveCount(
    (props.lines || standard).length,
  );
  await settle(page);
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function geometry(page, selector = "#geometry-test .engraving-canvas") {
  return page.locator(selector).evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    return {
      size: Number(canvas.dataset.previewFontSize),
      advance: Number(canvas.dataset.previewBaselineAdvance),
      spacing: Number(canvas.dataset.previewSpacing),
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      rows: [...canvas.querySelectorAll(".engraving-line")].map((row) => {
        const text = row.querySelector(".line-wording");
        const ink = row
          .querySelector(".line-selection-outline")
          .getBoundingClientRect();
        const glyph = text.getBoundingClientRect();
        const hit = row.getBoundingClientRect();
        const css = getComputedStyle(text);
        return {
          baseline: Number(text.dataset.baseline),
          renderedBaseline:
            new DOMPoint(
              text.x.baseVal[0].value,
              text.y.baseVal[0].value,
            ).matrixTransform(text.getScreenCTM()).y - bounds.y,
          fontSize: parseFloat(css.fontSize),
          family: css.fontFamily,
          text: text.textContent,
          glyph: {
            x: glyph.x - bounds.x,
            y: glyph.y - bounds.y,
            width: glyph.width,
            height: glyph.height,
          },
          outline: {
            x: ink.x - bounds.x,
            y: ink.y - bounds.y,
            width: ink.width,
            height: ink.height,
          },
          hit: {
            x: hit.x - bounds.x,
            y: hit.y - bounds.y,
            width: hit.width,
            height: hit.height,
          },
        };
      }),
    };
  });
}

function expectBaselines(result, spacing = 1) {
  expect(result.spacing).toBe(spacing);
  expect(result.advance).toBeCloseTo(result.size * spacing, 6);
  for (let index = 1; index < result.rows.length; index += 1) {
    expect(
      result.rows[index].baseline - result.rows[index - 1].baseline,
    ).toBeCloseTo(result.size * spacing, 6);
    expect(result.rows[index].fontSize).toBeCloseTo(result.size, 3);
    expect(
      Math.abs(
        result.rows[index].renderedBaseline -
          result.rows[index - 1].renderedBaseline -
          result.size * spacing,
      ),
    ).toBeLessThan(0.03);
  }
}

function expectContained(result) {
  for (const row of result.rows) {
    expect(row.outline.x).toBeGreaterThanOrEqual(0);
    expect(row.outline.y).toBeGreaterThanOrEqual(0);
    expect(row.outline.x + row.outline.width).toBeLessThanOrEqual(
      result.width + 1,
    );
    expect(row.outline.y + row.outline.height).toBeLessThanOrEqual(
      result.height + 1,
    );
  }
}

test("preview uses exact shared em baselines with mixed fonts at default, reduced, and increased spacing", async ({
  page,
}) => {
  await mountPreview(page);
  expectBaselines(await geometry(page));
  await page
    .locator("#geometry-test")
    .screenshot({ path: "artifacts/preview-geometry-mixed.png" });
  for (const spacing of [0.8, 1.25, 1.6]) {
    await page.evaluate(
      (spacing) => window.__updateGeometryPreview({ spacing }),
      spacing,
    );
    await settle(page);
    expectBaselines(await geometry(page), spacing);
    expectContained(await geometry(page));
  }
});

test("short and long active outlines follow lettering while hit targets remain easy to select", async ({
  page,
}) => {
  const lines = [
    "CEO",
    "III",
    "Alexander Montgomery-Worthington",
    "International Development Department",
  ].map((text) => ({ text, fontName: "Garamond", styleKey: "regular" }));
  await mountPreview(page, { lines });
  const result = await geometry(page);
  expect(result.rows[3].outline.width).toBeGreaterThan(
    result.rows[1].outline.width * 8,
  );
  for (const row of result.rows) expect(row.hit.width).toBe(result.width);
  const short = page.locator('#geometry-test [data-line="1"]');
  await short.click({ position: { x: 18, y: result.rows[1].hit.height / 2 } });
  await expect(short).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => page.evaluate(() => window.__previewActivation))
    .toEqual({ index: 1, source: "pointer" });
  expectContained(result);
});

test("activation, hover, keyboard focus, and arrow navigation never move glyphs or baselines", async ({
  page,
}) => {
  await mountPreview(page);
  const before = await geometry(page);
  const second = page.locator('#geometry-test [data-line="1"]');
  await second.hover();
  expect(await geometry(page)).toEqual(before);
  await second.click();
  expect(await geometry(page)).toEqual(before);
  await second.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('#geometry-test [data-line="2"]')).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => window.__previewActivation))
    .toEqual({ index: 2, source: "keyboard" });
  expect(await geometry(page)).toEqual(before);
  await page.keyboard.press("Home");
  await expect(page.locator('#geometry-test [data-line="0"]')).toBeFocused();
  expect(await geometry(page)).toEqual(before);
});

test("wording, style, letter spacing, and viewport changes remeasure the precise bounds", async ({
  page,
}) => {
  await mountPreview(page, {
    lines: [{ text: "III", fontName: "Arial", styleKey: "regular" }],
    fit: false,
  });
  const short = await geometry(page);
  await page.evaluate(() =>
    window.__updateGeometryPreview({
      lines: [
        {
          text: "International Development Department",
          fontName: "Arial",
          styleKey: "regular",
        },
      ],
      fit: true,
    }),
  );
  await settle(page);
  const long = await geometry(page);
  expect(long.rows[0].outline.width).toBeGreaterThan(
    short.rows[0].outline.width * 10,
  );
  await page.evaluate(() =>
    window.__updateGeometryPreview({
      lines: [{ text: "CEO", fontName: "Arial", styleKey: "bold" }],
      letterSpacing: 0.15,
      fit: false,
    }),
  );
  await settle(page);
  const boldSpaced = await geometry(page);
  expect(boldSpaced.rows[0].family).toContain("Arial Bold");
  await page.evaluate(() =>
    window.__updateGeometryPreview({ letterSpacing: 0 }),
  );
  await settle(page);
  const bold = await geometry(page);
  expect(boldSpaced.rows[0].outline.width).toBeGreaterThan(
    bold.rows[0].outline.width + 15,
  );
  await page.evaluate(() =>
    window.__updateGeometryPreview(
      {
        lines: [
          {
            text: "International Development Department",
            fontName: "Arial",
            styleKey: "regular",
          },
        ],
        fit: true,
      },
      { width: 320, height: 260 },
    ),
  );
  await settle(page);
  const narrow = await geometry(page);
  expect(narrow.size).toBeLessThan(long.size);
  expectContained(narrow);
});

test("late font loading changes measured ink and settled fit includes the loaded typeface", async ({
  page,
}) => {
  await mountPreview(page, {
    lines: [
      { text: "Renée O'Connor", fontName: "Great Vibes", styleKey: "regular" },
    ],
  });
  const original = await geometry(page);
  await page.evaluate(async () => {
    const family = getComputedStyle(
      document.querySelector("#geometry-test .line-wording"),
    )
      .fontFamily.split(",")[0]
      .replaceAll('"', "")
      .trim();
    const replacement = new FontFace(family, 'local("Arial")');
    await replacement.load();
    for (const face of document.fonts)
      if (face.family.replaceAll('"', "") === family)
        document.fonts.delete(face);
    document.fonts.add(replacement);
    document.fonts.dispatchEvent(new Event("loadingdone"));
  });
  await settle(page);
  const loaded = await geometry(page);
  expect(
    Math.abs(loaded.rows[0].outline.width - original.rows[0].outline.width),
  ).toBeGreaterThan(3);
  expectContained(loaded);
  expectBaselines(loaded);
});

test("Unicode, Hebrew, exact spaces, and intentional blank lines remain authored text", async ({
  page,
}) => {
  const text = ["  Renée O'Connor  ", "", "שלום עולם", "St. Louis • 2026"];
  await mountPreview(
    page,
    {
      lines: text.map((text) => ({
        text,
        fontName: "Optima",
        styleKey: "regular",
      })),
    },
    { width: 390, height: 330 },
  );
  const result = await geometry(page);
  expect(result.rows.map((row) => row.text)).toEqual(text);
  await page
    .locator("#geometry-test")
    .screenshot({ path: "artifacts/preview-geometry-unicode.png" });
  for (const row of result.rows) {
    expect(row.glyph.x).toBeGreaterThanOrEqual(0);
    expect(row.glyph.x + row.glyph.width).toBeLessThanOrEqual(result.width + 1);
  }
  await expect(page.locator('#geometry-test [data-line="1"]')).toHaveAttribute(
    "aria-label",
    "Edit line 2: Blank line",
  );
  await expect(
    page.locator('#geometry-test [data-line="2"] .line-wording'),
  ).toHaveAttribute("direction", "rtl");
  expectBaselines(result);
  expectContained(result);
});

test("integrated desktop and mobile preserve mixed-font and bidirectional geometry", async ({
  page,
}) => {
  await page.route("**/*", (route) =>
    ["GET", "HEAD", "OPTIONS"].includes(route.request().method())
      ? route.continue()
      : route.abort(),
  );
  await page.goto("/");
  const wording = page.getByRole("textbox", {
    name: "Your engraving wording",
    exact: true,
  });
  await wording.fill(standard.map((line) => line.text).join("\n"));
  for (const [index, font] of [
    "Great Vibes",
    "Graphik",
    "Garamond",
  ].entries()) {
    await page
      .getByRole("button", { name: new RegExp(`^Edit line ${index + 1}:`) })
      .click();
    const catalog = page.locator(".catalog:visible");
    await catalog
      .getByRole("searchbox", { name: "Search fonts", exact: true })
      .fill(font);
    await catalog
      .getByRole("button", {
        name: `Apply ${font} to line ${index + 1}`,
        exact: true,
      })
      .click();
  }
  await settle(page);
  const selector = ".preview-section .engraving-canvas";
  const desktop = await geometry(page, selector);
  expectBaselines(desktop);
  expectContained(desktop);
  await page.screenshot({
    path: "artifacts/preview-geometry-integrated-desktop.png",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const bidiText = [
    ...standard.map((line) => line.text),
    "שלום עולם · Arch 2026",
    "مرحبا بالعالم · Arch 2026",
  ];
  await wording.fill(bidiText.join("\n"));
  await settle(page);
  const mobile = await geometry(page, selector);
  expectBaselines(mobile);
  expectContained(mobile);
  expect(mobile.rows.map((row) => row.text)).toEqual(bidiText);
  for (const row of mobile.rows) {
    expect(row.glyph.x).toBeGreaterThanOrEqual(0);
    expect(row.glyph.x + row.glyph.width).toBeLessThanOrEqual(mobile.width + 1);
  }
  const first = page.getByRole("button", { name: /^Edit line 1:/ });
  await first.focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("dialog", { name: /Choose lettering/ }),
  ).toHaveCount(0);
  const selected = await geometry(page, selector);
  expect(selected).toEqual(mobile);
  await page.screenshot({
    path: "artifacts/preview-geometry-integrated-mobile.png",
    fullPage: true,
  });
});
