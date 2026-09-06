export const fontLibrary = {
  "Sans-serif": [
    {
      name: "Alumni Sans",
      styles: {
        black: "Alumni Sans Black",
        bold: "Alumni Sans Bold",
        extrabold: "Alumni Sans ExtraBold",
        italic: "Alumni Sans Italic",
        light: "Alumni Sans Light",
        lightItalic: "Alumni Sans Light Italic",
        medium: "Alumni Sans Medium",
        mediumItalic: "Alumni Sans Medium Italic",
        regular: "Alumni Sans Regular",
        semibold: "Alumni Sans SemiBold",
        semiboldItalic: "Alumni Sans SemiBold Italic",
      },
    },
    {
      name: "Arial",
      styles: {
        regular: "Arial",
        bold: "Arial Bold",
        italic: "Arial Italic",
        boldItalic: "Arial Bold Italic",
      },
    },
    {
      name: "Bebas Neue",
      styles: { regular: "Bebas Neue Regular", bold: "Bebas Neue Bold" },
    },
    {
      name: "Berlin Sans",
      styles: { regular: "Berlin Sans FB", bold: "Berlin Sans FB Bold" },
    },
    {
      name: "Calibri",
      styles: {
        regular: "Calibri",
        bold: "Calibri Bold",
        italic: "Calibri Italic",
      },
    },
    {
      name: "Century Gothic",
      styles: {
        regular: "Century Gothic Paneuropean",
        bold: "Century Gothic Paneuropean Bold",
        boldItalic: "Century Gothic Paneuropean Bold Italic",
      },
    },
    {
      name: "Graphik",
      styles: {
        regular: "Graphik",
        medium: "Graphik Medium",
        semibold: "Graphik Semibold",
        thin: "Graphik Thin",
        regularItalic: "Graphik Regular Italic",
        mediumItalic: "Graphik Medium Italic",
        thinItalic: "Graphik Thin Italic",
      },
    },
    {
      name: "Rajdhani",
      styles: {
        regular: "Rajdhani Regular",
        light: "Rajdhani Light",
        medium: "Rajdhani Medium",
        semibold: "Rajdhani SemiBold",
        bold: "Rajdhani Bold",
      },
    },
    { name: "Zapf Humanist", styles: { demi: "Zapf Humanist 601 Demi BT" } },
  ],
  Serif: [
    {
      name: "Benguiat",
      styles: {
        regular: "Benguiat",
        bold: "Benguiat Bold BT",
        bookItalic: "Benguiat Book Italic BT",
      },
    },
    {
      name: "Bookman Old Style",
      styles: {
        bold: "Bookman Old Style Bold",
        italic: "Bookman Old Style Italic",
        boldItalic: "Bookman Old Style Bold Italic",
      },
    },
    {
      name: "Century Schoolbook",
      styles: {
        regular: "Century Schoolbook",
        bold: "Century Schoolbook Bold",
        boldItalic: "Century Schoolbook Bold Italic",
      },
    },
    { name: "Copperplate", styles: { regular: "CopprplGoth BT Roman" } },
    { name: "Cutive Mono", styles: { regular: "Cutive Mono Regular" } },
    {
      name: "DejaVu Serif",
      styles: {
        regular: "DejaVu Serif",
        bold: "DejaVu Serif Bold",
        italic: "DejaVu Serif Italic",
        boldItalic: "DejaVu Serif Bold Italic",
        condensed: "DejaVu Serif Condensed",
        condensedBold: "DejaVu Serif Condensed Bold",
        condensedItalic: "DejaVu Serif Condensed Italic",
        condensedBoldItalic: "DejaVu Serif Condensed Bold Italic",
      },
    },
    {
      name: "Garamond",
      styles: {
        v1: "Garamond",
        v2_bold: "Garamond 3 LT Std Bold",
        v2_boldItalic: "Garamond 3 LT Std Bold Italic",
        v2_italic: "Garamond 3 LT Std Italic",
        v2_regular: "Garamond 3 LT Std",
      },
    },
    {
      name: "Noto Rashi Hebrew",
      styles: {
        regular: "Noto Rashi Hebrew Regular",
        thin: "Noto Rashi Hebrew Thin",
        extralight: "Noto Rashi Hebrew ExtraLight",
        light: "Noto Rashi Hebrew Light",
        medium: "Noto Rashi Hebrew Medium",
        semibold: "Noto Rashi Hebrew SemiBold",
        bold: "Noto Rashi Hebrew Bold",
        extrabold: "Noto Rashi Hebrew ExtraBold",
        black: "Noto Rashi Hebrew Black",
      },
    },
    {
      name: "Times New Roman",
      styles: {
        regular: "Times New Roman",
        bold: "Times New Roman Bold",
        italic: "Times New Roman Italic",
        boldItalic: "Times New Roman Bold Italic",
      },
    },
  ],
  Script: [
    {
      name: "Amatic SC",
      styles: { regular: "Amatic SC Regular", bold: "Amatic SC Bold" },
    },
    { name: "Amazone", styles: { regular: "Amazone BT" } },
    { name: "BlackChancery", styles: { regular: "BlackChancery" } },
    { name: "Clicker Script", styles: { regular: "Clicker Script" } },
    { name: "Concerto Pro", styles: { regular: "ConcertoPro-Regular" } },
    { name: "Courgette", styles: { regular: "Courgette Regular" } },
    { name: "Freebooter Script", styles: { regular: "Freebooter Script" } },
    { name: "French Script", styles: { regular: "French Script MT" } },
    { name: "Great Vibes", styles: { regular: "Great Vibes" } },
    {
      name: "Honey Script",
      styles: {
        light: "Honey Script Light",
        semiBold: "Honey Script SemiBold",
      },
    },
    { name: "I Love Glitter", styles: { regular: "I Love Glitter" } },
    {
      name: "ITC Zapf Chancery",
      styles: { regular: "ITC Zapf Chancery Roman" },
    },
    { name: "Murray Hill", styles: { regular: "Murray Hill Regular" } },
    { name: "Monotype Corsiva", styles: { regular: "Monotype Corsiva" } },
  ],
  Display: [
    {
      name: "Collegiate",
      styles: { black: "CollegiateBlackFLF", outline: "CollegiateOutlineFLF" },
    },
    { name: "Cowboy Rodeo", styles: { regular: "Cowboy Rodeo W01 Regular" } },
    { name: "Machine BT", styles: { regular: "Machine BT" } },
    { name: "Old English", styles: { regular: "Old English Text MT" } },
    { name: "Planscribe", styles: { regular: "Planscribe NF W01 Regular" } },
  ],
};

export const allFonts = Object.entries(fontLibrary).flatMap(
  ([category, fonts]) => fonts.map((font) => ({ ...font, category })),
);
export const defaultStyle = (font) =>
  font.styles.regular
    ? "regular"
    : font.styles.v2_regular
      ? "v2_regular"
      : Object.keys(font.styles)[0];
export const styleLabel = (style) =>
  style
    .replace(/^v2_/, "")
    .replace(/^v1$/, "Original")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
