import * as opentype from 'opentype.js';
import fontCssText from '../index.css?raw';

const fontAssetMap = Array.from(
    fontCssText.matchAll(/@font-face\s*{[\s\S]*?font-family:\s*'([^']+)'[\s\S]*?src:\s*url\('([^']+)'\)/g)
).reduce((map, [, fontFamily, fontUrl]) => {
    map[fontFamily] = fontUrl;
    return map;
}, {});

const curveFontCache = new Map();
const fontDataUriCache = new Map();

const getFontMimeType = (fontUrl) => {
    if (!fontUrl) return 'font/ttf';
    const lower = fontUrl.toLowerCase();
    if (lower.endsWith('.woff2')) return 'font/woff2';
    if (lower.endsWith('.woff')) return 'font/woff';
    if (lower.endsWith('.otf')) return 'font/otf';
    if (lower.endsWith('.ttf')) return 'font/ttf';
    return 'application/octet-stream';
};

const toBase64 = (arrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
};

const getEmbeddedFontDataUri = async (fontFamily) => {
    if (!fontFamily || !fontAssetMap[fontFamily]) return null;
    if (!fontDataUriCache.has(fontFamily)) {
        fontDataUriCache.set(fontFamily, (async () => {
            const fontUrl = fontAssetMap[fontFamily];
            const response = await fetch(fontUrl);
            if (!response.ok) {
                throw new Error(`Failed to load font asset for ${fontFamily}`);
            }
            const fontBuffer = await response.arrayBuffer();
            const mimeType = getFontMimeType(fontUrl);
            const base64 = toBase64(fontBuffer);
            return `data:${mimeType};base64,${base64}`;
        })().catch((error) => {
            console.error(error);
            return null;
        }));
    }

    return fontDataUriCache.get(fontFamily);
};

const buildEmbeddedFontFaceCss = async (fontFamilies = []) => {
    const uniqueFamilies = Array.from(new Set(fontFamilies.filter(Boolean)));
    const rules = [];
    const familyMap = {};

    for (const fontFamily of uniqueFamilies) {
        const dataUri = await getEmbeddedFontDataUri(fontFamily);
        if (!dataUri) continue;
        const embeddedFamily = `AFH-${fontFamily.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        familyMap[fontFamily] = embeddedFamily;
        rules.push(`@font-face { font-family: '${embeddedFamily}'; src: url('${dataUri}'); }`);
    }

    return {
        cssText: rules.join('\n'),
        familyMap,
    };
};

const loadCurveFont = async (fontFamily) => {
    if (!fontFamily || !fontAssetMap[fontFamily]) return null;
    if (!curveFontCache.has(fontFamily)) {
        curveFontCache.set(fontFamily, (async () => {
            const response = await fetch(fontAssetMap[fontFamily]);
            if (!response.ok) {
                throw new Error(`Failed to load font asset for ${fontFamily}`);
            }

            const fontBuffer = await response.arrayBuffer();
            return opentype.parse(fontBuffer);
        })().catch(error => {
            console.error(error);
            return null;
        }));
    }

    return curveFontCache.get(fontFamily);
};

const buildSvgTextElement = ({
    x,
    y,
    anchor = 'start',
    fontFamily,
    fontSize,
    fill = '#181717',
    text,
    extraAttributes = '',
}) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" fill="${fill}" xml:space="preserve" text-rendering="geometricPrecision" font-kerning="normal" kerning="auto" stroke="none"${extraAttributes}>${text}</text>\n`;

const getCurveBaselineY = (font, y, fontSize, verticalAlign) => {
    if (verticalAlign !== 'middle') return y;
    return y - (((font.ascender + font.descender) / 2) / font.unitsPerEm) * fontSize;
};

const buildCurveTextElement = async ({
    text,
    x,
    y,
    fontFamily,
    fontSize,
    fill = '#181717',
    anchor = 'start',
    verticalAlign = 'baseline',
}) => {
    const font = await loadCurveFont(fontFamily);
    if (!font) return null;

    const width = font.getAdvanceWidth(text, fontSize, { kerning: true });
    const startX = anchor === 'middle'
        ? x - (width / 2)
        : anchor === 'end'
            ? x - width
            : x;
    const baselineY = getCurveBaselineY(font, y, fontSize, verticalAlign);
    const pathData = font.getPath(text, startX, baselineY, fontSize, { kerning: true }).toPathData(4);

    return `<path d="${pathData}" fill="${fill}" fill-rule="nonzero" stroke="none" />\n`;
};

const buildArtworkTextElement = async ({
    mode,
    text,
    x,
    y,
    fontFamily,
    exportFontFamily,
    fontSize,
    fill = '#181717',
    anchor = 'start',
    verticalAlign = 'baseline',
    escapeXml,
}) => {
    if (mode === 'curves') {
        const curveElement = await buildCurveTextElement({
            text,
            x,
            y,
            fontFamily,
            fontSize,
            fill,
            anchor,
            verticalAlign,
        });

        if (curveElement) return curveElement;
    }

    return buildSvgTextElement({
        x,
        y,
        anchor,
        fontFamily: escapeXml(exportFontFamily || fontFamily),
        fontSize,
        fill,
        text: escapeXml(text),
    });
};

export {
    fontAssetMap,
    curveFontCache,
    fontDataUriCache,
    loadCurveFont,
    buildEmbeddedFontFaceCss,
    getEmbeddedFontDataUri,
    buildSvgTextElement,
    getCurveBaselineY,
    buildCurveTextElement,
    buildArtworkTextElement,
};
