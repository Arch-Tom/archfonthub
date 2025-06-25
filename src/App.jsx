import React, { useState, useRef } from 'react';
import './App.css';

// --- Helper Icons ---
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

// --- Font Library (Updated) ---
const fontLibrary = {
    'Sans-serif': [
        { name: 'Arial', styles: { regular: { fontFamily: 'ArialMT', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'Arial-BoldMT', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'Arial-ItalicMT', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'Arial-BoldItalicMT', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Bebas Neue', styles: { regular: { fontFamily: 'BebasNeue-Regular', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'BebasNeue-Bold', fontWeight: 'bold', fontStyle: 'normal' } } },
        { name: 'Berlin Sans FB', styles: { regular: { fontFamily: 'BerlinSansFB-Reg', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'BerlinSansFB-Bold', fontWeight: 'bold', fontStyle: 'normal' } } },
        { name: 'Calibri', styles: { regular: { fontFamily: 'Calibri', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'Calibri-Bold', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'Calibri-Italic', fontWeight: 'normal', fontStyle: 'italic' } } },
        { name: 'Century Gothic', styles: { regular: { fontFamily: 'CenturyGothicPaneuropean', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'CenturyGothicPaneuropean-Bold', fontWeight: 'bold', fontStyle: 'normal' }, boldItalic: { fontFamily: 'CenturyGothicPaneuropean-BoldItalic', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Graphik', styles: { thin: { fontFamily: 'Graphik-Thin', fontWeight: '100', fontStyle: 'normal' }, regular: { fontFamily: 'Graphik-Regular', fontWeight: 'normal', fontStyle: 'normal' }, medium: { fontFamily: 'Graphik-Medium', fontWeight: '500', fontStyle: 'normal' }, semibold: { fontFamily: 'Graphik-Semibold', fontWeight: '600', fontStyle: 'normal' }, thinItalic: { fontFamily: 'Graphik-ThinItalic', fontWeight: '100', fontStyle: 'italic' }, regularItalic: { fontFamily: 'Graphik-RegularItalic', fontWeight: 'normal', fontStyle: 'italic' }, mediumItalic: { fontFamily: 'Graphik-MediumItalic', fontWeight: '500', fontStyle: 'italic' } } },
        { name: 'Zapf Humanist', styles: { demi: { fontFamily: 'ZapfHumanist601BT-Demi', fontWeight: '600', fontStyle: 'normal' } } },
    ],
    'Serif': [
        { name: 'Benguiat', styles: { regular: { fontFamily: 'Benguiat', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'BenguiatITCbyBT-Bold', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'BenguiatITCbyBT-BookItalic', fontWeight: 'normal', fontStyle: 'italic' } } },
        { name: 'Bookman Old Style', styles: { regular: { fontFamily: 'Bookman Old Style', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'Bookman Old Style', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'Bookman Old Style', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'Bookman Old Style', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Century Schoolbook', styles: { regular: { fontFamily: 'CenturySchoolbook', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'CenturySchoolbook-Bold', fontWeight: 'bold', fontStyle: 'normal' }, boldItalic: { fontFamily: 'CenturySchoolbook-BoldItalic', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Century725 BT', styles: { regular: { fontFamily: 'Century725 BT', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'Century725 BT', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'Century725 BT', fontWeight: 'normal', fontStyle: 'italic' } } },
        { name: 'CopprplGoth BT', styles: { regular: { fontFamily: 'CopperplateGothicBT-Roman', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'DejaVu Serif', styles: { regular: { fontFamily: 'DejaVu Serif', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'DejaVu Serif', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'DejaVu Serif', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'DejaVu Serif', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'DejaVu Serif Condensed', styles: { regular: { fontFamily: 'DejaVu Serif Condensed', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'DejaVu Serif Condensed', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'DejaVu Serif Condensed', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'DejaVu Serif Condensed', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Garamond 3 LT Std', styles: { regular: { fontFamily: 'Garamond3LTStd', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'Garamond3LTStd-Bold', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'Garamond3LTStd-Italic', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'Garamond3LTStd-BoldItalic', fontWeight: 'bold', fontStyle: 'italic' } } },
        { name: 'Times New Roman', styles: { regular: { fontFamily: 'TimesNewRomanPSMT', fontWeight: 'normal', fontStyle: 'normal' }, bold: { fontFamily: 'TimesNewRomanPS-BoldMT', fontWeight: 'bold', fontStyle: 'normal' }, italic: { fontFamily: 'TimesNewRomanPS-ItalicMT', fontWeight: 'normal', fontStyle: 'italic' }, boldItalic: { fontFamily: 'TimesNewRomanPS-BoldItalicMT', fontWeight: 'bold', fontStyle: 'italic' } } },
    ],
    'Script': [
        { name: 'Amazone BT', styles: { regular: { fontFamily: 'AmazoneBT-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Angelface', styles: { regular: { fontFamily: 'Angelface', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Clicker Script', styles: { regular: { fontFamily: 'ClickerScript-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Concerto Pro', styles: { regular: { fontFamily: 'Concerto Pro', fontWeight: 'normal', fontStyle: 'italic' } } },
        { name: 'Courgette', styles: { regular: { fontFamily: 'Courgette-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Freebooter Script', styles: { regular: { fontFamily: 'FreebooterScript', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'French Script MT', styles: { regular: { fontFamily: 'French Script MT', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Great Vibes', styles: { regular: { fontFamily: 'GreatVibes-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Honey Script', styles: { light: { fontFamily: 'HoneyScript-Light', fontWeight: '300', fontStyle: 'normal' }, semiBold: { fontFamily: 'HoneyScript-SemiBold', fontWeight: '600', fontStyle: 'normal' } } },
        { name: 'I Love Glitter', styles: { regular: { fontFamily: 'ILoveGlitter', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'ITC Zapf Chancery', styles: { regular: { fontFamily: 'ZapfChancery-Roman', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Lisbon Script', styles: { regular: { fontFamily: 'LisbonScript-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Murray Hill', styles: { regular: { fontFamily: 'MurrayHill', fontWeight: 'normal', fontStyle: 'normal' } } },
    ],
    'Display': [
        { name: 'American Pop Plain', styles: { regular: { fontFamily: 'American Pop Plain', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'BlackChancery', styles: { regular: { fontFamily: 'BlackChancery', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Century725 Blk BT', styles: { black: { fontFamily: 'Century725 Blk BT', fontWeight: '900', fontStyle: 'normal' } } },
        { name: 'Century725 Cn BT', styles: { regular: { fontFamily: 'Century725 Cn BT', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Collegiate', styles: { black: { fontFamily: 'CollegiateBlackFLF', fontWeight: '900', fontStyle: 'normal' }, outline: { fontFamily: 'CollegiateOutlineFLF', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Cowboy Rodeo', styles: { regular: { fontFamily: 'CowboyRodeoW01-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Machine BT', styles: { regular: { fontFamily: 'MachineITCbyBT-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Old English Text MT', styles: { regular: { fontFamily: 'OldEnglishTextMT', fontWeight: 'normal', fontStyle: 'normal' } } },
        { name: 'Planscribe', styles: { regular: { fontFamily: 'PlanscribeNFW01-Regular', fontWeight: 'normal', fontStyle: 'normal' } } },
    ]
};


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="modal-close-button"><XIcon /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_PLACEHOLDER = 'The quick brown fox jumps over the lazy dog.';
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_PLACEHOLDER);
    const [fontSize, setFontSize] = useState(36);
    const [toasts, setToasts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isGlyphModalOpen, setIsGlyphModalOpen] = useState(false);
    const textInputRef = useRef(null);

    const showToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    };

    const handleFontSelect = (font) => {
        setSelectedFonts(prev =>
            prev.some(f => f.name === font.name)
                ? prev.filter(f => f.name !== font.name)
                : [...prev, { ...font, activeStyle: Object.keys(font.styles)[0] }]
        );
    };

    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev => prev.map(f => f.name === fontName ? { ...f, activeStyle: newStyle } : f));
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleGlyphInsert = (glyph) => {
        const { current: textarea } = textInputRef;
        if (!textarea) return;
        const { selectionStart, selectionEnd } = textarea;
        const newText = customText.substring(0, selectionStart) + glyph + customText.substring(selectionEnd);
        setCustomText(newText);
        textarea.focus();
        setTimeout(() => textarea.selectionStart = textarea.selectionEnd = selectionStart + glyph.length, 0);
    };

    const handleTextFocus = () => {
        if (customText === DEFAULT_PLACEHOLDER) {
            setCustomText('');
        }
    };

    const handleTextBlur = () => {
        if (customText.trim() === '') {
            setCustomText(DEFAULT_PLACEHOLDER);
        }
    };

    const handleInitiateSave = () => {
        if (selectedFonts.length === 0 || !customText.trim()) {
            showToast('Please select a font and enter some text.', 'error');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            showToast('Please enter some text to save.', 'error');
            return;
        }

        let svgTextElements = '';
        const lineHeight = fontSize * 1.5;
        const labelFontSize = 14;
        const padding = 30;
        let y = padding;

        selectedFonts.forEach((font, fontIndex) => {
            const activeFontStyle = font.styles[font.activeStyle];
            const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);
            y += labelFontSize + 15;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Inter, sans-serif" font-size="${labelFontSize}" fill="#4a5568" font-weight="600">${font.name} (${styleName})</text>\n`;
            y += 5;

            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontStyle.fontFamily}" font-size="${fontSize}" font-weight="${activeFontStyle.fontWeight}" font-style="${activeFontStyle.fontStyle}" fill="#1a202c">${sanitizedLine}</text>\n`;
            });
            if (fontIndex < selectedFonts.length - 1) y += lineHeight * 0.5;
        });

        const svgHeight = y + padding;
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${svgHeight}" style="background-color: #ffffff;">\n${svgTextElements}</svg>`;
        setPendingSvgContent(svgContent);
        setIsCustomerModalOpen(true);
    };

    const handleCustomerModalSubmit = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim() || !customerName.trim()) {
            showToast('Order Number and Customer Name are required.', 'error'); return;
        }
        setIsCustomerModalOpen(false);
        const filename = [formatForFilename(orderNumber), formatForFilename(customerName), customerCompany ? formatForFilename(customerCompany) : ''].filter(Boolean).join('_') + '.svg';
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
        } catch (error) { showToast(`Error saving file: ${error.message}`, 'error'); }
        try {
            const response = await fetch(`${WORKER_URL}/${filename}`, { method: 'PUT', headers: { 'Content-Type': 'image/svg+xml' }, body: pendingSvgContent });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            showToast('Proof uploaded successfully.');
        } catch (error) { showToast(`Upload failed: ${error.message}`, 'error', 6000); }
        setCustomerName(''); setCustomerCompany(''); setOrderNumber(''); setPendingSvgContent(null);
    };

    const glyphs = ['©', '®', '™', '&', '#', '+', '–', '—', '…', '•', '°', '·', '♥', '♡', '♦', '♢', '♣', '♧', '♠', '♤', '★', '☆', '♪', '♫', '←', '→', '↑', '↓', '∞', '†', '✡︎', '✞', '✠', '±', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

    return (
        <div className="app-layout">
            <aside className="branding-sidebar">
                <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="sidebar-logo" />
                <h1>ARCH FONT HUB</h1>
            </aside>

            <main className="main-container">
                <section className="card">
                    <div className="card-header">
                        <h2>Font Selection</h2>
                        <p>Click one or more fonts to add them to your proof.</p>
                    </div>
                    <div className="card-content">
                        {Object.entries(fontLibrary).map(([category, fonts]) => (
                            <div key={category} className="font-category">
                                <h3>{category}</h3>
                                <div className="font-button-grid">
                                    {fonts.map(font => {
                                        const isSelected = selectedFonts.some(f => f.name === font.name);
                                        const defaultStyle = font.styles[Object.keys(font.styles)[0]];
                                        return (
                                            <button
                                                key={font.name}
                                                onClick={() => handleFontSelect(font)}
                                                className={`font-button ${isSelected ? 'selected' : ''}`}
                                                style={{ fontFamily: defaultStyle.fontFamily, fontWeight: defaultStyle.fontWeight, fontStyle: defaultStyle.fontStyle }}
                                            >
                                                {font.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card">
                    <div className="card-header">
                        <div className="header-text-content">
                            <h2>Text to Preview</h2>
                            <p>Type your text here to see it in the selected fonts.</p>
                        </div>
                        <button className="symbol-button" onClick={() => setIsGlyphModalOpen(true)}>Symbols</button>
                    </div>
                    <div className="card-content">
                        <textarea
                            ref={textInputRef}
                            className="text-input"
                            value={customText}
                            onChange={e => setCustomText(e.target.value)}
                            onFocus={handleTextFocus}
                            onBlur={handleTextBlur}
                        />
                    </div>
                </section>

                <section className="card">
                    <div className="card-header">
                        <h2>Live Preview</h2>
                        <p>Adjust styles and font size for each selection below.</p>
                    </div>
                    <div className="card-content">
                        <div className="preview-controls">
                            <label htmlFor="fontSize">Font Size: <span>{fontSize}px</span></label>
                            <input type="range" id="fontSize" min="36" max="100" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                        </div>
                        <div className="preview-area">
                            {selectedFonts.length > 0 && customText.trim() && customText !== DEFAULT_PLACEHOLDER ? (
                                selectedFonts.map(font => (
                                    <div key={font.name} className="preview-item">
                                        <div className="preview-item-header">
                                            <span className="font-name-preview">{font.name}</span>
                                            <div className="style-selector">
                                                {Object.keys(font.styles).map(styleKey => (
                                                    <button key={styleKey} onClick={() => handleStyleChange(font.name, styleKey)} className={font.activeStyle === styleKey ? 'active' : ''}>
                                                        {styleKey}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="preview-text" style={{ ...font.styles[font.activeStyle], fontSize: `${fontSize}px` }}>
                                            {customText}
                                        </p>
                                    </div>
                                ))
                            ) : <div className="preview-placeholder">Your selected fonts will be previewed here.</div>}
                        </div>
                    </div>
                </section>

                <div className="submit-section">
                    <button className="submit-button" onClick={handleInitiateSave}>
                        <img src="/images/Arch Vector Logo White.svg" alt="Logo" className="submit-button-logo" />
                        Submit your selection to Arch Engraving
                    </button>
                </div>
            </main>

            <Modal isOpen={isGlyphModalOpen} onClose={() => setIsGlyphModalOpen(false)} title="Symbol Palette">
                <div className="glyph-palette">{glyphs.map(glyph => (<button key={glyph} onClick={() => handleGlyphInsert(glyph)}>{glyph}</button>))}</div>
            </Modal>

            <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Customer Information for SVG">
                <form onSubmit={handleCustomerModalSubmit} className="customer-form">
                    <div className="form-group"><label htmlFor="orderNumber">Order Number*</label><input id="orderNumber" type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="customerName">Customer Name*</label><input id="customerName" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="customerCompany">Company (Optional)</label><input id="customerCompany" type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} /></div>
                    <div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button><button type="submit" className="button-primary">Submit & Save</button></div>
                </form>
            </Modal>

            <div className="toast-container">{toasts.map(t => (<div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>))}</div>
        </div>
    );
};

export default App;