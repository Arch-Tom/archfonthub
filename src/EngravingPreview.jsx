import { useLayoutEffect, useRef, useState } from "react";
import { familyFor } from "./fontLibrary";
import {
  layoutPreview,
  measurePreviewLine,
  textDirection,
} from "./previewGeometry";
import "./previewGeometry.css";

export default function EngravingPreview({
  lines,
  activeLine = -1,
  onActivate,
  size = 64,
  spacing = 1,
  letterSpacing = 0,
  align = "center",
  fit = true,
  sample = false,
}) {
  const container = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const signature = JSON.stringify(lines);
  useLayoutEffect(() => {
    const node = container.current;
    if (!node) return undefined;
    let cancelled = false;
    let frame;
    const parsed = JSON.parse(signature);
    const context = document.createElement("canvas").getContext("2d");
    const measure = () => {
      if (cancelled || !context) return;
      const next = layoutPreview({
        metrics: parsed.map((line) =>
          measurePreviewLine(
            context,
            line.text,
            familyFor(line.fontName, line.styleKey),
            letterSpacing,
          ),
        ),
        width: node.clientWidth,
        height: node.clientHeight,
        size,
        spacing,
        align,
        fit,
        inset: sample ? 14 : 24,
      });
      setGeometry((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    // Explicitly request every required face/glyph, even when the SVG has not
    // appeared yet. FontFaceSet.ready alone can resolve before a new face loads.
    Promise.allSettled(
      parsed.map((line) =>
        document.fonts.load(
          `${size}px ${familyFor(line.fontName, line.styleKey)}`,
          line.text || "M",
        ),
      ),
    ).then(() => {
      if (!cancelled) schedule();
    });
    document.fonts.ready.then(() => {
      if (!cancelled) schedule();
    });
    document.fonts.addEventListener("loadingdone", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [signature, size, spacing, letterSpacing, align, fit, sample]);

  const activateKey = (event, index) => {
    let next;
    if (event.key === "ArrowDown") next = Math.min(lines.length - 1, index + 1);
    if (event.key === "ArrowUp") next = Math.max(0, index - 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = lines.length - 1;
    if (next != null) {
      event.preventDefault();
      onActivate(next, { source: "keyboard" });
      container.current
        .querySelector(`[data-line="${next}"]`)
        ?.focus({ preventScroll: true });
    }
  };
  return (
    <div
      ref={container}
      className={`engraving-canvas ${sample ? "engraving-canvas--sample" : ""}`}
      data-preview-font-size={geometry?.fontSize}
      data-preview-baseline-advance={geometry?.baselineAdvance}
      data-preview-spacing={spacing}
      data-preview-letter-spacing={letterSpacing}
      style={{
        "--engraving-size": `${geometry?.fontSize ?? size}px`,
        "--engraving-spacing": spacing,
      }}
    >
      {!lines.some((line) => line.text.trim()) ? (
        <div className="preview-empty">
          <span aria-hidden="true">Aa</span>
          <h3>Your engraving preview</h3>
          <p>
            Enter your engraving wording to see it here.
            <br />
            Then click a line to choose its font.
          </p>
        </div>
      ) : (
        <div className="engraving-lines">
          {geometry &&
            lines.map((line, i) => {
              const row = geometry.rows[i];
              if (!row) return null;
              const Row = onActivate ? "button" : "div";
              const breath = Math.max(3, Math.min(7, geometry.fontSize * 0.1));
              const inkWidth = Math.max(2, row.ink.width);
              return (
                <Row
                  key={i}
                  type={onActivate ? "button" : undefined}
                  data-line={i}
                  className={onActivate ? "engraving-line" : "sample-line"}
                  aria-label={
                    onActivate
                      ? `Edit line ${i + 1}: ${line.text || "Blank line"}`
                      : undefined
                  }
                  aria-pressed={onActivate ? activeLine === i : undefined}
                  onClick={
                    onActivate
                      ? (event) =>
                          onActivate(i, {
                            source: event.detail === 0 ? "keyboard" : "pointer",
                          })
                      : undefined
                  }
                  onKeyDown={
                    onActivate ? (event) => activateKey(event, i) : undefined
                  }
                  style={{ top: row.hitTop, height: row.hitHeight }}
                >
                  {onActivate && (
                    <span
                      className="line-selection-outline"
                      aria-hidden="true"
                      style={{
                        left: row.ink.x - breath,
                        top: row.ink.y - row.hitTop - breath,
                        width: inkWidth + breath * 2,
                        height: Math.max(2, row.ink.height) + breath * 2,
                      }}
                    />
                  )}
                  <svg
                    className="line-glyphs"
                    width="100%"
                    height="100%"
                    aria-hidden={onActivate ? "true" : undefined}
                  >
                    <text
                      className="line-wording"
                      x={row.x}
                      y={row.baseline - row.hitTop}
                      data-baseline={row.baseline}
                      direction={textDirection(line.text)}
                      textAnchor={
                        textDirection(line.text) === "rtl" ? "end" : "start"
                      }
                      xmlSpace="preserve"
                      style={{
                        fontFamily: familyFor(line.fontName, line.styleKey),
                        fontSize: geometry.fontSize,
                        letterSpacing: `${letterSpacing}em`,
                      }}
                    >
                      {line.text}
                    </text>
                  </svg>
                </Row>
              );
            })}
        </div>
      )}
    </div>
  );
}
