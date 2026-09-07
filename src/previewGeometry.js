/**
 * Geometry is expressed in font-size units. A spacing of 1 is one em between
 * adjacent alphabetic baselines, including when neighboring fonts differ.
 */
export function layoutPreview({
  metrics,
  width,
  height,
  size = 64,
  spacing = 1,
  align = "center",
  fit = true,
  inset = 24,
}) {
  const requestedSize = Math.max(1, Number(size) || 64);
  const baselineSpacing = Math.max(0.1, Number(spacing) || 1);
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const gutter = Math.min(inset, safeWidth / 8, safeHeight / 8);
  const availableWidth = Math.max(1, safeWidth - gutter * 2);
  const availableHeight = Math.max(1, safeHeight - gutter * 2);
  const extents = metrics.map((metric, index) => ({
    ...metric,
    left: Math.min(0, -metric.inkLeft),
    right: Math.max(metric.advance, metric.inkRight),
    top: index * baselineSpacing - metric.ascent,
    bottom: index * baselineSpacing + metric.descent,
  }));
  const top = Math.min(0, ...extents.map((metric) => metric.top));
  const bottom = Math.max(0, ...extents.map((metric) => metric.bottom));
  const naturalWidth = Math.max(
    0.001,
    ...extents.map((metric) => metric.right - metric.left),
  );
  const naturalHeight = Math.max(0.001, bottom - top);
  const fontSize = fit
    ? Math.min(
        requestedSize,
        availableWidth / naturalWidth,
        availableHeight / naturalHeight,
      )
    : requestedSize;
  const yOffset = (safeHeight - naturalHeight * fontSize) / 2 - top * fontSize;
  const baselineAdvance = fontSize * baselineSpacing;
  const rows = extents.map((metric, index) => {
    const occupiedWidth = (metric.right - metric.left) * fontSize;
    const physicalLeft =
      align === "left"
        ? gutter
        : align === "right"
          ? safeWidth - gutter - occupiedWidth
          : (safeWidth - occupiedWidth) / 2;
    const x = physicalLeft - metric.left * fontSize;
    const baseline = yOffset + index * baselineAdvance;
    return {
      x,
      baseline,
      ink: {
        x: x - metric.inkLeft * fontSize,
        y: baseline - metric.ascent * fontSize,
        width: Math.max(0, metric.inkLeft + metric.inkRight) * fontSize,
        height: (metric.ascent + metric.descent) * fontSize,
      },
    };
  });
  // Hit targets partition the preview at baseline midpoints. Their dimensions
  // are independent of the visible ink bounds and never participate in layout.
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const preceding = index
      ? (rows[index - 1].baseline + row.baseline) / 2 - fontSize * 0.3
      : 0;
    const following =
      index < rows.length - 1
        ? (row.baseline + rows[index + 1].baseline) / 2 - fontSize * 0.3
        : safeHeight;
    row.hitTop = Math.max(0, Math.min(safeHeight, preceding));
    row.hitHeight = Math.max(0, Math.min(safeHeight, following) - row.hitTop);
  }
  return {
    fontSize,
    baselineAdvance,
    rows,
    width: safeWidth,
    height: safeHeight,
  };
}

/** Match SVG's explicit run direction to the first strong letter in a line. */
export function textDirection(text) {
  const firstLetter = String(text).match(/\p{Letter}/u)?.[0] || "";
  return /[\p{Script=Hebrew}\p{Script=Arabic}]/u.test(firstLetter)
    ? "rtl"
    : "ltr";
}

/** Measure actual ink as well as logical advance, including audited fallback. */
export function measurePreviewLine(context, text, family, letterSpacing = 0) {
  const referenceSize = 1000;
  context.font = `${referenceSize}px ${family}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.direction = textDirection(text);
  context.fontKerning = "normal";
  context.letterSpacing = `${letterSpacing * referenceSize}px`;
  const measured = context.measureText(text);
  const visible = /\S/u.test(text);
  return {
    advance: measured.width / referenceSize,
    inkLeft: measured.actualBoundingBoxLeft / referenceSize,
    inkRight: measured.actualBoundingBoxRight / referenceSize,
    // Blank lines still occupy their authored baseline. Their invisible em
    // extent keeps leading/trailing blank lines in the fitted composition.
    ascent: visible ? measured.actualBoundingBoxAscent / referenceSize : 0.7,
    descent: visible ? measured.actualBoundingBoxDescent / referenceSize : 0.2,
  };
}
