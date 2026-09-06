import { useEffect, useRef, useState } from "react";
import { familyFor } from "./fontLibrary";

export default function EngravingPreview({
  lines,
  activeLine = -1,
  onActivate,
  size = 58,
  spacing = 1.35,
  align = "center",
  fit = true,
  sample = false,
}) {
  const container = useRef(null);
  const [fittedSize, setFittedSize] = useState(size);
  const signature = JSON.stringify(lines);
  useEffect(() => {
    const node = container.current;
    let cancelled = false;
    const measure = () => {
      if (cancelled || !node) return;
      if (!fit) {
        setFittedSize(size);
        return;
      }
      const ctx = document.createElement("canvas").getContext("2d");
      const width = Math.max(40, node.clientWidth - (sample ? 20 : 90));
      const availableHeight = Math.max(60, node.clientHeight - 50);
      const parsed = JSON.parse(signature);
      const widths = parsed.map((line) => {
        ctx.font = `${size}px ${familyFor(line.fontName, line.styleKey)}`;
        return ctx.measureText(line.text).width;
      });
      const scale = Math.min(
        1,
        width / Math.max(1, ...widths),
        availableHeight / (Math.max(1, parsed.length) * size * spacing),
      );
      setFittedSize(Math.max(10, Math.floor(size * scale)));
    };
    measure();
    document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [signature, size, spacing, fit, sample]);
  const activateKey = (event, index) => {
    let next;
    if (event.key === "ArrowDown") next = Math.min(lines.length - 1, index + 1);
    if (event.key === "ArrowUp") next = Math.max(0, index - 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = lines.length - 1;
    if (next != null) {
      event.preventDefault();
      onActivate(next);
      container.current.querySelector(`[data-line="${next}"]`)?.focus();
    }
  };
  return (
    <div
      ref={container}
      className={`engraving-canvas ${sample ? "engraving-canvas--sample" : ""}`}
      style={{
        "--engraving-size": `${fittedSize}px`,
        "--engraving-spacing": spacing,
        textAlign: align,
      }}
    >
      {!lines.some((line) => line.text.trim()) ? (
        <div className="preview-empty">
          <span aria-hidden="true">Aa</span>
          <h3>Your engraving preview</h3>
          <p>
            Enter your engraving wording to see it here.
            <br />
            Then choose a font to try.
          </p>
        </div>
      ) : (
        <div className="engraving-lines">
          {lines.map((line, i) => {
            const style = {
              fontFamily: familyFor(line.fontName, line.styleKey),
            };
            return onActivate ? (
              <button
                key={i}
                data-line={i}
                className="engraving-line"
                aria-label={`Edit line ${i + 1}: ${line.text || "Blank line"}`}
                aria-pressed={activeLine === i}
                onClick={() => onActivate(i)}
                onKeyDown={(e) => activateKey(e, i)}
              >
                <span className="line-marker" aria-hidden="true">
                  {activeLine === i ? "▸ " : ""}
                  {i + 1}
                </span>
                <span className="line-wording" dir="auto" style={style}>
                  {line.text || "\u00a0"}
                </span>
              </button>
            ) : (
              <div key={i} className="sample-line" dir="auto" style={style}>
                {line.text || "\u00a0"}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
