export const getSafeFontFamilyPreview = (font) => {
    if (!font) return 'inherit';
    if (font.name === 'Alumni Sans') return 'Alumni Sans Regular';

    const firstStyleKey = Object.keys(font.styles || {})[0];
    return firstStyleKey ? font.styles[firstStyleKey] : 'inherit';
};

export const formatStyleLabel = (styleKey) =>
    String(styleKey).charAt(0).toUpperCase() + String(styleKey).slice(1);

export const normalizePreviewText = (value) => {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (value == null) return '';
    return String(value);
};
