import test from "node:test";
import assert from "node:assert/strict";
import {
  layoutPreview,
  measurePreviewLine,
  textDirection,
} from "../src/previewGeometry.js";

const metric = (
  advance,
  ascent = 0.7,
  descent = 0.2,
  inkLeft = 0,
  inkRight = advance,
) => ({ advance, ascent, descent, inkLeft, inkRight });
const near = (actual, expected) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-8,
    `${actual} should equal ${expected}`,
  );

test("100 percent spacing is one shared em between mixed-font baselines", () => {
  const mixed = [
    metric(2, 0.96, 0.38),
    metric(4, 0.55, 0.04),
    metric(3, 0.77, 0.23),
  ];
  for (const spacing of [0.8, 1, 1.25, 1.6]) {
    const geometry = layoutPreview({
      metrics: mixed,
      width: 700,
      height: 450,
      size: 64,
      spacing,
    });
    near(geometry.baselineAdvance, geometry.fontSize * spacing);
    near(
      geometry.rows[1].baseline - geometry.rows[0].baseline,
      geometry.fontSize * spacing,
    );
    near(
      geometry.rows[2].baseline - geometry.rows[1].baseline,
      geometry.fontSize * spacing,
    );
  }
});

test("fit includes italic overhang and ink at every mixed-font baseline", () => {
  const metrics = [
    metric(13, 1.25, 0.5, 0.3, 13.6),
    metric(10, 0.6, 0.1),
    metric(11, 1.1, 0.45),
  ];
  for (const [width, height] of [
    [360, 230],
    [210, 120],
    [1000, 120],
  ]) {
    const geometry = layoutPreview({
      metrics,
      width,
      height,
      size: 100,
      spacing: 1,
    });
    for (const row of geometry.rows) {
      assert.ok(row.ink.x >= 0);
      assert.ok(row.ink.y >= 0);
      assert.ok(row.ink.x + row.ink.width <= width + 1e-8);
      assert.ok(row.ink.y + row.ink.height <= height + 1e-8);
    }
    near(
      geometry.rows[1].baseline - geometry.rows[0].baseline,
      geometry.fontSize,
    );
  }
});

test("short and long lines retain independent ink bounds and full row hit areas", () => {
  const geometry = layoutPreview({
    metrics: [metric(0.55), metric(12.4)],
    width: 600,
    height: 360,
  });
  assert.ok(geometry.rows[1].ink.width > geometry.rows[0].ink.width * 20);
  near(geometry.rows[0].hitTop, 0);
  near(geometry.rows[0].hitHeight, geometry.rows[1].hitTop);
  near(geometry.rows[1].hitTop + geometry.rows[1].hitHeight, 360);
});

test("fit can reduce below ten pixels for very long exact customer lines without clipping", () => {
  const geometry = layoutPreview({
    metrics: [metric(180)],
    width: 300,
    height: 200,
    size: 64,
  });
  assert.ok(geometry.fontSize < 10);
  assert.ok(geometry.rows[0].ink.width <= 252);
});

test("blank authored lines preserve predictable baselines and fit dimensions", () => {
  const geometry = layoutPreview({
    metrics: [metric(4), metric(0), metric(7), metric(0)],
    width: 500,
    height: 260,
    size: 64,
  });
  assert.equal(geometry.rows.length, 4);
  for (let i = 1; i < 4; i += 1)
    near(
      geometry.rows[i].baseline - geometry.rows[i - 1].baseline,
      geometry.fontSize,
    );
  assert.ok(geometry.rows[3].ink.y + geometry.rows[3].ink.height <= 260);
});

test("physical left and right alignment account for negative side bearings", () => {
  const metrics = [metric(4, 0.7, 0.2, 0.25, 4.3)];
  const left = layoutPreview({
    metrics,
    width: 600,
    height: 300,
    align: "left",
  });
  const right = layoutPreview({
    metrics,
    width: 600,
    height: 300,
    align: "right",
  });
  near(left.rows[0].ink.x, 24);
  near(right.rows[0].ink.x + right.rows[0].ink.width, 576);
});

test("direction follows the first strong letter without altering text", () => {
  assert.equal(textDirection("  2026 שלום עולם"), "rtl");
  assert.equal(textDirection("  2026 שלום · Arch"), "rtl");
  assert.equal(textDirection("Renée · שלום"), "ltr");
  assert.equal(textDirection("III"), "ltr");
});

test("measurement uses actual ink, explicit alphabetic baseline, and em letter spacing", () => {
  let suppliedText;
  const context = {
    measureText(text) {
      suppliedText = text;
      return {
        width: 2050,
        actualBoundingBoxLeft: 12,
        actualBoundingBoxRight: 2030,
        actualBoundingBoxAscent: 755,
        actualBoundingBoxDescent: 190,
      };
    },
  };
  const result = measurePreviewLine(
    context,
    "  Renée  ",
    '"Optima", "Arial"',
    0.04,
  );
  assert.equal(suppliedText, "  Renée  ");
  assert.equal(context.textBaseline, "alphabetic");
  assert.equal(context.letterSpacing, "40px");
  assert.equal(context.font, '1000px "Optima", "Arial"');
  assert.deepEqual(result, {
    advance: 2.05,
    inkLeft: 0.012,
    inkRight: 2.03,
    ascent: 0.755,
    descent: 0.19,
  });
});
