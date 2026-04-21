import * as opentype from 'opentype.js';
import fontCssText from '../index.css?raw';

const fontAssetMap = Array.from(
    fontCssText.matchAll(/@font-face\s*{[\s\S]*?font-family:\s*'([^']+)'[\s\S]*?src:\s*url\('([^']+)'\)/g)
).reduce((map, [, fontFamily, fontUrl]) => {
    map[fontFamily] = fontUrl;
    return map;
}, {});

const curveFontCache = new Map();

const COREL_SAFE_EDITABLE_FONTS = new Set([
    'Arial',
    'Arial Bold',
    'Arial Italic',
    'Arial Bold Italic',
    'Calibri',
    'Calibri Bold',
    'Calibri Italic',
    'Times New Roman',
    'Times New Roman Bold',
    'Times New Roman Italic',
    'Times New Roman Bold Italic',
    'Monotype Corsiva',
    'French Script MT',
    'Old English Text MT',
    'Bookman Old Style Bold',
    'Bookman Old Style Italic',
    'Bookman Old Style Bold Italic',
    'Century Schoolbook',
    'Century Schoolbook Bold',
    'Century Schoolbook Bold Italic',
]);

const isCorelSafeEditableFont = (fontFamily) =>
    COREL_SAFE_EDITABLE_FONTS.has(fontFamily);

const loadCurveFont = async (fontFamily) => {
    if (!fontFamily || !fontAssetMap[fontFamily]) return null;

    if (!curveFontCache.has(fontFamily)) {
        curveFontCache.set(
            fontFamily,
            (async () => {
                const response = await fetch(fontAssetMap[fontFamily]);
                if (!response.ok) {
                    throw new Error(`Failed to load font asset for ${fontFamily}`);
                }

                const fontBuffer = await response.arrayBuffer();
                return opentype.parse(fontBuffer);
            })().catch((error) => {
                console.error(error);
                return null;
            })
        );
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

    return (
        y -
        (((font.ascender + font.descender) / 2) / font.unitsPerEm) * fontSize
    );
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
    const startX =
        anchor === 'middle'
            ? x - width / 2
            : anchor === 'end'
            ? x - width
            : x;
    const baselineY = getCurveBaselineY(font, y, fontSize, verticalAlign);
    const pathData = font
        .getPath(text, startX, baselineY, fontSize, { kerning: true })
        .toPathData(4);

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
    loadCurveFont,
    isCorelSafeEditableFont,
    buildSvgTextElement,
    getCurveBaselineY,
    buildCurveTextElement,
    buildArtworkTextElement,
};