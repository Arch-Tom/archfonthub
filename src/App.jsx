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
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

    // This font library is for the browser preview ONLY.
    // The worker will have its own logic for the final SVG export.
    const fontLibrary = {
        'Sans-serif': [
            { name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } },
            { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } },
            { name: 'Century Gothic', styles: { regular: 'CenturyGothic', bold: 'CenturyGothic-Bold', boldItalic: 'CenturyGothic-BoldItalic' } },
            { name: 'Berlin Sans FB', styles: { regular: 'BRLNSR', bold: 'BRLNSB' } },
            { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } },
            { name: 'Zapf Humanist', styles: { demi: 'ZHUM601D' } },
        ],
        'Serif': [
            { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },
            { name: 'Garamond', styles: { regular: 'GARA' } },
            { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BENGUIAB', italic: 'BenguiatITCbyBT-BookItalic' } },
            { name: 'Century Schoolbook', styles: { regular: 'CENSCBK', bold: 'SCHLBKB', boldItalic: 'SCHLBKBI' } },
            { name: 'CopprplGoth BT', styles: { regular: 'Copperplate Gothic' } },
        ],
        'Script & Display': [
            { name: 'Amazone BT', styles: { regular: 'AmazonRg' } },
            { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
            { name: 'ChocolateBox', styles: { regular: 'ChocolateBox' } },
            { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
            { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } },
            { name: 'Honey Script', styles: { light: 'HONEYSCL', semiBold: 'HONEYSSB' } },
            { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } },
            { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } },
            { name: 'Murray Hill', styles: { regular: 'MurrayHill-Regular' } },
            { name: 'Tinplate Titling Black', styles: { regular: 'TinplateTitlingBlack' } },
        ],
    };

    // State hooks for managing the application's data and UI
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

    const textInputRef = useRef(null);

    // Handles selecting or deselecting a font
    const handleFontSelect = (font) => {
        const isSelected = selectedFonts.some(f => f.name === font.name);
        if (isSelected) {
            setSelectedFonts(prev => prev.filter(f => f.name !== font.name));
        } else {
            const defaultStyleKey = Object.keys(font.styles)[0];
            setSelectedFonts(prev => [...prev, { ...font, activeStyle: defaultStyleKey }]);
        }
    };

    // Handles changing the style (e.g., bold, italic) of a selected font
    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev =>
            prev.map(font =>
                font.name === fontName ? { ...font, activeStyle: newStyle } : font
            )
        );
    };

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));

    // Displays a message box for a short duration
    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };

    // Formats a string to be filesystem-friendly
    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    // Inserts a glyph into the textarea at the current cursor position
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

        const proofData = {
            customText,
            fontSize,
            selectedFonts,
            filename,
        };

        try {
            showMessage('Generating SVG proof... Please wait.');

            // *** UPDATED: The full URL is now hardcoded here to prevent any errors. ***
            const response = await fetch(`https://customerfontselection-worker.tom-4a9.workers.dev/generate-proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proofData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Worker responded with an error: ${errorText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showMessage('SVG proof downloaded successfully!');

        } catch (error) {
            console.error('Failed to generate or download SVG:', error);
            showMessage(`Error: ${error.message}`, 6000);
        }

        // Reset state
        setCustomerName('');
        setCustomerCompany('');
        setOrderNumber('');
    };

    const glyphs = ['©', '®', '™', '&', '#', '+', '–', '—', '…', '•', '°', '·', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '★', '☆', '♪', '♫', '←', '→', '↑', '↓', '∞', '†', '✡\uFE0E', '✞', '✠', '±', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="bg-gradient-to-b from-slate-800 to-slate-900 text-white w-full lg:w-80 lg:h-auto p-4 lg:p-8 flex-shrink-0 flex flex-col items-center justify-center lg:justify-start lg:pt-16 shadow-xl lg:rounded-r-3xl">
                <div className="flex flex-row lg:flex-col items-center justify-center gap-4">
                    <div className="flex-shrink-0">
                        <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="h-20 w-20 lg:h-40 lg:w-40 object-contain drop-shadow-lg" />
                    </div>
                    <div className="font-black text-2xl lg:text-3xl tracking-wide leading-tight text-white text-center">ARCH<br className="hidden lg:block" /> FONT HUB</div>
                </div>
                <p className="hidden lg:block mt-4 text-base text-slate-300 border-t border-slate-700 pt-6 text-center">Experiment with fonts and text display for customer proofs.</p>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-10">

                        {/* Font Selection Section */}
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Font Selection</h2>
                            <div className="space-y-6">
                                {Object.entries(fontLibrary).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="text-md font-semibold text-slate-700 border-b-2 border-slate-200 pb-2 mb-3 tracking-wide">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {fonts.map((font) => (
                                                <button
                                                    key={font.name}
                                                    onClick={() => handleFontSelect(font)}
                                                    className={`px-4 py-2 rounded-xl text-base font-semibold border-2 transition-all duration-150 transform hover:scale-105 focus:outline-none
                                                        ${selectedFonts.some(f => f.name === font.name)
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                            : 'bg-white text-blue-900 border-blue-500 hover:bg-blue-50'
                                                        }`}
                                                    style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
                                                >
                                                    {font.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Custom Text Section */}
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Custom Text</h2>
                                <button onClick={() => setShowGlyphPalette(true)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-sm">Ω Glyphs</button>
                            </div>
                            <textarea ref={textInputRef} className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-lg" value={customText} onChange={handleTextChange} placeholder={DEFAULT_TEXT_PLACEHOLDER} />
                        </section>

                        {/* Live Preview Section */}
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
                                                <div className="flex items-center gap-4 mb-2">
                                                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm z-10" style={{ fontFamily: 'Arial' }}>{font.name}</span>
                                                    <div className="flex gap-1">
                                                        {Object.keys(font.styles).map(styleKey => (
                                                            <button
                                                                key={styleKey}
                                                                onClick={() => handleStyleChange(font.name, styleKey)}
                                                                className={`px-3 py-1 text-xs rounded-md border-2 transition-colors ${font.activeStyle === styleKey ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
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

                    {/* Submit Button */}
                    <div className="mt-12">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-blue-200 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 text-xl tracking-wide" onClick={handleSaveSvg}>
                            Submit Fonts to Arch Engraving
                        </button>
                    </div>
                </div>
            </main>

            {/* Modals Overlay */}
            {(showCustomerModal || showMessageBox || showGlyphPalette) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-fade-in">
                        {/* Glyph Palette Modal */}
                        {showGlyphPalette && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Glyph Palette</h3>
                                <div className="grid grid-cols-12 gap-2 bg-slate-100 p-4 rounded-lg">
                                    {glyphs.map(glyph => (<button key={glyph} onClick={() => handleGlyphInsert(glyph)} className="flex items-center justify-center h-12 w-full bg-white rounded-lg shadow-sm text-2xl text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors" title={`Insert ${glyph}`}>{glyph}</button>))}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="button" className="px-5 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors" onClick={() => setShowGlyphPalette(false)}>Close</button>
                                </div>
                            </div>
                        )}
                        {/* Customer Info Modal */}
                        {showCustomerModal && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-8">
                                <h3 className="text-2xl font-bold text-slate-900">Enter Customer Information to Save</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-5 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm">Submit & Save</button>
                                </div>
                            </form>
                        )}
                        {/* General Message Modal */}
                        {showMessageBox && (
                            <div className="text-center">
                                <p className="text-slate-800 text-lg mb-8">{message}</p>
                                <button onClick={() => setShowMessageBox(false)} className="px-10 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm">OK</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
