import React, { useState, useRef, useEffect, useMemo } from 'react';
import MonogramMaker from './MonogramMaker';
import CircularMonogram from './CircularMonogram'; // Still needed for font thumbnails

// This component remains outside the main App component for good practice.
const FormInput = ({ label, id, value, onChange, required = false, isOptional = false, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {isOptional && <span className="text-slate-500 text-xs ml-1">(Optional)</span>}
        </label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-base ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'border-slate-300'}`}
        />
    </div>
);

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

    const scriptFontsToAdjust = [
        'Alumni Sans', 'Amatic SC', 'Amazone', 'BlackChancery', 'Clicker Script',
        'Collegiate', 'Concerto Pro', 'Courgette', 'Cowboy Rodeo',
        'Cutive Mono', 'Freebooter Script', 'French Script', 'Great Vibes',
        'Honey Script', 'I Love Glitter', 'Machine BT', 'Monotype Corsiva', 'Murray Hill',
        'Old English', 'Planscribe', 'Rajdhani', 'ITC Zapf Chancery'
    ];

    const fontLibrary = {
        'Sans-serif': [
            {
                name: 'Alumni Sans', styles: {
                    black: 'Alumni Sans Black', bold: 'Alumni Sans Bold', extrabold: 'Alumni Sans ExtraBold',
                    italic: 'Alumni Sans Italic', light: 'Alumni Sans Light', lightItalic: 'Alumni Sans Light Italic',
                    medium: 'Alumni Sans Medium', mediumItalic: 'Alumni Sans Medium Italic', regular: 'Alumni Sans Regular',
                    semibold: 'Alumni Sans SemiBold', semiboldItalic: 'Alumni Sans SemiBold Italic'
                }
            },
            { name: 'Arial', styles: { regular: 'Arial', bold: 'Arial Bold', italic: 'Arial Italic', boldItalic: 'Arial Bold Italic' } },
            { name: 'Bebas Neue', styles: { regular: 'Bebas Neue Regular', bold: 'Bebas Neue Bold' } },
            { name: 'Berlin Sans', styles: { regular: 'Berlin Sans FB', bold: 'Berlin Sans FB Bold' } },
            { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri Bold', italic: 'Calibri Italic' } },
            { name: 'Century Gothic', styles: { regular: 'Century Gothic Paneuropean', bold: 'Century Gothic Paneuropean Bold', boldItalic: 'Century Gothic Paneuropean Bold Italic' } },
            { name: 'Graphik', styles: { regular: 'Graphik', medium: 'Graphik Medium', semibold: 'Graphik Semibold', thin: 'Graphik Thin', regularItalic: 'Graphik Regular Italic', mediumItalic: 'Graphik Medium Italic', thinItalic: 'Graphik Thin Italic' } },
            { name: 'Rajdhani', styles: { regular: 'Rajdhani Regular', light: 'Rajdhani Light', medium: 'Rajdhani Medium', semibold: 'Rajdhani SemiBold', bold: 'Rajdhani Bold' } },
            { name: 'Zapf Humanist', styles: { demi: 'Zapf Humanist 601 Demi BT' } },
        ],
        'Serif': [
            { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'Benguiat Bold BT', bookItalic: 'Benguiat Book Italic BT' } },
            { name: 'Bookman Old Style', styles: { bold: 'Bookman Old Style Bold', italic: 'Bookman Old Style Italic', boldItalic: 'Bookman Old Style Bold Italic' } },
            { name: 'Century Schoolbook', styles: { regular: 'Century Schoolbook', bold: 'Century Schoolbook Bold', boldItalic: 'Century Schoolbook Bold Italic' } },
            { name: 'Copperplate', styles: { regular: 'CopprplGoth BT Roman' } },
            { name: 'Cutive Mono', styles: { regular: 'Cutive Mono Regular' } },
            { name: 'DejaVu Serif', styles: { regular: 'DejaVu Serif', bold: 'DejaVu Serif Bold', italic: 'DejaVu Serif Italic', boldItalic: 'DejaVu Serif Bold Italic', condensed: 'DejaVu Serif Condensed', condensedBold: 'DejaVu Serif Condensed Bold', condensedItalic: 'DejaVu Serif Condensed Italic', condensedBoldItalic: 'DejaVu Serif Condensed Bold Italic' } },
            { name: 'Garamond', styles: { v1: 'Garamond', v2_bold: 'Garamond 3 LT Std Bold', v2_boldItalic: 'Garamond 3 LT Std Bold Italic', v2_italic: 'Garamond 3 LT Std Italic', v2_regular: 'Garamond 3 LT Std' } },
            { name: 'Noto Rashi Hebrew', styles: { regular: 'Noto Rashi Hebrew Regular', thin: 'Noto Rashi Hebrew Thin', extralight: 'Noto Rashi Hebrew ExtraLight', light: 'Noto Rashi Hebrew Light', medium: 'Noto Rashi Hebrew Medium', semibold: 'Noto Rashi Hebrew SemiBold', bold: 'Noto Rashi Hebrew Bold', extrabold: 'Noto Rashi Hebrew ExtraBold', black: 'Noto Rashi Hebrew Black' } },
            { name: 'Times New Roman', styles: { regular: 'Times New Roman', bold: 'Times New Roman Bold', italic: 'Times New Roman Italic', boldItalic: 'Times New Roman Bold Italic' } },
        ],
        'Script': [
            { name: 'Amatic SC', styles: { regular: 'Amatic SC Regular', bold: 'Amatic SC Bold' } },
            { name: 'Amazone', styles: { regular: 'Amazone BT' } },
            { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
            { name: 'Clicker Script', styles: { regular: 'Clicker Script' } },
            { name: 'Concerto Pro', styles: { regular: 'ConcertoPro-Regular' } },
            { name: 'Courgette', styles: { regular: 'Courgette Regular' } },
            { name: 'Freebooter Script', styles: { regular: 'Freebooter Script' } },
            { name: 'French Script', styles: { regular: 'French Script MT' } },
            { name: 'Great Vibes', styles: { regular: 'Great Vibes' } },
            { name: 'Honey Script', styles: { light: 'Honey Script Light', semiBold: 'Honey Script SemiBold' } },
            { name: 'I Love Glitter', styles: { regular: 'I Love Glitter' } },
            { name: 'ITC Zapf Chancery', styles: { regular: 'ITC Zapf Chancery Roman' } },
            { name: 'Murray Hill', styles: { regular: 'Murray Hill Regular' } },
            { name: 'Monotype Corsiva', styles: { regular: 'Monotype Corsiva' } },
        ],
        'Display': [
            { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
            { name: 'Cowboy Rodeo', styles: { regular: 'Cowboy Rodeo W01 Regular' } },
            { name: 'Machine BT', styles: { regular: 'Machine BT' } },
            { name: 'Old English', styles: { regular: 'Old English Text MT' } },
            { name: 'Planscribe', styles: { regular: 'Planscribe NF W01 Regular' } },
        ],
    };

    const styleSortOrder = [
        'thin', 'thinItalic',
        'extralight', 'extralightItalic',
        'light', 'lightItalic',
        'regular', 'italic', 'book', 'bookItalic', 'roman',
        'medium', 'mediumItalic',
        'semibold', 'demi', 'semiboldItalic',
        'bold', 'boldItalic',
        'extrabold', 'extraboldItalic',
        'black', 'blackItalic',
        'outline', 'condensed', 'condensedBold', 'condensedItalic', 'condensedBoldItalic'
    ];

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [fontSize, setFontSize] = useState(36);

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
    const [showNotesModal, setShowNotesModal] = useState(false);
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
    const [lastHebrewBaseChar, setLastHebrewBaseChar] = useState('?');
    const [isShifted, setIsShifted] = useState(false);
    const [openCategories, setOpenCategories] = useState({});
    const textInputRef = useRef(null);

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
        const desktopQuery = window.matchMedia('(min-width: 1024px)');
        const applyScrollLock = (shouldLock) => {
            document.body.style.overflow = shouldLock ? 'hidden' : '';
            document.documentElement.style.overflow = shouldLock ? 'hidden' : '';
        };

        applyScrollLock(desktopQuery.matches);

        const handleQueryChange = (event) => applyScrollLock(event.matches);
        if (desktopQuery.addEventListener) {
            desktopQuery.addEventListener('change', handleQueryChange);
        } else {
            desktopQuery.addListener(handleQueryChange);
        }

        return () => {
            if (desktopQuery.removeEventListener) {
                desktopQuery.removeEventListener('change', handleQueryChange);
            } else {
                desktopQuery.removeListener(handleQueryChange);
            }
            applyScrollLock(false);
        };
    }, []);
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

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleGlyphInsert = (glyph) => {
        const textarea = textInputRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = customText;
        const newText = text.substring(0, start) + glyph + text.substring(end);
        setCustomText(newText);

        textarea.focus();
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + glyph.length;
        }, 0);
    };

    const handleInsertToMain = () => {
        if (!hebrewPaletteText) return;
        handleGlyphInsert(hebrewPaletteText);
        setHebrewPaletteText('');
        setLastHebrewBaseChar('\u05D0'); // Reset on close
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
            setLastHebrewBaseChar('\u05D0');
        } else {
            const hebrewBaseRegex = /[\u05D0-\u05EA]/g;
            const baseCharsInNewText = newText.match(hebrewBaseRegex);
            if (baseCharsInNewText) {
                setLastHebrewBaseChar(baseCharsInNewText[baseCharsInNewText.length - 1]);
            } else {
                setLastHebrewBaseChar('\u05D0');
            }
        }
    };

    const generateSvgContent = () => {
        const hasStandardSelection = selectedFonts.length > 0 && customText.trim() !== '';

        if (!monogramInfo && !hasStandardSelection) {
            showMessage('Please create a monogram, or select at least one font and enter some text to submit.');
            return null;
        }

        const lines = customText.split('\n').filter(line => line.trim() !== '');
        let svgElements = '';
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
                const [first, middle, last] = data.text.map(escapeXml);
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

                const textSvg = `<text x="${svgCenterX}" y="${monogramBlockY}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" style="font-size: ${finalFontSize}px;">
                    <tspan font-family="LeftCircleMonogram">${first}</tspan>
                    <tspan font-family="MiddleCircleMonogram" dy="-0.02em">${middle}</tspan>
                    <tspan font-family="RightCircleMonogram">${last}</tspan>
                </text>`;

                svgElements += frameSvg + textSvg;
                y = monogramBlockY + 100;

            } else {
                const [first, middle, last] = data.text.map(escapeXml);
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

                svgElements += `<g dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" fill="#181717">
                    <text x="${leftX}" y="${monogramBlockY}" font-size="${sideSize}px">${first}</text>
                    <text x="${middleX}" y="${monogramBlockY}" font-size="${middleSize}px">${middle}</text>
                    <text x="${rightX}" y="${monogramBlockY}" font-size="${sideSize}px">${last}</text>
                </g>`;
                y = monogramBlockY + middleSize / 2;
            }
        }

        let contentY = y + 40;
        if (hasStandardSelection && lines.length > 0) {
            selectedFonts.forEach((font, fontIndex) => {
                const activeFontFamily = font.styles[font.activeStyle];
                const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);

                contentY += labelFontSize + 10;
                svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">${font.name} (${styleName})</text>\n`;
                contentY += (fontSize * 1.4) * 0.5;

                lines.forEach((line) => {
                    const sanitizedLine = escapeXml(line);
                    contentY += (fontSize * 1.4);
                    svgElements += `<text x="${aligned.x}" y="${contentY}" text-anchor="${aligned.anchor}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#181717">${sanitizedLine}</text>\n`;
                });

                if (fontIndex < selectedFonts.length - 1) {
                    contentY += (fontSize * 1.4) * 0.75;
                }
            });
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

        const svgHeight = contentY + padding;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgElements}</svg>`;
    };

    const handleSubmitClick = () => {
        const svgContent = generateSvgContent();
        if (!svgContent) return;

        setPendingSvgContent(svgContent);

        if (isDataPrefilled) {
            handleFinalSubmit(svgContent);
        } else {
            setShowCustomerModal(true);
        }
    };

    const handleFinalSubmit = async (svgContent) => {
        if (!orderNumber.trim() || !customerName.trim()) {
            showMessage('Order Number and Customer Name are required.');
            return;
        }

        setIsSubmitting(true);
        setShowCustomerModal(false);
        const filename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_') + '.svg';

        try {
            const response = await fetch(`${WORKER_URL}/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: svgContent
            });

            if (response.status === 409) {
                throw new Error('A submission for this order already exists.');
            }
            if (!response.ok) {
                throw new Error(await response.text());
            }
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

    const glyphs = ['\u00A9', '\u00AE', '\u2122', '&', '#', '+', '\u2013', '\u2014', '\u2026', '\u2022', '\u00B0', '\u00B7', '\u2665', '\u2661', '\u2666', '\u2662', '\u2663', '\u2667', '\u2660', '\u2664', '\u2605', '\u2606', '\u266A', '\u266B', '\u2190', '\u2192', '\u2191', '\u2193', '\u221E', '\u2020', '\u2721\uFE0E', '\u271E', '\u2720', '\u00B1', '\u00BD', '\u00BC', '\u0391', '\u0392', '\u0393', '\u0394', '\u0395', '\u0396', '\u0397', '\u0398', '\u0399', '\u039A', '\u039B', '\u039C', '\u039D', '\u039E', '\u039F', '\u03A0', '\u03A1', '\u03A3', '\u03A4', '\u03A5', '\u03A6', '\u03A7', '\u03A8', '\u03A9'];
    const accentedCharacters = {
        'A': ['À', 'à', 'Á', 'á', 'Â', 'â', 'Ã', 'ã', 'Ä', 'ä', 'Å', 'å', 'Æ', 'æ'], 'C': ['Ç', 'ç'],
        'E': ['È', 'è', 'É', 'é', 'Ê', 'ê', 'Ë', 'ë'], 'I': ['Ì', 'ì', 'Í', 'í', 'Î', 'î', 'Ï', 'ï'],
        'N': ['Ñ', 'ñ'], 'O': ['Ò', 'ò', 'Ó', 'ó', 'Ô', 'ô', 'Õ', 'õ', 'Ö', 'ö', 'Ø', 'ø', 'Œ', 'œ'],
        'S': ['Š', 'š', 'ß'], 'U': ['Ù', 'ù', 'Ú', 'ú', 'Û', 'û', 'Ü', 'ü'],
        'Y': ['Ý', 'ý', 'Ÿ', 'ÿ'], 'Z': ['Ž', 'ž']
    };

    const hebrewCharacters = ['\u05D0', '\u05D1', '\u05D2', '\u05D3', '\u05D4', '\u05D5', '\u05D6', '\u05D7', '\u05D8', '\u05D9', '\u05DB', '\u05DA', '\u05DC', '\u05DE', '\u05DD', '\u05E0', '\u05DF', '\u05E1', '\u05E2', '\u05E4', '\u05E3', '\u05E6', '\u05E5', '\u05E7', '\u05E8', '\u05E9', '\u05EA'];

    const hebrewKeyboardLayout = [
        [
            { unshifted: '`', shifted: '~' },
            { unshifted: '1', shifted: '\u05B0', name: 'Shva' },
            { unshifted: '2', shifted: '\u05B7', name: 'Patah' },
            { unshifted: '3', shifted: '\u05B8', name: 'Qamats' },
            { unshifted: '4', shifted: '\u05B6', name: 'Segol' },
            { unshifted: '5', shifted: '\u05B5', name: 'Tsere' },
            { unshifted: '6', shifted: '\u05B4', name: 'Hiriq' },
            { unshifted: '7', shifted: '\u05B9', name: 'Holam' },
            { unshifted: '8', shifted: '\u05BC', name: 'Dagesh' },
            { unshifted: '9', shifted: '\u05BB', name: 'Qubuts' },
            { unshifted: '0', shifted: '\u05BF', name: 'Rafe' },
            { unshifted: '-', shifted: '\u05C1', name: 'Shin Dot' },
            { unshifted: '=', shifted: '\u05C2', name: 'Sin Dot' },
        ],
        ['/', "'", '\u05E7', '\u05E8', '\u05D0', '\u05D8', '\u05D5', '\u05DF', '\u05DD', '\u05E4', '[', ']'],
        ['\u05E9', '\u05D3', '\u05D2', '\u05DB', '\u05E2', '\u05D9', '\u05D7', '\u05DC', '\u05DA', '\u05E3', ','],
        ['\u05D6', '\u05E1', '\u05D1', '\u05D4', '\u05E0', '\u05DE', '\u05E6', '\u05EA', '\u05E5', '.']
    ];
    const hebrewRegex = /[\u0590-\u05FF]/;
    const categoryEntries = useMemo(() => Object.entries(fontLibrary), []);

    useEffect(() => {
        if (Object.keys(openCategories).length > 0) return;
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        const initialState = Object.fromEntries(
            categoryEntries.map(([category]) => [category, isDesktop])
        );
        setOpenCategories(initialState);
    }, [categoryEntries, openCategories]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-slate-100 font-sans lg:overflow-hidden">
            <aside className="bg-[rgb(50,75,106)] text-white w-full lg:w-[560px] p-3 lg:p-2 flex-shrink-0 flex flex-col shadow-xl lg:rounded-r-3xl lg:h-screen lg:overflow-hidden">
                <section className="bg-white rounded-2xl p-2.5 lg:p-2 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)] text-slate-900 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-0.5 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Font Selection</h2>
                    <p className="text-slate-500 mb-1 text-xs lg:text-[11px] leading-tight">
                        Select up to 3 fonts, then compare styles in the live preview.
                    </p>
                    <div className="space-y-1 mt-1 flex-1 min-h-0 overflow-y-auto pr-0.5">
                        {categoryEntries.map(([category, fonts]) => {
                            const isOpen = !!openCategories[category];
                            return (
                                <div key={category}>
                                    <div className="hidden lg:flex items-center justify-between pb-1">
                                        <span className="text-sm font-semibold text-slate-700">{category}</span>
                                        <span className="text-[10px] text-slate-500">{fonts.length}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                        className="lg:hidden w-full flex items-center justify-between px-2 py-1.5 text-left text-sm font-semibold text-slate-700 rounded-md border border-slate-200 bg-slate-50"
                                    >
                                        <span>{category}</span>
                                        <span className="text-xs text-slate-500">{isOpen ? 'Hide' : `${fonts.length} fonts`}</span>
                                    </button>
                                    <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-0.5 ${!isOpen ? 'hidden lg:grid' : ''}`}>
                                        {fonts.map((font) => {
                                            return (
                                                <button
                                                    key={font.name}
                                                    onClick={() => handleFontSelect(font)}
                                                    className={`w-full px-2 py-2 rounded-md font-semibold border transition-colors duration-150 focus:outline-none text-center whitespace-normal break-words leading-tight text-sm lg:text-[14px] min-h-[3.2rem] flex items-center justify-center ${selectedFonts.some(f => f.name === font.name) ? 'bg-[rgb(50,75,106)] text-white border-[rgb(50,75,106)] shadow-sm' : 'bg-white text-[rgb(50,75,106)] border-[rgb(50,75,106)] hover:bg-[rgb(50,75,106)]/10'}`}
                                                    style={{
                                                        fontFamily: font.name === 'Alumni Sans'
                                                            ? 'Alumni Sans Regular'
                                                            : font.styles[Object.keys(font.styles)[0]]
                                                    }}
                                                >
                                                    <span className="inline-block [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                                                        {font.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </aside>

            <main className="flex-1 p-4 sm:p-6 lg:p-6 lg:h-screen lg:overflow-hidden">
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
                <div className="max-w-7xl mx-auto h-full flex flex-col gap-4 lg:min-h-0">
                    <section className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)] shrink-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-3">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Custom Text</h2>
                                <p className="text-slate-500 mt-1 text-sm">
                                    Type a sample of your order text to preview. Be sure to test out any special characters your order may have!
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                                <button onClick={() => setShowHebrewPalette(true)} className="px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors text-sm">Hebrew</button>
                                <button onClick={() => setShowAccentPalette(true)} className="px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors text-sm">Accented</button>
                                <button onClick={() => setShowGlyphPalette(true)} className="px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold transition-colors text-sm">Symbols</button>
                            </div>
                        </div>
                        <textarea ref={textInputRef} className="w-full p-4 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[110px] lg:min-h-[90px] text-lg lg:text-xl" value={customText} onChange={handleTextChange} placeholder={DEFAULT_TEXT_PLACEHOLDER} dir="auto" />
                        <div className="flex justify-end mt-3">
                            <button
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow text-sm lg:text-base"
                                onClick={() => setShowMonogramMaker(true)}
                                type="button"
                            >
                                Open Monogram Maker
                            </button>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)] flex-1 min-h-0 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4 gap-3 shrink-0">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Live Preview</h2>
                                <p className="text-slate-500 mt-1 text-sm">
                                    Review your selected fonts and styles below.
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
                                    className="w-28 lg:w-44 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-sm font-medium text-slate-600 w-12 text-left">{fontSize}px</span>
                                <div className="ml-1 inline-flex rounded-lg border border-slate-300 overflow-hidden">
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

                        <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-4 rounded-xl border border-slate-100 flex-1 min-h-0 overflow-y-auto space-y-6">
                            {monogramInfo && (
                                <div className="mb-6 p-5 border border-blue-200 rounded-xl bg-blue-50 shadow flex justify-center items-center h-[200px]">
                                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: monogramInfo.htmlString }} />
                                </div>
                            )}

                            {hebrewRegex.test(customText) && (
                                <div className="p-4 mb-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
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

                            {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                selectedFonts.map((font) => {
                                    const activeFontFamily = font.styles[font.activeStyle];
                                    return (
                                        <div key={`preview-${font.name}`} className="relative flex flex-col items-start gap-3">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                                <span
                                                    className="bg-[rgb(50,75,106)] text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm z-10"
                                                    style={{ fontFamily: 'Arial' }}
                                                >
                                                    {font.name}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.keys(font.styles)
                                                        .sort((a, b) => {
                                                            const indexA = styleSortOrder.indexOf(a.toLowerCase());
                                                            const indexB = styleSortOrder.indexOf(b.toLowerCase());
                                                            if (indexA === -1) return 1;
                                                            if (indexB === -1) return -1;
                                                            return indexA - indexB;
                                                        })
                                                        .map(styleKey => (
                                                            <button
                                                                key={styleKey}
                                                                onClick={() => handleStyleChange(font.name, styleKey)}
                                                                className={`px-3 py-1.5 text-sm rounded-md border-2 transition-colors ${font.activeStyle === styleKey
                                                                    ? 'bg-slate-700 text-white border-slate-700'
                                                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                            <p
                                                className="text-slate-800 break-words whitespace-pre-wrap w-full"
                                                style={{
                                                    fontFamily: activeFontFamily,
                                                    fontSize: `${fontSize}px`,
                                                    lineHeight: 1.4,
                                                    textAlign: textAlign,
                                                }}
                                                dir="auto"
                                            >
                                                {customText}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                !monogramInfo && <div className="flex items-center justify-center h-full"><p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p></div>
                            )}
                        </div>
                    </section>

                    <div className="shrink-0 pt-2 lg:pt-1">
                        <div className="bg-slate-100/95 backdrop-blur rounded-xl p-2 lg:p-3 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <button
                                onClick={() => setShowNotesModal(true)}
                                type="button"
                                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-sm"
                            >
                                Edit Notes for Designer
                            </button>
                            <button
                                onClick={handleSubmitClick}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white text-lg rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting || (!monogramInfo && (selectedFonts.length === 0 || customText.trim() === ''))}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Selection'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {(showCustomerModal || showMessageBox || showGlyphPalette || showAccentPalette || showHebrewPalette || showSuccessModal || showNotesModal) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl animate-jump-in">

                        {showSuccessModal && (
                            <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                                <img src="/images/Arch Vector Logo.svg" alt="Arch Engraving Logo" className="h-95 w-95 mb-6" />
                                <h3 className="text-3xl font-bold text-slate-800 mb-2">Submission Successful!</h3>
                                <p className="text-lg text-slate-600 mb-8">We Appreciate Your Business!</p>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-12 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base"
                                >
                                    Done
                                </button>
                            </div>
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
                                        <button onClick={() => { setHebrewPaletteText(''); setLastHebrewBaseChar('\u05D0'); }} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-semibold">Clear</button>
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
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base flex-shrink-0" onClick={() => { setShowHebrewPalette(false); setIsShifted(false); setHebrewPaletteText(''); setLastHebrewBaseChar('\u05D0'); }}>Close</button>
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
                        {showNotesModal && (
                            <div className="space-y-5 max-w-3xl mx-auto">
                                <h3 className="text-2xl font-bold text-slate-900">Notes for Designer</h3>
                                <p className="text-slate-500">
                                    Have a specific font in mind not listed above? Or any other special requests? Let us know here!
                                </p>
                                <textarea
                                    className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[180px] text-lg"
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder="e.g., Please use the font 'Gotham' if available. Also, make the first line larger than the second..."
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base"
                                        onClick={() => setShowNotesModal(false)}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                        {showCustomerModal && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-8">
                                <h3 className="text-2xl font-bold text-slate-900">Enter Customer Information to Save</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required disabled={isDataPrefilled || isSubmitting} />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required disabled={isDataPrefilled || isSubmitting} />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional disabled={isDataPrefilled || isSubmitting} />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base" onClick={() => setShowCustomerModal(false)} disabled={isSubmitting}>Cancel</button>
                                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base disabled:opacity-75 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit & Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                        {showMessageBox && (
                            <div className="text-center">
                                <p className="text-slate-800 text-lg mb-8">{message}</p>
                                <button onClick={() => setShowMessageBox(false)} className="px-12 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base">OK</button>
                            </div>
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






