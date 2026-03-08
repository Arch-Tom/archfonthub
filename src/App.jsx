import React, { useState, useRef, useEffect } from 'react';
import MonogramMaker from './MonogramMaker';
import CircularMonogram from './CircularMonogram'; // Still needed for font thumbnails
import CustomerInfoModal from './components/modals/CustomerInfoModal';
import MessageModal from './components/modals/MessageModal';
import SuccessModal from './components/modals/SuccessModal';
import { accentedCharacters, glyphs, hebrewCharacters, hebrewKeyboardLayout } from './constants/characterPalettes';
import { exportFontFamilyMap, fontLibrary, scriptFontsToAdjust, styleSortOrder } from './constants/fontConfig';

import { buildArtworkTextElement, loadCurveFont } from './utils/svgExport';

// NEW: inline alignment icon (no external icon library)
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
            {/* top line */}
            <rect
                x={isLeft ? 3 : isCenter ? 5 : 7}
                y="5"
                width="14"
                height="2.2"
                rx="1.1"
                fill="currentColor"
            />
            {/* middle line */}
            <rect
                x={isLeft ? 3 : isCenter ? 7 : 9}
                y="11"
                width="10"
                height="2.2"
                rx="1.1"
                fill="currentColor"
            />
            {/* bottom line */}
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

const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [lineSettings, setLineSettings] = useState([]);
    const [openPreviewLineIndex, setOpenPreviewLineIndex] = useState(null);
    const [fontSize, setFontSize] = useState(36);
    const [lineSpacing, setLineSpacing] = useState(1.4);

    // Alignment state
    const [textAlign, setTextAlign] = useState('left'); // 'left' | 'center' | 'right'

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
    const [activeControlOffset, setActiveControlOffset] = useState(0);

    const customTextRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const previewLineRefs = useRef({});

    const getSortedStyleKeys = (styles) => Object.keys(styles).sort((a, b) => {
        const indexA = styleSortOrder.indexOf(a.toLowerCase());
        const indexB = styleSortOrder.indexOf(b.toLowerCase());
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const getFontOptionByName = (fontName, fonts = selectedFonts) => fonts.find(font => font.name === fontName);

    const getDefaultStyleKey = (fontName, fonts = selectedFonts) => {
        const font = getFontOptionByName(fontName, fonts);
        if (!font) return '';
        const styleKeys = Object.keys(font.styles);
        if (font.activeStyle && styleKeys.includes(font.activeStyle)) return font.activeStyle;
        return styleKeys[0] || '';
    };

    const normalizeLineSelection = (line, fonts = selectedFonts) => {
        if (fonts.length === 0) {
            return { ...line, fontName: '', styleKey: '' };
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
        };
    };

    const derivedTextLines = customText === '' ? [] : customText.split(/\r?\n/);
    const previewLines = derivedTextLines.map((text, index) => ({
        lineIndex: index,
        text,
        ...normalizeLineSelection(lineSettings[index] || { fontName: '', styleKey: '' }),
    }));
    const populatedPreviewLines = previewLines.filter(line => line.text.trim() !== '');
    const combinedText = customText;
    const hasStandardSelection = selectedFonts.length > 0 && populatedPreviewLines.length > 0;

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
        setLineSettings(prevSettings => {
            const nextSettings = derivedTextLines.map((_, index) =>
                normalizeLineSelection(prevSettings[index] || { fontName: '', styleKey: '' }, selectedFonts)
            );

            if (
                nextSettings.length === prevSettings.length &&
                nextSettings.every((setting, index) =>
                    setting.fontName === prevSettings[index]?.fontName &&
                    setting.styleKey === prevSettings[index]?.styleKey
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

    useEffect(() => {
        if (!hasStandardSelection) return undefined;

        const updateActiveControlOffset = () => {
            const canvas = previewCanvasRef.current;
            const activeLine = previewLineRefs.current[openPreviewLineIndex];

            if (!canvas || !activeLine) return;

            const canvasRect = canvas.getBoundingClientRect();
            const activeLineRect = activeLine.getBoundingClientRect();
            const nextOffset = (activeLineRect.top - canvasRect.top) + (activeLineRect.height / 2);

            setActiveControlOffset(nextOffset);
        };

        updateActiveControlOffset();
        window.addEventListener('resize', updateActiveControlOffset);

        return () => window.removeEventListener('resize', updateActiveControlOffset);
    }, [customText, fontSize, hasStandardSelection, openPreviewLineIndex, selectedFonts, textAlign]);

    const handleFontSelect = (font) => {
        const isSelected = selectedFonts.some(f => f.name === font.name);
        if (isSelected) {
            setSelectedFonts(prev => prev.filter(f => f.name !== font.name));
        } else if (selectedFonts.length < 3) {
            const defaultStyleKey = Object.keys(font.styles)[0];
            setSelectedFonts(prev => [...prev, { ...font, activeStyle: defaultStyleKey }]);
        } else {
            showMessage('You may select a maximum of 3 fonts. Please deselect a font to choose a new one.');
        }
    };

    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev =>
            prev.map(font =>
                font.name === fontName ? { ...font, activeStyle: newStyle } : font
            )
        );
    };

    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));
    const handleLineSpacingChange = (e) => setLineSpacing(Number(e.target.value));

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

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

    const handleLineFontChange = (lineIndex, fontName) => {
        setLineSettings(prevSettings =>
            prevSettings.map((line, index) => {
                if (index !== lineIndex) return line;
                return normalizeLineSelection({
                    ...line,
                    fontName,
                    styleKey: getDefaultStyleKey(fontName),
                });
            })
        );
    };

    const handleLineStyleChange = (lineIndex, styleKey) => {
        setLineSettings(prevSettings =>
            prevSettings.map((line, index) =>
                index === lineIndex ? { ...line, styleKey } : line
            )
        );
    };

    const handleInsertToMain = () => {
        if (!hebrewPaletteText) return;
        handleGlyphInsert(hebrewPaletteText);
        setHebrewPaletteText('');
        setLastHebrewBaseChar('א'); // Reset on close
        setShowHebrewPalette(false);
    };

    const handleHebrewBackspace = () => {
        if (hebrewPaletteText.length === 0) return;

        const segmenter = new Intl.Segmenter('he', { granularity: 'grapheme' });
        const graphemes = Array.from(segmenter.segment(hebrewPaletteText)).map(s => s.segment);

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
            showMessage('Please create a monogram, or select at least one font and enter some text to submit.');
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

        const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
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
                const textColor = (frameStyle === 'solid' || frameStyle === 'double') ? 'white' : 'black';
                const baseFontSize = (data.fontSize || 100) * 1.5;
                const finalFontSize = baseFontSize * 0.9875;

                let frameSvg = '';
                if (frameStyle === 'solid') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />`;
                } else if (frameStyle === 'double') {
                    frameSvg = `<g>
                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />
                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="59" fill="none" stroke="white" stroke-width="3" />
                    </g>`;
                } else if (frameStyle === 'dotted') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="4" stroke-dasharray="10 10" />`;
                } else if (frameStyle === 'outline') {
                    frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="2" />`;
                } else if (frameStyle === 'thick-thin') {
                    frameSvg = `<g>
                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="65" fill="none" stroke="black" stroke-width="5" />
                        <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="57" fill="none" stroke="black" stroke-width="2" />
                    </g>`;
                }

                svgElements += frameSvg;

                if (mode === 'curves') {
                    const letterConfigs = [
                        { char: first, fontFamily: 'LeftCircleMonogram', yOffset: 0 },
                        { char: middle, fontFamily: 'MiddleCircleMonogram', yOffset: -(finalFontSize * 0.02) },
                        { char: last, fontFamily: 'RightCircleMonogram', yOffset: 0 },
                    ];
                    const measuredWidths = await Promise.all(letterConfigs.map(async ({ char, fontFamily }) => {
                        const font = await loadCurveFont(fontFamily);
                        return font ? font.getAdvanceWidth(char, finalFontSize, { kerning: true }) : finalFontSize * 0.7;
                    }));

                    let currentX = svgCenterX - (measuredWidths.reduce((sum, width) => sum + width, 0) / 2);
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
                    const textSvg = `<text x="${svgCenterX}" y="${monogramBlockY}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" style="font-size: ${finalFontSize}px;">
                    <tspan font-family="LeftCircleMonogram">${escapeXml(first)}</tspan>
                    <tspan font-family="MiddleCircleMonogram" dy="-0.02em">${escapeXml(middle)}</tspan>
                    <tspan font-family="RightCircleMonogram">${escapeXml(last)}</tspan>
                </text>`;
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
                    svgElements += `<g dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" fill="#181717">
                    <text x="${leftX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(first)}</text>
                    <text x="${middleX}" y="${monogramBlockY}" font-size="${middleSize}px">${escapeXml(middle)}</text>
                    <text x="${rightX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(last)}</text>
                </g>`;
                }
                y = monogramBlockY + middleSize / 2;
            }
        }

        let contentY = y + 40;
        if (hasStandardSelection) {
            const artworkStartY = contentY;
            let artworkY = artworkStartY;

            for (const [index, line] of populatedPreviewLines.entries()) {
                const font = getFontOptionByName(line.fontName);
                const activeFontFamily = font?.styles[line.styleKey] || font?.styles[getDefaultStyleKey(font?.name)] || 'inherit';
                const exportFontFamily = exportFontFamilyMap[activeFontFamily] || activeFontFamily;
                const styleName = line.styleKey
                    ? line.styleKey.charAt(0).toUpperCase() + line.styleKey.slice(1)
                    : 'No Style';

                artworkY += (fontSize * lineSpacing);
                svgElements += await buildArtworkTextElement({
                    mode,
                    text: line.text,
                    x: aligned.x,
                    y: artworkY,
                    fontFamily: activeFontFamily,
                    exportFontFamily,
                    fontSize,
                    fill: '#181717',
                    anchor: aligned.anchor,
                    escapeXml,
                });
                metadataElements += `<text x="${padding}" y="${labelFontSize + 10 + (index * labelFontSize * 1.5)}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Line ${index + 1}: ${escapeXml(font?.name || 'No Font')} (${escapeXml(styleName)})</text>\n`;
            }

            contentY = artworkY;
        }

        if (customerNotes.trim() !== '') {
            contentY += (fontSize * 1.4);
            svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Customer Notes</text>\n`;
            contentY += labelFontSize * 0.5;

            const noteLines = customerNotes.split('\n').filter(line => line.trim() !== '');
            noteLines.forEach(noteLine => {
                const sanitizedNoteLine = escapeXml(noteLine);
                contentY += labelFontSize * 1.4;
                svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#181717">${sanitizedNoteLine}</text>\n`;
            });
        }

        let metadataBlock = '';
        let metadataHeight = 0;

        if (metadataElements !== '') {
            metadataHeight = (populatedPreviewLines.length * labelFontSize * 1.5) + padding;
            const metadataBlockY = contentY + padding + labelFontSize;
            metadataBlock = `<g transform="translate(0, ${metadataBlockY})">
                <text x="${padding}" y="0" font-family="Arial" font-size="${labelFontSize}" fill="#94a3b8" font-weight="700">Font Reference</text>
                ${metadataElements}
            </g>\n`;
        }

        const svgHeight = contentY + padding + metadataHeight + (metadataElements !== '' ? labelFontSize * 2 : 0);
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
            body: svgContent
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
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_');
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
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            <aside className="bg-[rgb(50,75,106)] text-white w-full lg:w-[400px] p-4 flex-shrink-0 flex flex-col shadow-xl lg:rounded-r-3xl lg:justify-start">
                <div className="flex-shrink-0 pt-4 lg:pt-8">
                    <img
                        src="/images/Arch Vector Logo White.svg"
                        alt="Arch Font Hub Logo"
                        className="object-contain drop-shadow-lg h-48 w-48 mx-auto lg:h-auto lg:w-[350px]"
                    />
                </div>
                <div className="flex-grow flex items-center justify-center lg:flex-grow-0 lg:items-start lg:mt-4">
                    <p className="text-center lg:text-left text-slate-200 text-xs lg:text-base lg:max-w-sm px-2">
                        Let's find your perfect font! Select a few options, preview them with your text, and submit your favorites. Our designers will use your selection to craft your proof. If you have another font in mind, let us know in the notes section below!
                    </p>
                </div>
            </aside>

            <main className="flex-1 p-4 sm:p-8 lg:p-12">
                {isSubmissionComplete && (
                    <div className="fixed inset-0 bg-slate-100 bg-opacity-95 flex items-center justify-center z-30">
                        <div className="text-center p-8">
                            <h2 className="text-4xl font-bold text-slate-700" style={{ fontFamily: 'Alumni Sans Regular' }}>
                                Submission Complete
                            </h2>
                            <p className="text-xl text-slate-600 mt-4">
                                Thank you for your submission! You may now close this window.
                            </p>
                        </div>
                    </div>
                )}
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-10">
                        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Font Selection</h2>
                            <p className="text-slate-500 mb-6">
                                Select up to 3 fonts you would like to preview. You may change your selected fonts here at any time. Try as many as you'd like before submitting your selection!
                                <br />
                                <br />
                                Looking for Bold, Italic or other versions of a selected font? Check the live preview for available styles!
                            </p>
                            <div className="space-y-6">
                                {Object.entries(fontLibrary).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="text-md font-semibold text-slate-700 border-b-2 border-slate-200 pb-2 mb-3 tracking-wide">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {fonts.map((font) => {
                                                const isScriptFont = scriptFontsToAdjust.includes(font.name);
                                                let fontSizeClass = isScriptFont ? 'text-2xl' : 'text-lg';
                                                if (font.name === 'Concerto Pro') fontSizeClass = 'text-4xl';
                                                return (
                                                    <button
                                                        key={font.name}
                                                        onClick={() => handleFontSelect(font)}
                                                        className={`px-5 py-3 rounded-xl font-semibold border-2 transition-all duration-150 transform hover:scale-105 focus:outline-none ${fontSizeClass} ${selectedFonts.some(f => f.name === font.name) ? 'bg-[rgb(50,75,106)] text-white border-[rgb(50,75,106)] shadow-md' : 'bg-white text-[rgb(50,75,106)] border-[rgb(50,75,106)] hover:bg-[rgb(50,75,106)]/10'}`}
                                                        style={{
                                                            fontFamily: font.name === 'Alumni Sans'
                                                                ? 'Alumni Sans Regular'
                                                                : font.styles[Object.keys(font.styles)[0]]
                                                        }}
                                                    >
                                                        {font.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="flex justify-end mt-4">
                            <button
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow"
                                onClick={() => setShowMonogramMaker(true)}
                                type="button"
                            >
                                Open Monogram Maker
                            </button>
                        </div>

                        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Custom Text</h2>
                                    <p className="text-slate-500 mt-1">Type a sample of your order text to preview. You'll see this displayed in your font choices below.
                                        <br />
                                        Be sure to test out any special characters your order may have!</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                                    <button onClick={() => setShowHebrewPalette(true)} className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base">Hebrew</button>
                                    <button onClick={() => setShowAccentPalette(true)} className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base">Accented Characters</button>
                                    <button onClick={() => setShowGlyphPalette(true)} className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base">Symbols</button>
                                </div>
                            </div>
                            <textarea
                                ref={customTextRef}
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                                dir="auto"
                                className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[160px] text-xl"
                            />
                        </section>

                        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Live Preview</h2>
                                    <p className="text-slate-500 mt-1">
                                        Here's your text preview. When you're happy with your selection hit the button below!
                                        If you don't like a font feel free to deselect it above and try a new one out!
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">Size</label>
                                    <input
                                        id="fontSizeSlider"
                                        type="range"
                                        min="36"
                                        max="100"
                                        step="1"
                                        value={fontSize}
                                        onChange={handleFontSizeChange}
                                        className="w-32 lg:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-slate-600 w-12 text-left">{fontSize}px</span>

                                    <label htmlFor="lineSpacingSlider" className="text-sm font-medium text-slate-600">Line Spacing</label>
                                    <input
                                        id="lineSpacingSlider"
                                        type="range"
                                        min="1"
                                        max="2"
                                        step="0.1"
                                        value={lineSpacing}
                                        onChange={handleLineSpacingChange}
                                        className="w-32 lg:w-40 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-slate-600 w-12 text-left">{lineSpacing.toFixed(1)}x</span>

                                    {/* Alignment icons (inline row) */}
                                    <div className="ml-2 inline-flex rounded-lg border border-slate-300 overflow-hidden">
                                        {(['left', 'center', 'right']).map((a) => (
                                            <button
                                                key={a}
                                                type="button"
                                                onClick={() => setTextAlign(a)}
                                                className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center ${textAlign === a
                                                    ? 'bg-slate-700 text-white'
                                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                title={`Align ${a}`}
                                                aria-label={`Align ${a}`}
                                            >
                                                <AlignIcon align={a} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-6 rounded-xl min-h-[150px] space-y-10 border border-slate-100">
                                {monogramInfo && (
                                    <div className="mb-10 p-6 border border-blue-200 rounded-xl bg-blue-50 shadow flex justify-center items-center h-[200px]">
                                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }} />
                                    </div>
                                )}

                                {hebrewRegex.test(combinedText) && (
                                    <div className="p-4 mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Please check each preview carefully as Hebrew character support can vary between fonts.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hasStandardSelection ? (() => {
                                    const activePreviewLine = previewLines.find(line => line.lineIndex === openPreviewLineIndex) || previewLines[0];
                                    const activeFont = activePreviewLine ? getFontOptionByName(activePreviewLine.fontName) : null;
                                    const activeStyleKeys = activeFont ? getSortedStyleKeys(activeFont.styles) : [];

                                    return (
                                        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-6">
                                            <div ref={previewCanvasRef} className="space-y-1">
                                                {previewLines.map((line, index) => {
                                                    const font = getFontOptionByName(line.fontName);
                                                    const activeFontFamily = font?.styles[line.styleKey] || font?.styles[getDefaultStyleKey(line.fontName)] || 'inherit';
                                                    const isControlsOpen = openPreviewLineIndex === line.lineIndex;

                                                    return (
                                                        <div
                                                            key={`preview-line-${line.lineIndex}`}
                                                            className="group relative"
                                                            ref={(node) => {
                                                                if (node) {
                                                                    previewLineRefs.current[line.lineIndex] = node;
                                                                } else {
                                                                    delete previewLineRefs.current[line.lineIndex];
                                                                }
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenPreviewLineIndex(line.lineIndex)}
                                                                className="block w-full px-0 py-2 text-left"
                                                                aria-label={`Edit line ${index + 1}`}
                                                                aria-pressed={isControlsOpen}
                                                            >
                                                                <div className="relative flex items-start gap-3">
                                                                    <span
                                                                        className={`mt-[0.8em] h-3 w-3 flex-shrink-0 rounded-full border transition-all duration-200 ${isControlsOpen
                                                                            ? 'border-blue-300 bg-white shadow-[0_0_0_4px_rgba(191,219,254,0.7)]'
                                                                            : 'border-transparent bg-transparent group-hover:border-slate-300/70'
                                                                            }`}
                                                                        aria-hidden="true"
                                                                    />
                                                                    {isControlsOpen && (
                                                                        <span
                                                                            className="pointer-events-none absolute inset-x-4 -inset-y-1 rounded-[1.5rem] bg-[radial-gradient(circle_at_left_center,rgba(191,219,254,0.5),rgba(191,219,254,0.12)_40%,transparent_72%)]"
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}
                                                                    <p
                                                                        className={`relative min-w-0 flex-1 break-words text-slate-800 transition-colors ${isControlsOpen ? 'text-slate-900' : ''}`}
                                                                        style={{
                                                                            width: '100%',
                                                                            maxWidth: '100%',
                                                                            fontFamily: activeFontFamily,
                                                                            fontSize: `${fontSize}px`,
                                                                            lineHeight: lineSpacing,
                                                                            textAlign: textAlign,
                                                                        }}
                                                                        dir="auto"
                                                                    >
                                                                        {line.text || '\u00A0'}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {activePreviewLine && (
                                                <div className="mt-4 lg:relative lg:mt-0">
                                                    <div
                                                        className="flex items-center gap-2 rounded-2xl bg-white/88 p-2 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 backdrop-blur-sm lg:absolute lg:left-0 lg:w-full lg:-translate-y-1/2 lg:flex-col lg:items-stretch"
                                                        style={activeControlOffset > 0 ? { top: `${activeControlOffset}px` } : undefined}
                                                    >
                                                        <select
                                                            value={activePreviewLine.fontName}
                                                            onChange={(e) => handleLineFontChange(activePreviewLine.lineIndex, e.target.value)}
                                                            disabled={selectedFonts.length === 0}
                                                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-500"
                                                        >
                                                            {selectedFonts.length === 0 ? (
                                                                <option value="">Select fonts above first</option>
                                                            ) : (
                                                                selectedFonts.map(selectedFont => (
                                                                    <option key={selectedFont.name} value={selectedFont.name}>{selectedFont.name}</option>
                                                                ))
                                                            )}
                                                        </select>
                                                        <select
                                                            value={activePreviewLine.styleKey}
                                                            onChange={(e) => handleLineStyleChange(activePreviewLine.lineIndex, e.target.value)}
                                                            disabled={!activeFont}
                                                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-500"
                                                        >
                                                            {!activeFont ? (
                                                                <option value="">No styles available</option>
                                                            ) : (
                                                                activeStyleKeys.map(styleKey => (
                                                                    <option key={styleKey} value={styleKey}>
                                                                        {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    !monogramInfo && <div className="flex items-center justify-center h-full"><p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p></div>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Notes for Designer</h2>
                            <p className="text-slate-500 mb-6">
                                Have a specific font in mind not listed above? Or any other special requests? Let us know here!
                            </p>
                            <textarea
                                className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-xl"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                placeholder="e.g., Please use the font 'Gotham' if available. Also, make the first line larger than the second..."
                            />
                        </section>
                    </div>

                    <div className="mt-10">
                        <button
                            onClick={handleSubmitClick}
                            className="w-full px-10 py-4 bg-blue-600 text-white text-xl rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || (!monogramInfo && !hasStandardSelection)}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Selection'}
                        </button>
                    </div>
                </div>
            </main>

            {(showCustomerModal || showMessageBox || showGlyphPalette || showAccentPalette || showHebrewPalette || showSuccessModal) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl animate-jump-in">

                        {showSuccessModal && (
                            <SuccessModal onClose={() => setShowSuccessModal(false)} />
                        )}

                        {showHebrewPalette && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-slate-900">Hebrew Keyboard</h3>
                                <p className="text-slate-600 pb-2">
                                    Please use the virtual keyboard below to compose your Hebrew text. When finished, click the 'Insert Text' button. Your text will be added to the main input area, allowing you to preview it in your chosen fonts.
                                </p>
                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-700">Preview</label>
                                        <button onClick={() => { setHebrewPaletteText(''); setLastHebrewBaseChar('א'); }} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-semibold">Clear</button>
                                    </div>
                                    <textarea
                                        readOnly
                                        className="w-full p-3 border-2 border-slate-200 rounded-xl shadow-inner bg-slate-50 min-h-[100px] text-2xl cursor-default"
                                        value={hebrewPaletteText}
                                        dir="rtl"
                                        style={{ fontFamily: 'Noto Rashi Hebrew Regular' }}
                                    />
                                </div>
                                <div className="p-3 bg-slate-200 rounded-xl space-y-2 select-none">
                                    {hebrewKeyboardLayout.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex justify-center gap-1.5">
                                            {row.map((key, keyIndex) => {
                                                const char = typeof key === 'object' ? (isShifted ? key.shifted : key.unshifted) : key;
                                                return (
                                                    <button
                                                        key={keyIndex}
                                                        onClick={() => {
                                                            setHebrewPaletteText(prev => prev + char);
                                                            if (!isShifted && hebrewCharacters.includes(char)) {
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
                                        <button onClick={() => setIsShifted(prev => !prev)} className={`h-12 w-24 flex items-center justify-center rounded-lg text-slate-800 text-lg font-semibold shadow-sm transition-colors ${isShifted ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}>
                                            Shift
                                        </button>
                                        <button onClick={() => setHebrewPaletteText(prev => prev + ' ')} className="h-12 flex-1 flex items-center justify-center rounded-lg bg-white hover:bg-blue-100 text-slate-800 text-xl font-semibold shadow-sm transition-colors">
                                            Space
                                        </button>
                                        <button onClick={handleHebrewBackspace} className="h-12 w-24 flex items-center justify-center rounded-lg bg-white hover:bg-blue-100 text-slate-800 text-lg font-semibold shadow-sm transition-colors">
                                            Backspace
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0" onClick={() => { setShowHebrewPalette(false); setIsShifted(false); setHebrewPaletteText(''); setLastHebrewBaseChar('א'); }}>Close</button>
                                    <button type="button" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-sm text-base flex-shrink-0" onClick={handleInsertToMain}>Insert Text</button>
                                </div>
                            </div>
                        )}

                        {showAccentPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Accented Character Palette</h3>
                                <div className="space-y-4 bg-slate-50 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                                    {Object.entries(accentedCharacters).map(([baseLetter, chars]) => (
                                        <div key={baseLetter} className="flex items-start gap-4">
                                            <div className="font-bold text-lg text-slate-600 w-8 text-center pt-2">{baseLetter}</div>
                                            <div className="flex flex-wrap gap-2 flex-1">
                                                {chars.map(char => (
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
                                    <p className="text-sm text-slate-600 pr-4">Note: Character support varies by font. Please confirm the appearance in the live preview.</p>
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0" onClick={() => setShowAccentPalette(false)}>Close</button>
                                </div>
                            </div>
                        )}
                        {showGlyphPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Symbol Palette</h3>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 bg-slate-100 p-4 rounded-lg">
                                    {glyphs.map(glyph => (<button key={glyph} onClick={() => handleGlyphInsert(glyph)} className="flex items-center justify-center h-12 w-full bg-white rounded-lg shadow-sm text-2xl text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors" title={`Insert ${glyph}`}>{glyph}</button>))}
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <p className="text-sm text-slate-600 pr-4">Note: Character support varies by font. Please confirm the appearance in the live preview.</p>
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0" onClick={() => setShowGlyphPalette(false)}>Close</button>
                                </div>
                            </div>
                        )}
                        {showCustomerModal && (
                            <CustomerInfoModal
                                onSubmit={handleCustomerModalSubmit}
                                orderNumber={orderNumber}
                                onOrderNumberChange={e => setOrderNumber(e.target.value)}
                                customerName={customerName}
                                onCustomerNameChange={e => setCustomerName(e.target.value)}
                                customerCompany={customerCompany}
                                onCustomerCompanyChange={e => setCustomerCompany(e.target.value)}
                                isDataPrefilled={isDataPrefilled}
                                isSubmitting={isSubmitting}
                                onCancel={() => setShowCustomerModal(false)}
                            />
                        )}
                        {showMessageBox && (
                            <MessageModal message={message} onClose={() => setShowMessageBox(false)} />
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
