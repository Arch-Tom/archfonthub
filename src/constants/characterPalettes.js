const glyphs = ['©', '®', '™', '&', '#', '+', '–', '—', '…', '•', '°', '·', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '★', '☆', '♪', '♫', '←', '→', '↑', '↓', '∞', '†', '✡\uFE0E', '✞', '✠', '±', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

const accentedCharacters = {
    'A': ['À', 'à', 'Á', 'á', 'Â', 'â', 'Ã', 'ã', 'Ä', 'ä', 'Å', 'å', 'Æ', 'æ'], 'C': ['Ç', 'ç'],
    'E': ['È', 'è', 'É', 'é', 'Ê', 'ê', 'Ë', 'ë'], 'I': ['Ì', 'ì', 'Í', 'í', 'Î', 'î', 'Ï', 'ï'],
    'N': ['Ñ', 'ñ'], 'O': ['Ò', 'ò', 'Ó', 'ó', 'Ô', 'ô', 'Õ', 'õ', 'Ö', 'ö', 'Ø', 'ø', 'Œ', 'œ'],
    'S': ['Š', 'š', 'ß'], 'U': ['Ù', 'ù', 'Ú', 'ú', 'Û', 'û', 'Ü', 'ü'],
    'Y': ['Ý', 'ý', 'Ÿ', 'ÿ'], 'Z': ['Ž', 'ž']
};

const hebrewCharacters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ך', 'ל', 'מ', 'ם', 'נ', 'ן', 'ס', 'ע', 'פ', 'ף', 'צ', 'ץ', 'ק', 'ר', 'ש', 'ת'];

const hebrewKeyboardLayout = [
    [
        { unshifted: '`', shifted: '~' },
        { unshifted: '1', shifted: 'ְ', name: 'Shva' },
        { unshifted: '2', shifted: 'ַ', name: 'Patah' },
        { unshifted: '3', shifted: 'ָ', name: 'Qamats' },
        { unshifted: '4', shifted: 'ֶ', name: 'Segol' },
        { unshifted: '5', shifted: 'ֵ', name: 'Tsere' },
        { unshifted: '6', shifted: 'ִ', name: 'Hiriq' },
        { unshifted: '7', shifted: 'ֹ', name: 'Holam' },
        { unshifted: '8', shifted: 'ּ', name: 'Dagesh' },
        { unshifted: '9', shifted: 'ֻ', name: 'Qubuts' },
        { unshifted: '0', shifted: 'ֿ', name: 'Rafe' },
        { unshifted: '-', shifted: 'ׁ', name: 'Shin Dot' },
        { unshifted: '=', shifted: 'ׂ', name: 'Sin Dot' },
    ],
    ['/', "'", 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ', '[', ']'],
    ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ','],
    ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ', '.']
];

export {
    glyphs,
    accentedCharacters,
    hebrewCharacters,
    hebrewKeyboardLayout,
};
