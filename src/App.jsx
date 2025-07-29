import React, { useState, useRef, useEffect } from 'react';
import MonogramMaker from './MonogramMaker';

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
    // --- Monogram modal and data ---
    const [showMonogramMaker, setShowMonogramMaker] = useState(false);
    const [monogramData, setMonogramData] = useState(null);

    // State for the Hebrew palette
    const [hebrewPaletteText, setHebrewPaletteText] = useState('');
    const [lastHebrewBaseChar, setLastHebrewBaseChar] = useState('א');
    const [isShifted, setIsShifted] = useState(false);


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

    const handleFontSelect = (font) => {
        const isSelected = selectedFonts.some(f => f.name === font.name);
        if (isSelected) {
            // Always allow deselecting
            setSelectedFonts(prev => prev.filter(f => f.name !== font.name));
        } else {
            // Only allow selecting if the current selection is less than 3
            if (selectedFonts.length < 3) {
                const defaultStyleKey = Object.keys(font.styles)[0];
                setSelectedFonts(prev => [...prev, { ...font, activeStyle: defaultStyleKey }]);
            } else {
                // Show a message if the user tries to select a fourth font
                showMessage('You may select a maximum of 3 fonts. Please deselect a font to choose a new one.');
            }
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

    const generateSvgContent = () => {
        const hasStandardSelection = selectedFonts.length > 0 && customText.trim() !== '';

        if (!monogramData && !hasStandardSelection) {
            showMessage('Please create a monogram, or select at least one font and enter some text to submit.');
            return null;
        }

        const lines = customText.split('\n').filter(line => line.trim() !== '');
        let svgTextElements = '';
        const lineHeight = fontSize * 1.4;
        const labelFontSize = 16;
        const padding = 20;
        const svgWidth = 800;
        let y = padding;

        if (monogramData) {
            const monogramFontFamily = monogramData.font.styles[monogramData.style];
            const monogramStyleName = monogramData.style.charAt(0).toUpperCase() + monogramData.style.slice(1);
            const monogramFontSize = monogramData.fontSize || 150;
            const largeMonogramFontSize = monogramFontSize * 1.5;

            y += labelFontSize + 10;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Monogram: ${monogramData.font.name} (${monogramStyleName})</text>\n`;

            y += largeMonogramFontSize * 1.2;

            const centerX = svgWidth / 2;
            const baselineY = y;
            const sideLetterOffset = (largeMonogramFontSize * 0.3) + (monogramFontSize * 0.3);

            // --- Vertical Centering Fix for CorelDRAW ---
            // Manually calculate a vertical offset for the smaller letters to ensure they appear centered.
            // This is a robust solution for vector editors that ignore the 'dominant-baseline' attribute.
            // The calculation is a font-size-based heuristic to approximate the visual center.
            const yOffset = monogramFontSize * 0.175;

            svgTextElements += `\n`;

            // Left Initial (Small, shifted up)
            svgTextElements += `<text
                x="${centerX - sideLetterOffset}" y="${baselineY - yOffset}"
                font-family="${monogramFontFamily}" font-size="${monogramFontSize}px"
                fill="#181717" text-anchor="middle">
                ${monogramData.text[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </text>\n`;

            // Center Initial (Large, on baseline)
            svgTextElements += `<text
                x="${centerX}" y="${baselineY}"
                font-family="${monogramFontFamily}" font-size="${largeMonogramFontSize}px"
                fill="#181717" text-anchor="middle">
                ${monogramData.text[1].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </text>\n`;

            // Right Initial (Small, shifted up)
            svgTextElements += `<text
                x="${centerX + sideLetterOffset}" y="${baselineY - yOffset}"
                font-family="${monogramFontFamily}" font-size="${monogramFontSize}px"
                fill="#181717" text-anchor="middle">
                ${monogramData.text[2].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </text>\n`;

            y += lineHeight;
        }

        if (hasStandardSelection && lines.length > 0) {
            selectedFonts.forEach((font, fontIndex) => {
                const activeFontFamily = font.styles[font.activeStyle];
                const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);

                y += labelFontSize + 10;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">${font.name} (${styleName})</text>\n`;
                y += lineHeight * 0.5;

                lines.forEach((line) => {
                    const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    y += lineHeight;
                    svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#181717">${sanitizedLine}</text>\n`;
                });

                if (fontIndex < selectedFonts.length - 1) {
                    y += lineHeight * 0.75;
                }
            });
        }

        if (customerNotes.trim() !== '') {
            y += lineHeight;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Customer Notes</text>\n`;
            y += lineHeight * 0.5;

            const noteLines = customerNotes.split('\n').filter(line => line.trim() !== '');
            noteLines.forEach(noteLine => {
                const sanitizedNoteLine = noteLine.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += labelFontSize * 1.4;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#181717">${sanitizedNoteLine}</text>\n`;
            });
        }

        const svgHeight = y + padding;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgTextElements}</svg>`;
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
            setIsSubmissionComplete(true); // Set submission as complete
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

    const hebrewRegex = /[\u0590-\u05FF]/;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            <aside className="bg-[rgb(50,75,106)] text-white w-full lg:w-[400px] p-4 flex-shrink-0 flex flex-col shadow-xl lg:rounded-r-3xl lg:justify-start">
                {/* Logo container */}
                <div className="flex-shrink-0 pt-4 lg:pt-8">
                    <img
                        src="/images/Arch Vector Logo White.svg"
                        alt="Arch Font Hub Logo"
                        className="object-contain drop-shadow-lg h-48 w-48 mx-auto lg:h-auto lg:w-[350px]"
                    />
                </div>

                {/* Text container with responsive centering logic */}
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
                        {/* Font Selection Section */}
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

                        {/* Custom Text Section */}
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
                            <textarea ref={textInputRef} className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-xl" value={customText} onChange={handleTextChange} placeholder={DEFAULT_TEXT_PLACEHOLDER} dir="auto" />
                        </section>

                        {/* Live Preview Section */}
                        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-normal" style={{ fontFamily: 'Alumni Sans Regular' }}>Live Preview</h2>
                                    <p className="text-slate-500 mt-1">Here's your text preview. When you're happy with your selection hit the button below! If you don't like a font feel free to deselect it above and try a new one out!</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">Size</label>
                                    <input id="fontSizeSlider" type="range" min="36" max="100" step="1" value={fontSize} onChange={handleFontSizeChange} className="w-32 lg:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    <span className="text-sm font-medium text-slate-600 w-12 text-left">{fontSize}px</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-6 rounded-xl min-h-[150px] space-y-10 border border-slate-100">

                                {/* --- Monogram Preview Block --- */}
                                {monogramData && (
                                    <div className="mb-10 p-6 border border-blue-200 rounded-xl bg-blue-50 shadow">
                                        <div className="mb-2 flex items-center gap-4">
                                            <span
                                                className="bg-blue-700 text-white px-4 py-1 rounded-full text-lg font-bold shadow"
                                                style={{ fontFamily: 'Arial' }}
                                            >
                                                {monogramData.font.name} (Monogram)
                                            </span>
                                        </div>
                                        <div className="flex justify-center items-center text-slate-800">
                                            {monogramData.isCircular ? (
                                                monogramData.frameStyle && monogramData.frameStyle !== 'none' ? (
                                                    <svg width="200" height="200" viewBox="0 0 200 200">
                                                        {/* Frame styles */}
                                                        {monogramData.frameStyle === 'solid' && (
                                                            <circle cx="100" cy="100" r="90" fill="black" stroke="white" strokeWidth="3" />
                                                        )}
                                                        {monogramData.frameStyle === 'double' && (
                                                            <>
                                                                <circle cx="100" cy="100" r="90" fill="black" stroke="white" strokeWidth="3" />
                                                                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" />
                                                            </>
                                                        )}
                                                        {monogramData.frameStyle === 'dotted' && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="90"
                                                                fill="black"
                                                                stroke="white"
                                                                strokeWidth="3"
                                                                strokeDasharray="6 6"
                                                            />
                                                        )}

                                                        {/* Monogram Letters - Centered */}
                                                        <text
                                                            x={100 - fontSize * 0.8}
                                                            y="100"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fill="white"
                                                            style={{ fontFamily: 'LeftCircleMonogram', fontSize }}
                                                        >
                                                            {monogramData.text[0]}
                                                        </text>
                                                        <text
                                                            x="100"
                                                            y="100"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fill="white"
                                                            style={{ fontFamily: 'MiddleCircleMonogram', fontSize: fontSize * 1.2 }}
                                                        >
                                                            {monogramData.text[1]}
                                                        </text>
                                                        <text
                                                            x={100 + fontSize * 0.8}
                                                            y="100"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            fill="white"
                                                            style={{ fontFamily: 'RightCircleMonogram', fontSize }}
                                                        >
                                                            {monogramData.text[2]}
                                                        </text>
                                                    </svg>
                                                ) : (
                                                    <>
                                                        <span style={{ fontFamily: 'LeftCircleMonogram', fontSize: `${fontSize}px` }}>
                                                            {monogramData.text[0]}
                                                        </span>
                                                        <span style={{ fontFamily: 'MiddleCircleMonogram', fontSize: `${fontSize}px` }}>
                                                            {monogramData.text[1]}
                                                        </span>
                                                        <span style={{ fontFamily: 'RightCircleMonogram', fontSize: `${fontSize}px` }}>
                                                            {monogramData.text[2]}
                                                        </span>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <span style={{ fontSize: `${fontSize}px` }}>{monogramData.text[0]}</span>
                                                    <span style={{ fontSize: `${fontSize * 1.5}px`, margin: '0 -0.1em' }}>
                                                        {monogramData.text[1]}
                                                    </span>
                                                    <span style={{ fontSize: `${fontSize}px` }}>{monogramData.text[2]}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}




                                {hebrewRegex.test(customText) && (
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

                                {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                    selectedFonts.map((font) => {
                                        const activeFontFamily = font.styles[font.activeStyle];
                                        return (
                                            <div key={`preview-${font.name}`} className="relative flex flex-col items-start gap-3">
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                                    <span className="bg-[rgb(50,75,106)] text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm z-10" style={{ fontFamily: 'Arial' }}>{font.name}</span>
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
                                                                <button key={styleKey} onClick={() => handleStyleChange(font.name, styleKey)} className={`px-4 py-2 text-sm rounded-md border-2 transition-colors ${font.activeStyle === styleKey ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}</button>
                                                            ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-800 break-words w-full" style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.4 }} dir="auto">{customText}</p>
                                            </div>
                                        )
                                    })
                                ) : (
                                    // Hide the placeholder text if a monogram is present, otherwise show it
                                    !monogramData && <div className="flex items-center justify-center h-full"><p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p></div>
                                )}
                            </div>
                        </section>

                        {/* Customer Notes Section */}
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

                    {/* Final Submit Button Area - Full width and centered */}
                    <div className="mt-10">
                        <button
                            onClick={handleSubmitClick}
                            className="w-full px-10 py-4 bg-blue-600 text-white text-xl rounded-2xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || (!monogramData && (selectedFonts.length === 0 || customText.trim() === ''))}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Selection'}
                        </button>
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}
            {(showCustomerModal || showMessageBox || showGlyphPalette || showAccentPalette || showHebrewPalette || showSuccessModal) && (
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
                    onInsert={(data) => {
                        setMonogramData(data);
                        setShowMonogramMaker(false); // Close modal on insert
                    }}
                />
            )}
        </div>
    );
};

export default App;