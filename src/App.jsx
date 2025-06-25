import React, { useState, useRef } from 'react';

// This component remains outside the main App component for good practice.
const FormInput = ({ label, id, value, onChange, required = false, isOptional = false }) => (
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
            className="w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-base"
        />
    </div>
);


const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

    // This array lists script-style fonts that need a larger font size on their buttons for readability.
    const scriptFontsToAdjust = [
        'Amazone BT', 'Angelface', 'Clicker Script', 'Concerto Pro', 'Courgette',
        'Cowboy Rodeo', 'Freebooter Script', 'French Script', 'Great Vibes',
        'Honey Script', 'I Love Glitter', 'Lisbon Script'
    ];

    // --- FINAL, CORRECTED FONT LIBRARY BASED ON THE PROVIDED LIST ---
    const fontLibrary = {
        'Sans-serif': [
            { name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } },
            { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } },
            { name: 'Berlin Sans', styles: { regular: 'BerlinSansFB-Reg', bold: 'BerlinSansFB-Bold' } },
            { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } },
            { name: 'Century Gothic', styles: { regular: 'CenturyGothicPaneuropean', bold: 'CenturyGothicPaneuropean-Bold', boldItalic: 'CenturyGothicPaneuropean-BoldItalic' } },
            { name: 'Graphik', styles: { regular: 'Graphik-Regular', regularItalic: 'Graphik-RegularItalic', medium: 'Graphik-Medium', mediumItalic: 'Graphik-MediumItalic', semibold: 'Graphik-Semibold', thin: 'Graphik-Thin', thinItalic: 'Graphik-ThinItalic' } },
            { name: 'Zapf Humanist', styles: { demi: 'ZapfHumanist601BT-Demi' } },
        ],
        'Serif': [
            { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BenguiatITCbyBT-Bold', italic: 'BenguiatITCbyBT-BookItalic' } },
            { name: 'Bookman', styles: { bold: 'BookmanOldStyle-Bold', boldItalic: 'BookmanOldStyle-BoldItalic', italic: 'BookmanOldStyle-Italic' } },
            { name: 'Century Schoolbook', styles: { regular: 'CenturySchoolbook', bold: 'CenturySchoolbook-Bold', boldItalic: 'CenturySchoolbook-BoldItalic' } },
            { name: 'Century', styles: { roman: 'Century725BT-Roman', italic: 'Century725BT-Italic', bold: 'Century725BT-Bold', black: 'Century725BT-Black', condensed: 'Century725BT-RomanCondensed' } },
            { name: 'Copperplate', styles: { regular: 'CopperplateGothicBT-Roman' } },
            {
                name: 'DejaVu Serif', styles: {
                    regular: 'DejaVuSerif',
                    bold: 'DejaVuSerif-Bold',
                    italic: 'DejaVuSerif-Italic',
                    boldItalic: 'DejaVuSerif-BoldItalic',
                    condensed: 'DejaVuSerifCondensed',
                    condensedBold: 'DejaVuSerifCondensed-Bold',
                    condensedItalic: 'DejaVuSerifCondensed-Italic',
                    condensedBoldItalic: 'DejaVuSerifCondensed-BoldItalic'
                }
            },
            // --- FIX: Combined both Garamond fonts into one family ---
            { name: 'Garamond', styles: { regular: 'Garamond', v3: 'Garamond3LTStd', v3_bold: 'Garamond3LTStd-Bold', v3_italic: 'Garamond3LTStd-Italic', v3_boldItalic: 'Garamond3LTStd-BoldItalic' } },
            { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },
        ],
        'Script & Display': [
            { name: 'Amazone', styles: { regular: 'AmazoneBT-Regular' } },
            { name: 'American Pop Plain', styles: { regular: 'American Pop Plain' } },
            { name: 'Angelface', styles: { regular: 'Angelface' } },
            { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
            { name: 'Clicker Script', styles: { regular: 'ClickerScript-Regular' } },
            { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
            { name: 'Concerto Pro', styles: { regular: 'ConcertoPro-Regular' } },
            { name: 'Courgette', styles: { regular: 'Courgette-Regular' } },
            { name: 'Cowboy Rodeo', styles: { regular: 'CowboyRodeoW01-Regular' } },
            { name: 'Freebooter Script', styles: { regular: 'FreebooterScript' } },
            { name: 'French Script', styles: { regular: 'FrenchScriptMT' } },
            { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } },
            { name: 'Honey Script', styles: { light: 'HoneyScript-Light', semiBold: 'HoneyScript-SemiBold' } },
            { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } },
            { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } },
            { name: 'Lisbon Script', styles: { regular: 'LisbonScript-Regular' } },
            { name: 'Machine BT', styles: { regular: 'MachineITCbyBT-Regular' } },
            { name: 'Murray Hill', styles: { regular: 'MurrayHill' } },
            { name: 'Old English', styles: { regular: 'OldEnglishTextMT' } },
            { name: 'Planscribe', styles: { regular: 'PlanscribeNFW01-Regular' } },
        ],
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [fontSize, setFontSize] = useState(36);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showGlyphPalette, setShowGlyphPalette] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    const textInputRef = useRef(null);

    const handleFontSelect = (font) => {
        const isSelected = selectedFonts.some(f => f.name === font.name);
        if (isSelected) {
            setSelectedFonts(prev => prev.filter(f => f.name !== font.name));
        } else {
            const defaultStyleKey = Object.keys(font.styles)[0];
            setSelectedFonts(prev => [...prev, { ...font, activeStyle: defaultStyleKey }]);
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

    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '') {
            showMessage('Please select at least one font and enter some text to save an SVG.');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            showMessage('Please enter some text to save an SVG.');
            return;
        }

        let svgTextElements = '';
        const lineHeight = fontSize * 1.4;
        const labelFontSize = 16;
        const padding = 20;
        let y = padding;

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

        const svgWidth = 800;
        const svgHeight = y + padding;
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgTextElements}</svg>`;
        setPendingSvgContent(fullSvg);
        setShowCustomerModal(true);
    };

    const handleCustomerModalSubmit = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim() || !customerName.trim()) {
            showMessage('Order Number and Customer Name are required.');
            return;
        }

        setShowCustomerModal(false);
        const filename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_') + '.svg';

        try {
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('SVG saved locally!');
        } catch (error) {
            showMessage(`Could not save file locally: ${error.message}`);
        }

        try {
            const response = await fetch(`${WORKER_URL}/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: pendingSvgContent
            });
            if (!response.ok) throw new Error(await response.text());
            showMessage('SVG uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            showMessage(`Error uploading SVG: ${error.message}`, 6000);
        }

        setCustomerName('');
        setCustomerCompany('');
        setOrderNumber('');
        setPendingSvgContent(null);
    };

    const glyphs = ['©', '®', '™', '&', '#', '+', '–', '—', '…', '•', '°', '·', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '★', '☆', '♪', '♫', '←', '→', '↑', '↓', '∞', '†', '✡\uFE0E', '✞', '✠', '±', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            <aside className="bg-gradient-to-b from-slate-800 to-slate-900 text-white w-full lg:w-80 lg:h-auto p-4 lg:p-8 flex-shrink-0 flex flex-col items-center justify-center lg:justify-start lg:pt-16 shadow-xl lg:rounded-r-3xl">
                <div className="flex flex-row lg:flex-col items-center justify-center gap-4">
                    <div className="flex-shrink-0">
                        <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="h-20 w-20 lg:h-40 lg:w-40 object-contain drop-shadow-lg" />
                    </div>
                    <div className="font-black text-2xl lg:text-3xl tracking-wide leading-tight text-white text-center">ARCH<br className="hidden lg:block" /> FONT HUB</div>
                </div>
                <p className="hidden lg:block mt-4 text-base text-slate-300 border-t border-slate-700 pt-6 text-center">Experiment with fonts and text display for customer proofs.</p>
            </aside>

            <main className="flex-1 p-4 sm:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-10">
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Font Selection</h2>
                            <div className="space-y-6">
                                {Object.entries(fontLibrary).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="text-md font-semibold text-slate-700 border-b-2 border-slate-200 pb-2 mb-3 tracking-wide">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {fonts.map((font) => {
                                                const isScriptFont = scriptFontsToAdjust.includes(font.name);
                                                const fontSizeClass = isScriptFont ? 'text-2xl' : 'text-lg';
                                                return (
                                                    <button
                                                        key={font.name}
                                                        onClick={() => handleFontSelect(font)}
                                                        className={`px-5 py-3 rounded-xl font-semibold border-2 transition-all duration-150 transform hover:scale-105 focus:outline-none ${fontSizeClass}
                                                            ${selectedFonts.some(f => f.name === font.name)
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                : 'bg-white text-blue-900 border-blue-500 hover:bg-blue-50'
                                                            }`}
                                                        style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
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

                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Custom Text</h2>
                                <button onClick={() => setShowGlyphPalette(true)} className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base">Ω Glyphs</button>
                            </div>
                            <textarea ref={textInputRef} className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-xl" value={customText} onChange={handleTextChange} placeholder={DEFAULT_TEXT_PLACEHOLDER} />
                        </section>

                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Preview</h2>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">Size</label>
                                    <input id="fontSizeSlider" type="range" min="36" max="100" step="1" value={fontSize} onChange={handleFontSizeChange} className="w-32 lg:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                    <span className="text-sm font-medium text-slate-600 w-12 text-left">{fontSize}px</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-6 rounded-xl min-h-[150px] space-y-10 border border-slate-100">
                                {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                    selectedFonts.map((font) => {
                                        const activeFontFamily = font.styles[font.activeStyle];
                                        return (
                                            <div key={`preview-${font.name}`} className="relative flex flex-col items-start gap-3">
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm z-10" style={{ fontFamily: 'Arial' }}>{font.name}</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {Object.keys(font.styles).map(styleKey => (
                                                            <button
                                                                key={styleKey}
                                                                onClick={() => handleStyleChange(font.name, styleKey)}
                                                                className={`px-4 py-2 text-sm rounded-md border-2 transition-colors ${font.activeStyle === styleKey ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                                                            >
                                                                {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-800 break-words w-full" style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px`, lineHeight: 1.4 }}>{customText}</p>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex items-center justify-center h-full"><p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p></div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="mt-12">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-blue-200 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 text-2xl tracking-wide" onClick={handleSaveSvg}>
                            Submit Fonts to Arch Engraving
                        </button>
                    </div>
                </div>
            </main>

            {(showCustomerModal || showMessageBox || showGlyphPalette) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-fade-in">
                        {showGlyphPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Glyph Palette</h3>
                                <div className="grid grid-cols-12 gap-2 bg-slate-100 p-4 rounded-lg">
                                    {glyphs.map(glyph => (<button key={glyph} onClick={() => handleGlyphInsert(glyph)} className="flex items-center justify-center h-12 w-full bg-white rounded-lg shadow-sm text-2xl text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors" title={`Insert ${glyph}`}>{glyph}</button>))}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base" onClick={() => setShowGlyphPalette(false)}>Close</button>
                                </div>
                            </div>
                        )}
                        {showCustomerModal && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-8">
                                <h3 className="text-2xl font-bold text-slate-900">Enter Customer Information to Save</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm text-base">Submit & Save</button>
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
        </div>
    );
};

export default App;
