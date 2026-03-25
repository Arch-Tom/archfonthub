import React, { useState, useRef, useEffect, useMemo } from 'react';
import MonogramMaker from './MonogramMaker';
import LivePreviewSection from './components/LivePreviewSection';
import CustomerInfoModal from './components/modals/CustomerInfoModal';
import MessageModal from './components/modals/MessageModal';
import SuccessModal from './components/modals/SuccessModal';
import {
    accentedCharacters,
    glyphs,
    hebrewCharacters,
    hebrewKeyboardLayout,
} from './constants/characterPalettes';
import {
    exportFontFamilyMap,
    fontLibrary,
    scriptFontsToAdjust,
    styleSortOrder,
} from './constants/fontConfig';
import { buildArtworkTextElement, loadCurveFont } from './utils/svgExport';

const AlignIcon = ({ align = 'left' }) => {
    const isLeft = align === 'left';
    const isCenter = align === 'center';
    const isRight = align === 'right';

    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="block"
        >
            <rect
                x={isLeft ? 3 : isCenter ? 5 : 7}
                y="5"
                width="14"
                height="2.2"
                rx="1.1"
                fill="currentColor"
            />
            <rect
                x={isLeft ? 3 : isCenter ? 7 : 9}
                y="11"
                width="10"
                height="2.2"
                rx="1.1"
                fill="currentColor"
            />
            <rect
                x={isLeft ? 3 : isCenter ? 5 : 7}
                y="17"
                width="14"
                height="2.2"
                rx="1.1"
                fill="currentColor"
            />
        </svg>
    );
};

const SectionShell = ({
    eyebrow,
    title,
    description,
    action = null,
    children,
    tone = 'soft',
}) => {
    const toneClasses =
        tone === 'light'
            ? 'border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_24px_60px_-36px_rgba(15,23,42,0.14)]'
            : 'border-slate-200/60 bg-[linear-gradient(180deg,rgba(245,248,255,0.84),rgba(234,241,251,0.76))] shadow-[0_30px_70px_-40px_rgba(30,41,59,0.18)] backdrop-blur-sm';

    const eyebrowClasses =
        tone === 'light'
            ? 'text-slate-500 bg-slate-100/90 border-slate-200/80'
            : 'text-blue-700 bg-blue-50/80 border-blue-100/80';

    const titleClasses = 'text-slate-950';
    const descriptionClasses = 'text-slate-600';

    return (
        <section
            className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${toneClasses}`}
        >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_72%)]" />
                <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.10),transparent_72%)] blur-3xl" />
            </div>

            <div className="relative">
                {(eyebrow || title || description || action) && (
                    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-[48rem]">
                            {eyebrow && (
                                <div
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-sm ${eyebrowClasses}`}
                                >
                                    {eyebrow}
                                </div>
                            )}
                            {title && (
                                <h2
                                    className={`mt-3 text-[2rem] font-bold tracking-tight sm:text-[2.35rem] ${titleClasses}`}
                                    style={{ fontFamily: 'Alumni Sans Regular' }}
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className={`mt-2 text-[15px] leading-7 ${descriptionClasses}`}>
                                    {description}
                                </p>
                            )}
                        </div>

                        {action ? <div className="xl:shrink-0">{action}</div> : null}
                    </div>
                )}

                {children}
            </div>
        </section>
    );
};

const StatusPill = ({ children, tone = 'slate' }) => {
    const tones = {
        slate: 'border-slate-200 bg-white/90 text-slate-600',
        blue: 'border-blue-100 bg-blue-50/90 text-blue-700',
        violet: 'border-violet-100 bg-violet-50/90 text-violet-700',
        emerald: 'border-emerald-100 bg-emerald-50/90 text-emerald-700',
        amber: 'border-amber-100 bg-amber-50/90 text-amber-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${tones[tone] || tones.slate}`}
        >
            {children}
        </span>
    );
};

const App = () => {
    const WORKER_URL = 'https://customerfontselection-worker.tom-4a9.workers.dev';
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [lineSettings, setLineSettings] = useState([]);
    const [openPreviewLineIndex, setOpenPreviewLineIndex] = useState(null);
    const [fontSize, setFontSize] = useState(36);
    const [lineSpacing, setLineSpacing] = useState(1);
    const [textAlign, setTextAlign] = useState('left');
    const [customerNotes, setCustomerNotes] = useState('');
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showGlyphPalette, setShowGlyphPalette] = useState(false);
    const [showAccentPalette, setShowAccentPalette] = useState(false);
    const [showHebrewPalette, setShowHebrewPalette] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);
    const [isDataPrefilled, setIsDataPrefilled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
    const [showMonogramMaker, setShowMonogramMaker] = useState(false);
    const [monogramInfo, setMonogramInfo] = useState(null);
    const [hebrewPaletteText, setHebrewPaletteText] = useState('');
    const [lastHebrewBaseChar, setLastHebrewBaseChar] = useState('א');
    const [isShifted, setIsShifted] = useState(false);

    const customTextRef = useRef(null);

    const getSortedStyleKeys = (styles) =>
        Object.keys(styles).sort((a, b) => {
            const indexA = styleSortOrder.indexOf(a.toLowerCase());
            const indexB = styleSortOrder.indexOf(b.toLowerCase());
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

    const getFontOptionByName = (fontName, fonts = selectedFonts) =>
        fonts.find((font) => font.name === fontName);

    const getDefaultStyleKey = (fontName, fonts = selectedFonts) => {
        const font = getFontOptionByName(fontName, fonts);
        if (!font) return '';
        const styleKeys = Object.keys(font.styles);
        if (font.activeStyle && styleKeys.includes(font.activeStyle)) return font.activeStyle;
        return styleKeys[0] || '';
    };

    const normalizeFontSizeOverride = (value) => {
        if (value == null || value === '') return null;
        const parsedValue = Number(value);
        if (!Number.isFinite(parsedValue)) return null;
        return Math.max(12, Math.round(parsedValue));
    };

    const normalizeLineSelection = (line, fonts = selectedFonts) => {
        if (fonts.length === 0) {
            return {
                ...line,
                fontName: '',
                styleKey: '',
                fontSizeOverride: normalizeFontSizeOverride(line.fontSizeOverride),
            };
        }

        const selectedFont = getFontOptionByName(line.fontName, fonts) || fonts[0];
        const nextFontName = selectedFont.name;
        const nextStyleKey = selectedFont.styles[line.styleKey]
            ? line.styleKey
            : getDefaultStyleKey(nextFontName, fonts);

        return {
            ...line,
            fontName: nextFontName,
            styleKey: nextStyleKey,
            fontSizeOverride: normalizeFontSizeOverride(line.fontSizeOverride),
        };
    };

    const derivedTextLines = customText === '' ? [] : customText.split(/\r?\n/);
    const previewLines = derivedTextLines.map((text, index) => ({
        lineIndex: index,
        text,
        ...normalizeLineSelection(
            lineSettings[index] || { fontName: '', styleKey: '', fontSizeOverride: null }
        ),
    }));
    const populatedPreviewLines = previewLines.filter((line) => line.text.trim() !== '');
    const combinedText = customText;
    const hasStandardSelection = selectedFonts.length > 0 && populatedPreviewLines.length > 0;
    const hasReadySubmission = Boolean(monogramInfo || hasStandardSelection);

    const selectedFontNames = useMemo(
        () => selectedFonts.map((font) => font.name),
        [selectedFonts]
    );
    const textLineCount = populatedPreviewLines.length;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlOrderId = params.get('orderId');
        const urlName = params.get('name');
        const urlCompany = params.get('company');

        if (urlOrderId && urlName) {
            setOrderNumber(urlOrderId);
            setCustomerName(urlName);
            setCustomerCompany(urlCompany || '');
            setIsDataPrefilled(true);
        }
    }, []);

    useEffect(() => {
        setLineSettings((prevSettings) => {
            const nextSettings = derivedTextLines.map((_, index) =>
                normalizeLineSelection(prevSettings[index] || { fontName: '', styleKey: '' }, selectedFonts)
            );

            if (
                nextSettings.length === prevSettings.length &&
                nextSettings.every(
                    (setting, index) =>
                        setting.fontName === prevSettings[index]?.fontName &&
                        setting.styleKey === prevSettings[index]?.styleKey &&
                        setting.fontSizeOverride === prevSettings[index]?.fontSizeOverride
                )
            ) {
                return prevSettings;
            }

            return nextSettings;
        });
    }, [customText, selectedFonts]);

    useEffect(() => {
        if (previewLines.length === 0) {
            if (openPreviewLineIndex !== null) {
                setOpenPreviewLineIndex(null);
            }
            return;
        }
        if (openPreviewLineIndex == null) {
            setOpenPreviewLineIndex(previewLines[0].lineIndex);
            return;
        }
        if (openPreviewLineIndex >= previewLines.length) {
            setOpenPreviewLineIndex(previewLines.length > 0 ? previewLines.length - 1 : null);
        }
    }, [openPreviewLineIndex, previewLines.length]);

    const handleFontSelect = (font) => {
        const isSelected = selectedFonts.some((f) => f.name === font.name);
        if (isSelected) {
            setSelectedFonts((prev) => prev.filter((f) => f.name !== font.name));
        } else if (selectedFonts.length < 3) {
            const defaultStyleKey = Object.keys(font.styles)[0];
            setSelectedFonts((prev) => [...prev, { ...font, activeStyle: defaultStyleKey }]);
        } else {
            showMessage(
                'You may select a maximum of 3 fonts. Please deselect a font to choose a new one.'
            );
        }
    };

    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));
    const handleLineSpacingChange = (e) => setLineSpacing(Number(e.target.value));

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };

    const formatForFilename = (str) =>
        str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleGlyphInsert = (glyph) => {
        const input = customTextRef.current;
        const start = input?.selectionStart ?? customText.length;
        const end = input?.selectionEnd ?? customText.length;
        const newText = customText.substring(0, start) + glyph + customText.substring(end);

        setCustomText(newText);

        input?.focus();
        setTimeout(() => {
            const updatedInput = customTextRef.current;
            if (updatedInput) {
                updatedInput.selectionStart = updatedInput.selectionEnd = start + glyph.length;
            }
        }, 0);
    };

    const handleApplyFontToActiveLine = (fontName) => {
        if (openPreviewLineIndex == null) return;

        setLineSettings((prevSettings) =>
            prevSettings.map((line, index) => {
                if (index !== openPreviewLineIndex) return line;

                const nextFont = getFontOptionByName(fontName);
                if (!nextFont) return line;

                const nextStyleKey = nextFont.styles[line.styleKey]
                    ? line.styleKey
                    : getDefaultStyleKey(fontName);

                return normalizeLineSelection({
                    ...line,
                    fontName,
                    styleKey: nextStyleKey,
                });
            })
        );
    };

    const handleLineStyleChange = (lineIndex, styleKey) => {
        setLineSettings((prevSettings) =>
            prevSettings.map((line, index) =>
                index === lineIndex ? { ...line, styleKey } : line
            )
        );
    };

    const handleLineFontSizeOverrideChange = (lineIndex, value) => {
        setLineSettings((prevSettings) =>
            prevSettings.map((line, index) =>
                index === lineIndex
                    ? { ...line, fontSizeOverride: normalizeFontSizeOverride(value) }
                    : line
            )
        );
    };

    const handleInsertToMain = () => {
        if (!hebrewPaletteText) return;
        handleGlyphInsert(hebrewPaletteText);
        setHebrewPaletteText('');
        setLastHebrewBaseChar('א');
        setShowHebrewPalette(false);
    };

    const handleHebrewBackspace = () => {
        if (hebrewPaletteText.length === 0) return;

        const segmenter = new Intl.Segmenter('he', { granularity: 'grapheme' });
        const graphemes = Array.from(segmenter.segment(hebrewPaletteText)).map((s) => s.segment);

        graphemes.pop();
        const newText = graphemes.join('');

        setHebrewPaletteText(newText);

        if (newText.length === 0) {
            setLastHebrewBaseChar('א');
        } else {
            const hebrewBaseRegex = /[אבגדהוזחטיכךלמםנןסעפףצץקרשת]/g;
            const baseCharsInNewText = newText.match(hebrewBaseRegex);
            if (baseCharsInNewText) {
                setLastHebrewBaseChar(baseCharsInNewText[baseCharsInNewText.length - 1]);
            } else {
                setLastHebrewBaseChar('א');
            }
        }
    };

    const generateSvgContent = async (mode = 'editable') => {
        if (!monogramInfo && !hasStandardSelection) {
            showMessage(
                'Please create a monogram, or select at least one font and enter some text to submit.'
            );
            return null;
        }

        let svgElements = '';
        let metadataElements = '';
        const labelFontSize = 16;
        const padding = 20;
        const svgWidth = 800;
        let y = padding;

        const aligned = (() => {
            if (textAlign === 'center') return { x: svgWidth / 2, anchor: 'middle' };
            if (textAlign === 'right') return { x: svgWidth - padding, anchor: 'end' };
            return { x: padding, anchor: 'start' };
        })();

        const escapeXml = (unsafe) =>
            unsafe.replace(/[<>&'\"]/g, (c) => {
                switch (c) {
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '&':
                        return '&amp;';
                    case "'":
                        return '&apos;';
                    case '\"':
                        return '&quot;';
                    default:
                        return c;
                }
            });

        if (monogramInfo) {
            const data = monogramInfo.data;
            y += labelFontSize + 10;
            const title = data.isCircular
                ? `Circular Monogram (${data.frameStyle})`
                : `${data.font.name} (${data.style.charAt(0).toUpperCase() + data.style.slice(1)})`;
            svgElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Monogram: ${title}</text>\n`;

            const svgCenterX = svgWidth / 2;
            const monogramBlockY = y + 150;

            if (data.isCircular) {
                const [first, middle, last] = data.text;
                const frameStyle = data.frameStyle;
                const textColor =
                    frameStyle === 'solid' || frameStyle === 'double' ? 'white' : 'black';
                const baseFontSize = (data.fontSize || 100) * 1.5;
                const finalFontSize = baseFontSize * 0.9875;

                let frameSvg = '';
                if (frameStyle === 'solid') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />`;
                } else if (frameStyle === 'double') {
                    frameSvg = `<g>\n                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />\n                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="59" fill="none" stroke="white" stroke-width="3" />\n                    </g>`;
                } else if (frameStyle === 'dotted') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="4" stroke-dasharray="10 10" />`;
                } else if (frameStyle === 'outline') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="2" />`;
                } else if (frameStyle === 'thick-thin') {
                    frameSvg = `<g>\n                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="65" fill="none" stroke="black" stroke-width="5" />\n                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="57" fill="none" stroke="black" stroke-width="2" />\n                    </g>`;
                }

                svgElements += frameSvg;

                if (mode === 'curves') {
                    const letterConfigs = [
                        { char: first, fontFamily: 'LeftCircleMonogram', yOffset: 0 },
                        {
                            char: middle,
                            fontFamily: 'MiddleCircleMonogram',
                            yOffset: -(finalFontSize * 0.02),
                        },
                        { char: last, fontFamily: 'RightCircleMonogram', yOffset: 0 },
                    ];
                    const measuredWidths = await Promise.all(
                        letterConfigs.map(async ({ char, fontFamily }) => {
                            const font = await loadCurveFont(fontFamily);
                            return font
                                ? font.getAdvanceWidth(char, finalFontSize, { kerning: true })
                                : finalFontSize * 0.7;
                        })
                    );

                    let currentX =
                        svgCenterX - measuredWidths.reduce((sum, width) => sum + width, 0) / 2;
                    for (const [index, config] of letterConfigs.entries()) {
                        svgElements += await buildArtworkTextElement({
                            mode,
                            text: config.char,
                            x: currentX,
                            y: monogramBlockY + config.yOffset,
                            fontFamily: config.fontFamily,
                            exportFontFamily: config.fontFamily,
                            fontSize: finalFontSize,
                            fill: textColor,
                            anchor: 'start',
                            verticalAlign: 'middle',
                            escapeXml,
                        });
                        currentX += measuredWidths[index];
                    }
                } else {
                    const textSvg = `<text x="${svgCenterX}" y="${monogramBlockY}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" style="font-size: ${finalFontSize}px;">\n                    <tspan font-family="LeftCircleMonogram">${escapeXml(first)}</tspan>\n                    <tspan font-family="MiddleCircleMonogram" dy="-0.02em">${escapeXml(middle)}</tspan>\n                    <tspan font-family="RightCircleMonogram">${escapeXml(last)}</tspan>\n                </text>`;
                    svgElements += textSvg;
                }

                y = monogramBlockY + 100;
            } else {
                const [first, middle, last] = data.text;
                const fontFamily = data.font.styles[data.style];
                const baseSize = data.fontSize || 100;
                const sideScale = 1.2;
                const middleScale = 1.6;
                const sideSize = data.disableScaling ? baseSize : baseSize * sideScale;
                const middleSize = data.disableScaling ? baseSize : baseSize * middleScale;

                const gap = sideSize * 0.2;
                const middleLetterHalfWidth = (middleSize / 2) * 0.7;

                const middleX = svgCenterX;
                const leftX = middleX - middleLetterHalfWidth - gap;
                const rightX = middleX + middleLetterHalfWidth + gap;

                if (mode === 'curves') {
                    svgElements += await buildArtworkTextElement({
                        mode,
                        text: first,
                        x: leftX,
                        y: monogramBlockY,
                        fontFamily,
                        exportFontFamily: fontFamily,
                        fontSize: sideSize,
                        anchor: 'middle',
                        verticalAlign: 'middle',
                        escapeXml,
                    });
                    svgElements += await buildArtworkTextElement({
                        mode,
                        text: middle,
                        x: middleX,
                        y: monogramBlockY,
                        fontFamily,
                        exportFontFamily: fontFamily,
                        fontSize: middleSize,
                        anchor: 'middle',
                        verticalAlign: 'middle',
                        escapeXml,
                    });
                    svgElements += await buildArtworkTextElement({
                        mode,
                        text: last,
                        x: rightX,
                        y: monogramBlockY,
                        fontFamily,
                        exportFontFamily: fontFamily,
                        fontSize: sideSize,
                        anchor: 'middle',
                        verticalAlign: 'middle',
                        escapeXml,
                    });
                } else {
                    svgElements += `<g dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" fill="#181717">\n                    <text x="${leftX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(first)}</text>\n                    <text x="${middleX}" y="${monogramBlockY}" font-size="${middleSize}px">${escapeXml(middle)}</text>\n                    <text x="${rightX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(last)}</text>\n                </g>`;
                }
                y = monogramBlockY + middleSize / 2;
            }
        }

        let contentY = y + 40;
        if (hasStandardSelection) {
            let artworkY = contentY;

            for (const [index, line] of populatedPreviewLines.entries()) {
                const font = getFontOptionByName(line.fontName);
                const activeFontFamily =
                    font?.styles[line.styleKey] ||
                    font?.styles[getDefaultStyleKey(font?.name)] ||
                    'inherit';
                const exportFontFamily = exportFontFamilyMap[activeFontFamily] || activeFontFamily;
                const effectiveFontSize = line.fontSizeOverride ?? fontSize;
                const styleName = line.styleKey
                    ? line.styleKey.charAt(0).toUpperCase() + line.styleKey.slice(1)
                    : 'No Style';

                artworkY += effectiveFontSize * lineSpacing;
                svgElements += await buildArtworkTextElement({
                    mode,
                    text: line.text,
                    x: aligned.x,
                    y: artworkY,
                    fontFamily: activeFontFamily,
                    exportFontFamily,
                    fontSize: effectiveFontSize,
                    fill: '#181717',
                    anchor: aligned.anchor,
                    escapeXml,
                });
                metadataElements += `<text x="${padding}" y="${
                    labelFontSize + 10 + index * labelFontSize * 1.5
                }" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Line ${
                    index + 1
                }: ${escapeXml(font?.name || 'No Font')} (${escapeXml(styleName)})</text>\n`;
            }

            contentY = artworkY;
        }

        if (customerNotes.trim() !== '') {
            contentY += fontSize * 1.4;
            svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Customer Notes</text>\n`;
            contentY += labelFontSize * 0.5;

            const noteLines = customerNotes.split('\n').filter((line) => line.trim() !== '');
            noteLines.forEach((noteLine) => {
                const sanitizedNoteLine = escapeXml(noteLine);
                contentY += labelFontSize * 1.4;
                svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#181717">${sanitizedNoteLine}</text>\n`;
            });
        }

        let metadataBlock = '';
        let metadataHeight = 0;

        if (metadataElements !== '') {
            metadataHeight = populatedPreviewLines.length * labelFontSize * 1.5 + padding;
            const metadataBlockY = contentY + padding + labelFontSize;
            metadataBlock = `<g transform="translate(0, ${metadataBlockY})">\n                <text x="${padding}" y="0" font-family="Arial" font-size="${labelFontSize}" fill="#94a3b8" font-weight="700">Font Reference</text>\n                ${metadataElements}\n            </g>\n`;
        }

        const svgHeight =
            contentY + padding + metadataHeight + (metadataElements !== '' ? labelFontSize * 2 : 0);
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgElements}${metadataBlock}</svg>`;
    };

    const handleSubmitClick = async () => {
        const editableSvgContent = await generateSvgContent('editable');
        if (!editableSvgContent) return;

        const curvesSvgContent = await generateSvgContent('curves');
        if (!curvesSvgContent) return;

        const svgContent = {
            editable: editableSvgContent,
            curves: curvesSvgContent,
        };

        setPendingSvgContent(svgContent);

        if (isDataPrefilled) {
            handleFinalSubmit(svgContent);
        } else {
            setShowCustomerModal(true);
        }
    };

    const uploadSvgFile = async (filename, svgContent) => {
        const response = await fetch(`${WORKER_URL}/${filename}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/svg+xml' },
            body: svgContent,
        });

        if (response.status === 409) {
            throw new Error(`A submission for ${filename} already exists.`);
        }

        if (!response.ok) {
            throw new Error(await response.text());
        }
    };

    const handleFinalSubmit = async (svgContent) => {
        if (!orderNumber.trim() || !customerName.trim()) {
            showMessage('Order Number and Customer Name are required.');
            return;
        }

        setIsSubmitting(true);
        setShowCustomerModal(false);
        const baseFilename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : '',
        ]
            .filter(Boolean)
            .join('_');
        const editableFilename = `${baseFilename}.svg`;
        const curvesFilename = `${baseFilename}_CURVES.svg`;

        try {
            await Promise.all([
                uploadSvgFile(editableFilename, svgContent.editable),
                uploadSvgFile(curvesFilename, svgContent.curves),
            ]);
            setShowSuccessModal(true);
            setIsSubmissionComplete(true);
        } catch (error) {
            console.error('Upload error:', error);
            showMessage(`Error uploading SVG: ${error.message}`, 6000);
        } finally {
            setIsSubmitting(false);
        }

        if (!isDataPrefilled) {
            setCustomerName('');
            setCustomerCompany('');
            setOrderNumber('');
        }
        setPendingSvgContent(null);
    };

    const handleCustomerModalSubmit = (e) => {
        e.preventDefault();
        handleFinalSubmit(pendingSvgContent);
    };

    const hebrewRegex = /[\u0590-\u05FF]/;

    return (
        <div className="min-h-screen bg-transparent text-slate-900">
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute left-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)] blur-3xl" />
                <div className="absolute right-[-10rem] top-[18rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.12),transparent_72%)] blur-3xl" />
                <div className="absolute bottom-[-10rem] left-[28%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.12),transparent_72%)] blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-[1650px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <div className="grid min-h-[calc(100vh-2rem)] gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
                    <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
                        <div className="flex h-full flex-col overflow-hidden rounded-[2.15rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(236,242,252,0.96),rgba(227,236,248,0.94)_50%,rgba(219,230,246,0.92)_100%)] p-6 shadow-[0_28px_70px_-36px_rgba(30,41,59,0.18)] sm:p-7">
                            <div className="rounded-[1.6rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(241,245,251,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <img
                                    src="/images/Arch Vector Logo White.svg"
                                    alt="Arch Font Hub Logo"
                                    className="mx-auto h-28 w-28 object-contain drop-shadow-lg sm:h-32 sm:w-32"
                                />
                                <div className="mt-5 text-center">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                                        Premium Font Studio
                                    </div>
                                    <h1
                                        className="mt-2 text-[2.4rem] font-bold tracking-tight text-slate-900"
                                        style={{ fontFamily: 'Alumni Sans Regular' }}
                                    >
                                        Arch Font Hub
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Explore fonts, shape specimens, test hierarchy, and submit a selection that feels deliberate.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-[1.45rem] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.8),rgba(245,247,255,0.74))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                    Submission state
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                    {hasReadySubmission
                                        ? 'You have enough information to submit whenever you are ready.'
                                        : 'Choose at least one font and enter preview text to unlock submission.'}
                                </p>
                            </div>

                            <div className="mt-auto pt-5">
                                <button
                                    className="w-full rounded-[1.15rem] border border-blue-100 bg-[linear-gradient(180deg,#60a5fa,#2563eb)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_26px_-16px_rgba(37,99,235,0.45)] transition-all hover:-translate-y-px hover:shadow-[0_22px_30px_-14px_rgba(37,99,235,0.55)]"
                                    onClick={() => setShowMonogramMaker(true)}
                                    type="button"
                                >
                                    Open Monogram Maker
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="min-w-0 pb-10">
                        {isSubmissionComplete && (
                            <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                                <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
                                    <h2
                                        className="text-4xl font-bold text-slate-900"
                                        style={{ fontFamily: 'Alumni Sans Regular' }}
                                    >
                                        Submission Complete
                                    </h2>
                                    <p className="mt-4 text-lg text-slate-600">
                                        Thank you for your submission. You may now close this window.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <SectionShell
                                eyebrow="Studio overview"
                                title="Build a font selection that actually feels premium"
                                description="This workspace is designed to help you compare fonts, shape text hierarchy, and submit a cleaner, more intentional direction for the final proof."
                                action={
                                    <div className="flex flex-wrap gap-2">
                                        <StatusPill tone={selectedFonts.length > 0 ? 'blue' : 'slate'}>
                                            {selectedFonts.length > 0
                                                ? `${selectedFonts.length} font${
                                                      selectedFonts.length === 1 ? '' : 's'
                                                  } selected`
                                                : 'No fonts selected'}
                                        </StatusPill>
                                        <StatusPill tone={textLineCount > 0 ? 'emerald' : 'slate'}>
                                            {textLineCount > 0
                                                ? `${textLineCount} preview line${
                                                      textLineCount === 1 ? '' : 's'
                                                  }`
                                                : 'No preview text'}
                                        </StatusPill>
                                        <StatusPill tone={monogramInfo ? 'amber' : 'slate'}>
                                            {monogramInfo ? 'Monogram included' : 'Monogram optional'}
                                        </StatusPill>
                                    </div>
                                }
                            >
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
                                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Selected fonts
                                        </div>

                                        <div className="mt-4 flex min-h-[58px] flex-wrap gap-2.5">
                                            {selectedFontNames.length > 0 ? (
                                                selectedFontNames.map((name, index) => {
                                                    const tones = ['blue', 'violet', 'amber'];
                                                    return (
                                                        <StatusPill
                                                            key={name}
                                                            tone={tones[index % tones.length]}
                                                        >
                                                            {name}
                                                        </StatusPill>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center text-sm text-slate-500">
                                                    Your chosen fonts will show up here.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.78),rgba(248,250,255,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Quick tools
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2.5">
                                            <button
                                                onClick={() => setShowHebrewPalette(true)}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                                type="button"
                                            >
                                                Hebrew Keyboard
                                            </button>
                                            <button
                                                onClick={() => setShowAccentPalette(true)}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                                type="button"
                                            >
                                                Accents
                                            </button>
                                            <button
                                                onClick={() => setShowGlyphPalette(true)}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                                type="button"
                                            >
                                                Symbols
                                            </button>
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            Use these while composing text so the preview better matches the real job.
                                        </p>
                                    </div>
                                </div>
                            </SectionShell>

                            <SectionShell
                                eyebrow="Step 1"
                                title="Choose up to three fonts"
                                description="Pick a tight shortlist. The comparison tools work best when you’re choosing between a few genuinely strong directions."
                            >
                                <div className="space-y-7">
                                    {Object.entries(fontLibrary).map(([category, fonts]) => (
                                        <div key={category}>
                                            <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200/70 pb-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                                                    {category}
                                                </h3>
                                                <span className="text-xs font-medium text-slate-400">
                                                    Tap to add or remove
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                {fonts.map((font) => {
                                                    const isSelected = selectedFonts.some(
                                                        (f) => f.name === font.name
                                                    );
                                                    const isScriptFont = scriptFontsToAdjust.includes(
                                                        font.name
                                                    );
                                                    let fontSizeClass = isScriptFont
                                                        ? 'text-2xl'
                                                        : 'text-lg';
                                                    if (font.name === 'Concerto Pro')
                                                        fontSizeClass = 'text-4xl';

                                                    return (
                                                        <button
                                                            key={font.name}
                                                            onClick={() => handleFontSelect(font)}
                                                            className={`group relative overflow-hidden rounded-[1.2rem] border px-5 py-3.5 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${fontSizeClass} ${
                                                                isSelected
                                                                    ? 'border-blue-200 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(237,233,254,0.92))] text-slate-900 shadow-[0_20px_30px_-22px_rgba(59,130,246,0.28)]'
                                                                    : 'border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))] text-slate-800 shadow-[0_18px_28px_-24px_rgba(15,23,42,0.10)] hover:-translate-y-px hover:border-slate-300 hover:bg-white'
                                                            }`}
                                                            style={{
                                                                fontFamily:
                                                                    font.name === 'Alumni Sans'
                                                                        ? 'Alumni Sans Regular'
                                                                        : font.styles[
                                                                              Object.keys(font.styles)[0]
                                                                          ],
                                                            }}
                                                            type="button"
                                                        >
                                                            <span className="relative z-10 flex items-center gap-3">
                                                                <span>{font.name}</span>
                                                                {isSelected && (
                                                                    <span className="rounded-full border border-blue-100 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionShell>

                            <SectionShell
                                eyebrow="Step 2"
                                title="Enter your preview text"
                                description="Use real wording from the order whenever possible. Multiple lines are perfect for testing size hierarchy, spacing, and mixed-font layouts."
                                action={
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <button
                                            onClick={() => setShowHebrewPalette(true)}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                            type="button"
                                        >
                                            Hebrew
                                        </button>
                                        <button
                                            onClick={() => setShowAccentPalette(true)}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                            type="button"
                                        >
                                            Accents
                                        </button>
                                        <button
                                            onClick={() => setShowGlyphPalette(true)}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:bg-slate-50"
                                            type="button"
                                        >
                                            Symbols
                                        </button>
                                    </div>
                                }
                            >
                                <div className="rounded-[1.55rem] border border-slate-200/80 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:p-5">
                                    <textarea
                                        ref={customTextRef}
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        placeholder={DEFAULT_TEXT_PLACEHOLDER}
                                        dir="auto"
                                        className="min-h-[230px] w-full rounded-[1.3rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,251,0.96))] px-5 py-4 text-xl text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200/60"
                                    />
                                </div>
                            </SectionShell>

                            <LivePreviewSection
                                monogramInfo={monogramInfo}
                                combinedText={combinedText}
                                hebrewRegex={hebrewRegex}
                                hasStandardSelection={hasStandardSelection}
                                previewLines={previewLines}
                                openPreviewLineIndex={openPreviewLineIndex}
                                setOpenPreviewLineIndex={setOpenPreviewLineIndex}
                                selectedFonts={selectedFonts}
                                getFontOptionByName={getFontOptionByName}
                                getDefaultStyleKey={getDefaultStyleKey}
                                getSortedStyleKeys={getSortedStyleKeys}
                                fontSize={fontSize}
                                lineSpacing={lineSpacing}
                                textAlign={textAlign}
                                setTextAlign={setTextAlign}
                                handleFontSizeChange={handleFontSizeChange}
                                handleLineSpacingChange={handleLineSpacingChange}
                                handleApplyFontToActiveLine={handleApplyFontToActiveLine}
                                handleLineStyleChange={handleLineStyleChange}
                                handleLineFontSizeOverrideChange={handleLineFontSizeOverrideChange}
                                AlignIcon={AlignIcon}
                            />

                            <SectionShell
                                eyebrow="Step 3"
                                title="Notes for the designer"
                                description="Use this for special instructions, preferred alternatives, hierarchy notes, or anything that should travel with the submission."
                            >
                                <textarea
                                    className="min-h-[160px] w-full rounded-[1.3rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,251,0.96))] px-5 py-4 text-lg text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200/60"
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder="e.g., Please use Gotham if available, keep the first line more prominent, and make sure the accented characters match the proof style."
                                />
                            </SectionShell>

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={handleSubmitClick}
                                    className="rounded-[1.25rem] bg-[linear-gradient(180deg,#60a5fa,#2563eb)] px-8 py-3.5 text-lg font-bold text-white shadow-[0_18px_28px_-16px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_22px_32px_-14px_rgba(37,99,235,0.48)] disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSubmitting || !hasReadySubmission}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Selection'}
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {(showCustomerModal ||
                showMessageBox ||
                showGlyphPalette ||
                showAccentPalette ||
                showHebrewPalette ||
                showSuccessModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.28)] animate-jump-in">
                        {showSuccessModal && (
                            <SuccessModal onClose={() => setShowSuccessModal(false)} />
                        )}

                        {showHebrewPalette && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-slate-900">Hebrew Keyboard</h3>
                                <p className="text-slate-600">
                                    Compose your Hebrew text below, then insert it into the main text area.
                                </p>
                                <div className="pt-2">
                                    <div className="mb-2 flex justify-between items-center">
                                        <label className="block text-sm font-medium text-slate-700">
                                            Preview
                                        </label>
                                        <button
                                            onClick={() => {
                                                setHebrewPaletteText('');
                                                setLastHebrewBaseChar('א');
                                            }}
                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-semibold"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <textarea
                                        readOnly
                                        className="w-full p-3 border border-slate-200 rounded-xl shadow-inner bg-slate-50 min-h-[100px] text-2xl cursor-default text-slate-900"
                                        value={hebrewPaletteText}
                                        dir="rtl"
                                        style={{ fontFamily: 'Noto Rashi Hebrew Regular' }}
                                    />
                                </div>
                                <div className="p-3 bg-slate-200 rounded-xl space-y-2 select-none">
                                    {hebrewKeyboardLayout.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex justify-center gap-1.5">
                                            {row.map((key, keyIndex) => {
                                                const char =
                                                    typeof key === 'object'
                                                        ? isShifted
                                                            ? key.shifted
                                                            : key.unshifted
                                                        : key;
                                                return (
                                                    <button
                                                        key={keyIndex}
                                                        onClick={() => {
                                                            setHebrewPaletteText((prev) => prev + char);
                                                            if (
                                                                !isShifted &&
                                                                hebrewCharacters.includes(char)
                                                            ) {
                                                                setLastHebrewBaseChar(char);
                                                            }
                                                            setIsShifted(false);
                                                        }}
                                                        className="h-12 flex-1 flex items-center justify-center rounded-lg bg-white hover:bg-blue-100 text-slate-800 text-xl font-semibold shadow-sm transition-colors"
                                                    >
                                                        {char}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                    <div className="flex justify-center gap-1.5">
                                        <button
                                            onClick={() => setIsShifted((prev) => !prev)}
                                            className={`h-12 w-24 flex items-center justify-center rounded-lg text-slate-800 text-lg font-semibold shadow-sm transition-colors ${
                                                isShifted
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white hover:bg-blue-100'
                                            }`}
                                        >
                                            Shift
                                        </button>
                                        <button
                                            onClick={() =>
                                                setHebrewPaletteText((prev) => prev + ' ')
                                            }
                                            className="h-12 flex-1 flex items-center justify-center rounded-lg bg-white hover:bg-blue-100 text-slate-800 text-xl font-semibold shadow-sm transition-colors"
                                        >
                                            Space
                                        </button>
                                        <button
                                            onClick={handleHebrewBackspace}
                                            className="h-12 w-24 flex items-center justify-center rounded-lg bg-white hover:bg-blue-100 text-slate-800 text-lg font-semibold shadow-sm transition-colors"
                                        >
                                            Backspace
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0"
                                        onClick={() => {
                                            setShowHebrewPalette(false);
                                            setIsShifted(false);
                                            setHebrewPaletteText('');
                                            setLastHebrewBaseChar('א');
                                        }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-sm text-base flex-shrink-0"
                                        onClick={handleInsertToMain}
                                    >
                                        Insert Text
                                    </button>
                                </div>
                            </div>
                        )}

                        {showAccentPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    Accented Character Palette
                                </h3>
                                <div className="space-y-4 bg-slate-50 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                                    {Object.entries(accentedCharacters).map(([baseLetter, chars]) => (
                                        <div key={baseLetter} className="flex items-start gap-4">
                                            <div className="font-bold text-lg text-slate-600 w-8 text-center pt-2">
                                                {baseLetter}
                                            </div>
                                            <div className="flex flex-wrap gap-2 flex-1">
                                                {chars.map((char) => (
                                                    <button
                                                        key={char}
                                                        onClick={() => handleGlyphInsert(char)}
                                                        className="flex items-center justify-center h-12 w-12 bg-white rounded-lg shadow-sm text-2xl text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                        title={`Insert ${char}`}
                                                    >
                                                        {char}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <p className="text-sm text-slate-600 pr-4">
                                        Character support varies by font. Confirm the final appearance in the live preview.
                                    </p>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0"
                                        onClick={() => setShowAccentPalette(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {showGlyphPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Symbol Palette</h3>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 bg-slate-50 p-4 rounded-lg">
                                    {glyphs.map((glyph) => (
                                        <button
                                            key={glyph}
                                            onClick={() => handleGlyphInsert(glyph)}
                                            className="flex items-center justify-center h-12 w-full bg-white rounded-lg shadow-sm text-2xl text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                            title={`Insert ${glyph}`}
                                        >
                                            {glyph}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <p className="text-sm text-slate-600 pr-4">
                                        Character support varies by font. Confirm the final appearance in the live preview.
                                    </p>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0"
                                        onClick={() => setShowGlyphPalette(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {showCustomerModal && (
                            <CustomerInfoModal
                                onSubmit={handleCustomerModalSubmit}
                                orderNumber={orderNumber}
                                onOrderNumberChange={(e) => setOrderNumber(e.target.value)}
                                customerName={customerName}
                                onCustomerNameChange={(e) => setCustomerName(e.target.value)}
                                customerCompany={customerCompany}
                                onCustomerCompanyChange={(e) => setCustomerCompany(e.target.value)}
                                isDataPrefilled={isDataPrefilled}
                                isSubmitting={isSubmitting}
                                onCancel={() => setShowCustomerModal(false)}
                            />
                        )}

                        {showMessageBox && (
                            <MessageModal
                                message={message}
                                onClose={() => setShowMessageBox(false)}
                            />
                        )}
                    </div>
                </div>
            )}

            {showMonogramMaker && (
                <MonogramMaker
                    fontLibrary={fontLibrary}
                    onClose={() => setShowMonogramMaker(false)}
                    onInsert={(info) => {
                        setMonogramInfo(info);
                        setShowMonogramMaker(false);
                    }}
                />
            )}
        </div>
    );
};

export default App;