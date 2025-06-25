import React, { useState, useRef } from 'react';
import './App.css'; // We will create this new CSS file next

// --- HELPER ICONS (for a cleaner look) ---
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);


// --- FONT LIBRARY (Unchanged from your original file) ---
const fontLibrary = {
    'Sans-serif': [
        { name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } },
        { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } },
        { name: 'Berlin Sans FB', styles: { regular: 'BerlinSansFB-Reg', bold: 'BerlinSansFB-Bold' } },
        { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } },
        { name: 'Century Gothic', styles: { regular: 'CenturyGothicPaneuropean', bold: 'CenturyGothicPaneuropean-Bold', boldItalic: 'CenturyGothicPaneuropean-BoldItalic' } },
        { name: 'Graphik', styles: { thin: 'Graphik-Thin', regular: 'Graphik-Regular', medium: 'Graphik-Medium', semibold: 'Graphik-Semibold', thinItalic: 'Graphik-ThinItalic', regularItalic: 'Graphik-RegularItalic', mediumItalic: 'Graphik-MediumItalic' } },
        { name: 'Zapf Humanist', styles: { demi: 'ZapfHumanist601BT-Demi' } },
    ],
    'Serif': [
        { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BenguiatITCbyBT-Bold', italic: 'BenguiatITCbyBT-BookItalic' } },
        { name: 'Century Schoolbook', styles: { regular: 'CenturySchoolbook', bold: 'CenturySchoolbook-Bold', boldItalic: 'CenturySchoolbook-BoldItalic' } },
        { name: 'CopprplGoth BT', styles: { regular: 'CopperplateGothicBT-Roman' } },
        { name: 'Garamond', styles: { regular: 'Garamond' } },
        { name: 'Garamond 3 LT Std', styles: { regular: 'Garamond3LTStd', bold: 'Garamond3LTStd-Bold', italic: 'Garamond3LTStd-Italic', boldItalic: 'Garamond3LTStd-BoldItalic' } },
        { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },
    ],
    'Script': [
        { name: 'Amazone BT', styles: { regular: 'AmazoneBT-Regular' } },
        { name: 'Angelface', styles: { regular: 'Angelface' } },
        { name: 'Birds of Paradise', styles: { regular: 'BirdsofParadise-PersonaluseOnly' } },
        { name: 'Clicker Script', styles: { regular: 'ClickerScript-Regular' } },
        { name: 'Courgette', styles: { regular: 'Courgette-Regular' } },
        { name: 'Freebooter Script', styles: { regular: 'FreebooterScript' } },
        { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } },
        { name: 'Honey Script', styles: { light: 'HoneyScript-Light', semiBold: 'HoneyScript-SemiBold' } },
        { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } },
        { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } },
        { name: 'Lisbon Script', styles: { regular: 'LisbonScript-Regular' } },
        { name: 'Murray Hill', styles: { regular: 'MurrayHill' } },
    ],
    'Display': [
        { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
        { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
        { name: 'Cowboy Rodeo', styles: { regular: 'CowboyRodeoW01-Regular' } },
        { name: 'Machine BT', styles: { regular: 'MachineITCbyBT-Regular' } },
        { name: 'Old English Text MT', styles: { regular: 'OldEnglishTextMT' } },
        { name: 'Planscribe', styles: { regular: 'PlanscribeNFW01-Regular' } },
        { name: 'Tinplate Titling Black', styles: { regular: 'TinplateTitlingBlack' } },
    ]
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="modal-close-button">
                        <XIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};


const App = () => {
    // --- STATE MANAGEMENT (All original state is preserved) ---
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'The quick brown fox jumps over the lazy dog.';

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [fontSize, setFontSize] = useState(48);
    const [toasts, setToasts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    // Modal visibility states
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isGlyphModalOpen, setIsGlyphModalOpen] = useState(false);

    const textInputRef = useRef(null);

    // --- CORE FUNCTIONS (All original logic is preserved and enhanced) ---

    const showToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    };

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

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleGlyphInsert = (glyph) => {
        const textarea = textInputRef.current;
        if (!textarea) return;
        const { selectionStart, selectionEnd } = textarea;
        const newText = customText.substring(0, selectionStart) + glyph + customText.substring(selectionEnd);
        setCustomText(newText);
        textarea.focus();
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + glyph.length;
        }, 0);
    };

    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '') {
            showToast('Please select a font and enter text.', 'error');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            showToast('Please enter some text to save.', 'error');
            return;
        }

        let svgTextElements = '';
        const lineHeight = fontSize * 1.4;
        const labelFontSize = 14;
        const padding = 25;
        let y = padding;

        selectedFonts.forEach((font, fontIndex) => {
            const activeFontFamily = font.styles[font.activeStyle];
            const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);
            y += labelFontSize + 12;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#4b5563">${font.name} — ${styleName}</text>\n`;
            y += 5;

            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#111827">${sanitizedLine}</text>\n`;
            });
            if (fontIndex < selectedFonts.length - 1) y += lineHeight * 0.5;
        });

        const svgHeight = y + padding;
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${svgHeight}" style="background-color: #ffffff;">\n${svgTextElements}</svg>`;

        setPendingSvgContent(fullSvg);
        setIsCustomerModalOpen(true);
    };

    const handleCustomerModalSubmit = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim() || !customerName.trim()) {
            showToast('Order Number and Customer Name are required.', 'error');
            return;
        }
        setIsCustomerModalOpen(false);

        const filename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_') + '.svg';

        // Local Download
        try {
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            showToast(`Saved ${filename} locally.`);
        } catch (error) {
            showToast(`Error saving file: ${error.message}`, 'error');
        }

        // R2 Upload
        try {
            const response = await fetch(`${WORKER_URL}/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: pendingSvgContent
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            showToast('Proof uploaded successfully.');
        } catch (error) {
            console.error('Upload error:', error);
            showToast(`Upload failed: ${error.message}`, 'error', 6000);
        }

        // Reset form
        setCustomerName('');
        setCustomerCompany('');
        setOrderNumber('');
        setPendingSvgContent(null);
    };

    const glyphs = ['©', '®', '™', '&', '#', '+', '–', '—', '…', '•', '°', '·', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '★', '☆', '♪', '♫', '←', '→', '↑', '↓', '∞', '†', '✡︎', '✞', '✠', '±', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

    return (
        <div className="app-container">
            {/* --- TOAST NOTIFICATIONS --- */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* --- MODALS --- */}
            <Modal isOpen={isGlyphModalOpen} onClose={() => setIsGlyphModalOpen(false)} title="Glyph Palette">
                <div className="glyph-palette">
                    {glyphs.map(glyph => (
                        <button key={glyph} onClick={() => handleGlyphInsert(glyph)} className="glyph-button" title={`Insert ${glyph}`}>
                            {glyph}
                        </button>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Enter Customer Information">
                <form onSubmit={handleCustomerModalSubmit} className="customer-form">
                    <div className="form-group">
                        <label htmlFor="orderNumber">Order Number*</label>
                        <input id="orderNumber" type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="customerName">Customer Name*</label>
                        <input id="customerName" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="customerCompany">Company (Optional)</label>
                        <input id="customerCompany" type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="button-secondary" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button>
                        <button type="submit" className="button-primary">Submit & Save</button>
                    </div>
                </form>
            </Modal>

            {/* --- HEADER --- */}
            <header className="app-header">
                <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="logo" />
                <h1>ARCH FONT HUB</h1>
            </header>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className="main-grid">

                {/* --- LEFT PANEL: FONT LIBRARY --- */}
                <aside className="panel font-library">
                    <h2 className="panel-title">Font Library</h2>
                    <div className="font-categories">
                        {Object.entries(fontLibrary).map(([category, fonts]) => (
                            <div key={category} className="font-category">
                                <h3>{category}</h3>
                                <div className="font-list">
                                    {fonts.map(font => {
                                        const isSelected = selectedFonts.some(f => f.name === font.name);
                                        return (
                                            <button
                                                key={font.name}
                                                className={`font-item ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleFontSelect(font)}
                                                style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
                                            >
                                                {font.name}
                                                <div className="font-item-icon">
                                                    {isSelected ? <XIcon /> : <PlusIcon />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- CENTER PANEL: WORKSPACE & PREVIEW --- */}
                <main className="panel workspace">
                    <div className="text-input-section">
                        <div className="panel-header">
                            <h2 className="panel-title">Text to Preview</h2>
                            <button className="button-tertiary" onClick={() => setIsGlyphModalOpen(true)}>Ω Glyphs</button>
                        </div>
                        <textarea
                            ref={textInputRef}
                            className="text-input"
                            value={customText}
                            onChange={e => setCustomText(e.target.value)}
                            placeholder="Type your text here..."
                        />
                    </div>
                    <div className="preview-section">
                        <h2 className="panel-title">Live Preview</h2>
                        <div className="preview-area">
                            {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                selectedFonts.map(font => {
                                    const activeFontFamily = font.styles[font.activeStyle];
                                    return (
                                        <p key={`preview-${font.name}`} className="preview-text" style={{ fontFamily: activeFontFamily, fontSize: `${fontSize}px` }}>
                                            {customText}
                                        </p>
                                    )
                                })
                            ) : (
                                <div className="preview-placeholder">
                                    <p>Select a font and type to see a preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* --- RIGHT PANEL: SELECTIONS & CONTROLS --- */}
                <aside className="panel controls-panel">
                    <h2 className="panel-title">Selections & Controls</h2>
                    <div className="controls-content">
                        <div className="font-size-control">
                            <label htmlFor="fontSizeSlider">Font Size: <span>{fontSize}px</span></label>
                            <input id="fontSizeSlider" type="range" min="24" max="120" step="1" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                        </div>

                        <div className="selected-fonts-list">
                            {selectedFonts.length > 0 ? (
                                selectedFonts.map(font => (
                                    <div key={font.name} className="selected-font-card">
                                        <div className="selected-font-header">
                                            <span style={{ fontFamily: font.styles.regular || font.styles[Object.keys(font.styles)[0]] }}>{font.name}</span>
                                            <button onClick={() => handleFontSelect(font)}><XIcon /></button>
                                        </div>
                                        <div className="style-selector">
                                            {Object.keys(font.styles).map(styleKey => (
                                                <button
                                                    key={styleKey}
                                                    onClick={() => handleStyleChange(font.name, styleKey)}
                                                    className={font.activeStyle === styleKey ? 'active' : ''}
                                                >
                                                    {styleKey}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-selection-placeholder">
                                    <p>No fonts selected.</p>
                                    <span>Click a font from the library to add it.</span>
                                </div>
                            )}
                        </div>

                        <button className="button-primary save-button" onClick={handleSaveSvg} disabled={selectedFonts.length === 0 || customText.trim() === ''}>
                            Generate Proof & Save SVG
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default App;