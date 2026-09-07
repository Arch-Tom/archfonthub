import { useEffect, useRef, useState } from "react";
export default function FontSpecimen({ text, family }) {
  const ref = useRef(null);
  const [size, setSize] = useState(30);
  useEffect(() => {
    let cancelled = false;
    const node = ref.current;
    const fit = () => {
      if (cancelled || !node) return;
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `42px ${family}`;
      setSize(
        Math.max(
          16,
          Math.min(
            42,
            (42 * Math.max(25, node.clientWidth - 20)) /
              Math.max(1, ctx.measureText(text).width),
          ),
        ),
      );
    };
    fit();
    document.fonts.ready.then(fit);
    document.fonts.addEventListener("loadingdone", fit);
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", fit);
    };
  }, [text, family]);
  return (
    <span
      ref={ref}
      className="font-specimen"
      dir="auto"
      style={{ fontFamily: family, fontSize: size }}
    >
      {text}
    </span>
  );
}
