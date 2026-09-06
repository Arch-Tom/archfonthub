// Preserve the existing production upload contract; tests inject fetch.
export const WORKER_URL =
  "https://customerfontselection-worker.tom-4a9.workers.dev";
const string = (value) => String(value ?? "");
const escapeXml = (value) =>
  string(value).replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character],
  );

function requestError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  if (status !== undefined) error.status = status;
  return error;
}

export function createFilename(snapshot) {
  if (
    !string(snapshot.orderNumber).trim() ||
    !string(snapshot.customerName).trim()
  ) {
    throw requestError(
      "validation",
      "Please enter your order number and name.",
    );
  }
  // Match production exactly so a retry addresses the same R2 object.
  const format = (value) =>
    string(value)
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");
  const stem = [
    snapshot.orderNumber,
    snapshot.customerName,
    snapshot.customerCompany,
  ]
    .map(format)
    .filter(Boolean)
    .join("_");
  if (!stem)
    throw requestError(
      "validation",
      "Please check your order number before sending.",
    );
  return `${stem}.svg`;
}

function monogramSvg(info, width, top) {
  const data = info?.data;
  if (!data)
    throw requestError(
      "validation",
      "Please open Monogram Maker and add your monogram again.",
    );
  const family = escapeXml(
    data.font?.styles?.[data.style] || "Times New Roman",
  );
  const center = width / 2;
  const title =
    data.type === "split"
      ? "Split letter monogram"
      : data.isCircular || data.type === "circular"
        ? `Circular monogram (${data.frameStyle || "none"})`
        : `${data.disableScaling || data.type === "flat" ? "Same-size" : "Classic"} monogram`;
  const fontLabel = data.font?.name
    ? ` — ${data.font.name}${data.style ? ` (${data.style})` : ""}`
    : "";
  let markup = `<text x="24" y="${top + 20}" font-family="Arial" font-size="16" fill="#475569">${escapeXml(title + fontLabel)}</text>`;
  if (data.type === "split") {
    if (!string(data.initial).trim() || !string(data.name).trim()) {
      throw requestError(
        "validation",
        "Please add an initial and name to your split monogram.",
      );
    }
    // Mirror SplitLetterMonogram's SVG, including its selected name font.
    markup += `<svg x="${center - 120}" y="${top + 36}" width="240" height="240" viewBox="0 0 100 100">
      <defs><clipPath id="request-split-letter"><text x="50" y="52" dominant-baseline="middle" text-anchor="middle" font-size="90" font-family="${family}" font-weight="bold">${escapeXml(data.initial)}</text></clipPath></defs>
      <rect width="100" height="100" fill="black" clip-path="url(#request-split-letter)" />
      <rect x="0" y="42.5" width="100" height="15" fill="white" />
      <text x="50" y="51" dominant-baseline="middle" text-anchor="middle" font-size="12" font-family="${family}" letter-spacing="0.1em">${escapeXml(data.name)}</text>
    </svg>`;
    return { markup, bottom: top + 290 };
  }
  if (
    !Array.isArray(data.text) ||
    data.text.length !== 3 ||
    data.text.some((initial) => !string(initial).trim())
  ) {
    throw requestError(
      "validation",
      "Please add all three initials to your monogram.",
    );
  }
  const [first, middle, last] = data.text.map(escapeXml);
  const baseline = top + 150;
  if (data.isCircular || data.type === "circular") {
    const frame = data.frameStyle;
    const circle = (radius, attributes) =>
      `<circle cx="${center}" cy="${baseline}" r="${radius}" ${attributes} />`;
    if (frame === "solid" || frame === "double")
      markup += circle(64, 'fill="black"');
    if (frame === "double")
      markup += circle(59, 'fill="none" stroke="white" stroke-width="3"');
    if (frame === "dotted")
      markup += circle(
        64,
        'fill="none" stroke="black" stroke-width="4" stroke-dasharray="10 10"',
      );
    if (frame === "outline")
      markup += circle(64, 'fill="none" stroke="black" stroke-width="2"');
    if (frame === "thick-thin")
      markup +=
        circle(65, 'fill="none" stroke="black" stroke-width="5"') +
        circle(57, 'fill="none" stroke="black" stroke-width="2"');
    const color = frame === "solid" || frame === "double" ? "white" : "black";
    markup += `<text x="${center}" y="${baseline}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="118.5"><tspan font-family="LeftCircleMonogram">${first}</tspan><tspan font-family="MiddleCircleMonogram" dy="-0.02em">${middle}</tspan><tspan font-family="RightCircleMonogram">${last}</tspan></text>`;
  } else {
    const flat = data.disableScaling || data.type === "flat";
    const base = Math.min(100, Math.max(40, Number(data.fontSize) || 100));
    const sideSize = flat ? base : base * 1.2;
    const middleSize = flat ? base : base * 1.6;
    const spacing = middleSize * 0.35 + sideSize * 0.2;
    markup += `<g text-anchor="middle" dominant-baseline="middle" font-family="${family}"><text x="${center - spacing}" y="${baseline}" font-size="${sideSize}">${first}</text><text x="${center}" y="${baseline}" font-size="${middleSize}">${middle}</text><text x="${center + spacing}" y="${baseline}" font-size="${sideSize}">${last}</text></g>`;
  }
  return { markup, bottom: top + 260 };
}

export function generateSvgContent(snapshot) {
  const text = string(snapshot.text);
  const notes = string(snapshot.notes);
  const favorites = snapshot.favorites || [];
  if (favorites.length > 3)
    throw requestError(
      "validation",
      "Please choose up to three favorite fonts.",
    );
  if (!snapshot.monogramInfo && (!text.trim() || favorites.length === 0)) {
    throw requestError(
      "validation",
      "Please enter your wording and choose at least one favorite, or add a monogram.",
    );
  }
  const fontSize = Math.min(80, Math.max(12, Number(snapshot.fontSize) || 36));
  // Retain intentional empty lines and spaces; line endings are normalized only.
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const noteLines = notes.replace(/\r\n?/g, "\n").split("\n");
  const longest = (values) =>
    Math.max(0, ...values.map((value) => [...value].length));
  const width = Math.max(
    800,
    Math.ceil(longest(lines) * fontSize * 1.2 + 48),
    longest(noteLines) * 12 + 48,
  );
  const align =
    snapshot.textAlign === "center"
      ? { x: width / 2, anchor: "middle" }
      : snapshot.textAlign === "right"
        ? { x: width - 24, anchor: "end" }
        : { x: 24, anchor: "start" };
  let y = 36;
  const parts = [];
  const label = (value) => {
    parts.push(
      `<text x="24" y="${y}" font-family="Arial" font-size="16" fill="#475569">${escapeXml(value)}</text>`,
    );
    y += 28;
  };
  label("Arch Font Hub — lettering preferences for your proof");
  if (snapshot.orderNumber) label(`Order: ${snapshot.orderNumber}`);
  if (snapshot.customerName) label(`Customer: ${snapshot.customerName}`);
  if (snapshot.customerCompany) label(`Company: ${snapshot.customerCompany}`);
  y += 12;
  const renderWording = (family) => {
    for (const line of lines) {
      y += fontSize * 1.4;
      parts.push(
        `<text x="${align.x}" y="${y}" text-anchor="${align.anchor}" font-family="${escapeXml(family)}" font-size="${fontSize}" style="unicode-bidi:plaintext">${escapeXml(line)}</text>`,
      );
    }
    y += 44;
  };
  // A monogram does not make accompanying wording or font preferences optional
  // in the saved artwork: designers must see everything shown in final review.
  for (const favorite of favorites) {
    const style = favorite.activeStyle || Object.keys(favorite.styles || {})[0];
    const family = favorite.styles?.[style];
    if (!family)
      throw requestError(
        "validation",
        "Please choose the style for each favorite font again.",
      );
    label(`${favorite.name} (${style})`);
    if (text.trim()) renderWording(family);
  }
  if (text.trim() && favorites.length === 0) {
    label("Engraving wording (font to be chosen with your designer)");
    renderWording("Arial");
  }
  if (snapshot.monogramInfo) {
    const monogram = monogramSvg(snapshot.monogramInfo, width, y);
    parts.push(monogram.markup);
    y = monogram.bottom;
  }
  if (notes.trim()) {
    label("Designer notes");
    for (const line of noteLines) {
      parts.push(
        `<text x="24" y="${y}" font-family="Arial" font-size="16" style="unicode-bidi:plaintext">${escapeXml(line)}</text>`,
      );
      y += 24;
    }
  }
  // Keep exact source wording and identity independently of font support.
  const metadata = {
    text,
    notes,
    orderNumber: string(snapshot.orderNumber),
    customerName: string(snapshot.customerName),
    customerCompany: string(snapshot.customerCompany),
    favorites: favorites.map(({ name, styles, activeStyle }) => ({
      name,
      styles,
      activeStyle,
    })),
    monogram: snapshot.monogramInfo?.data || null,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.ceil(y + 24)}" xml:space="preserve" style="background-color:#fff"><title>Arch Font Hub request</title><metadata>${escapeXml(JSON.stringify(metadata))}</metadata><rect width="100%" height="100%" fill="white" /><g fill="#181717">${parts.join("\n")}</g></svg>`;
}

export async function submitRequest(
  snapshot,
  { fetchImpl = globalThis.fetch, signal, timeoutMs = 30000 } = {},
) {
  const filename = createFilename(snapshot);
  const svg = generateSvgContent(snapshot);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetchImpl(`${WORKER_URL}/${filename}`, {
      method: "PUT",
      headers: { "Content-Type": "image/svg+xml" },
      body: svg,
      signal: controller.signal,
    });
    if (response.status === 409) {
      throw requestError(
        "duplicate",
        "A request with these order and customer details is already saved. Please contact Arch to confirm or change it.",
        409,
      );
    }
    if (!response.ok) {
      throw requestError(
        "server",
        "We couldn’t confirm that Arch received your request. Your choices are still here. Please try again or contact Arch with your order number.",
        response.status,
      );
    }
    return { filename, svg };
  } catch (error) {
    if (error.code === "duplicate" || error.code === "server") throw error;
    throw requestError(
      "network",
      "We couldn’t confirm that Arch received your request. Your choices are still here. Check your connection and try again, or contact Arch with your order number.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
