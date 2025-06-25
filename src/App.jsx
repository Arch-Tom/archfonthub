import React, { useState, useRef } from 'react';
import './App.css'; // We will use a new CSS file for the redesign

// --- Helper Icons for the new UI ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);


// --- FONT LIBRARY (Unchanged from your original file) ---
const fontLibrary = {
    'Sans-serif': [{ name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } }, { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } }, { name: 'Berlin Sans FB', styles: { regular: 'BerlinSansFB-Reg', bold: 'BerlinSansFB-Bold' } }, { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } }, { name: 'Century Gothic', styles: { regular: 'CenturyGothicPaneuropean', bold: 'CenturyGothicPaneuropean-Bold', boldItalic: 'CenturyGothicPaneuropean-BoldItalic' } }, { name: 'Graphik', styles: { thin: 'Graphik-Thin', regular: 'Graphik-Regular', medium: 'Graphik-Medium', semibold: 'Graphik-Semibold', thinItalic: 'Graphik-ThinItalic', regularItalic: 'Graphik-RegularItalic', mediumItalic: 'Graphik-MediumItalic' } }, { name: 'Zapf Humanist', styles: { demi: 'ZapfHumanist601BT-Demi' } },],
    'Serif': [{ name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BenguiatITCbyBT-Bold', italic: 'BenguiatITCbyBT-BookItalic' } }, { name: 'Century Schoolbook', styles: { regular: 'CenturySchoolbook', bold: 'CenturySchoolbook-Bold', boldItalic: 'CenturySchoolbook-BoldItalic' } }, { name: 'CopprplGoth BT', styles: { regular: 'CopperplateGothicBT-Roman' } }, { name: 'Garamond', styles: { regular: 'Garamond' } }, { name: 'Garamond 3 LT Std', styles: { regular: 'Garamond3LTStd', bold: 'Garamond3LTStd-Bold', italic: 'Garamond3LTStd-Italic', boldItalic: 'Garamond3LTStd-BoldItalic' } }, { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },],
    'Script': [{ name: 'Amazone BT', styles: { regular: 'AmazoneBT-Regular' } }, { name: 'Angelface', styles: { regular: 'Angelface' } }, { name: 'Birds of Paradise', styles: { regular: 'BirdsofParadise-PersonaluseOnly' } }, { name: 'Clicker Script', styles: { regular: 'ClickerScript-Regular' } }, { name: 'Courgette', styles: { regular: 'Courgette-Regular' } }, { name: 'Freebooter Script', styles: { regular: 'FreebooterScript' } }, { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } }, { name: 'Honey Script', styles: { light: 'HoneyScript-Light', semiBold: 'HoneyScript-SemiBold' } }, { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } }, { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } }, { name: 'Lisbon Script', styles: { regular: 'LisbonScript-Regular' } }, { name: 'Murray Hill', styles: { regular: 'MurrayHill' } },],
    'Display': [{ name: 'BlackChancery', styles: { regular: 'BlackChancery' } }, { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } }, { name: 'Cowboy Rodeo', styles: { regular: 'CowboyRodeoW01-Regular' } }, { name: 'Machine BT', styles: { regular: 'MachineITCbyBT-Regular' } }, { name: 'Old English Text MT', styles: { regular: 'OldEnglishTextMT' } }, { name: 'Planscribe', styles: { regular: 'PlanscribeNFW01-Regular' } }, { name: 'Tinplate Titling Black', styles: { regular: 'TinplateTitlingBlack' } },]
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
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');
    const [fontSize, setFontSize] = useState(48);
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

    const handleSaveSvg = () => {
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
            const activeFontFamily = font.styles[font.activeStyle];
            const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);
            y += labelFontSize + 15;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Inter, sans-serif" font-size="${labelFontSize}" fill="#4a5568" font-weight="600">${font.name} (${styleName})</text>\n`;
            y += 5;

            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#1a202c">${sanitizedLine}</text>\n`;
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
            showToast('Order Number and Customer Name are required.', 'error');
            return;
        }
        setIsCustomerModalOpen(false);
        const filename = [formatForFilename(orderNumber), formatForFilename(customerName), customerCompany ? formatForFilename(customerCompany) : ''].filter(Boolean).join('_') + '.svg';

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
            const response = await fetch(`${WORKER_URL}/${filename}`, { method: 'PUT', headers: { 'Content-Type': 'image/svg+xml' }, body: pendingSvgContent });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            showToast('Proof uploaded successfully.');
        } catch (error) {
            showToast(`Upload failed: ${error.message}`, 'error', 6000);
        }

        setCustomerName(''); setCustomerCompany(''); setOrderNumber(''); setPendingSvgContent(null);
    };

    const glyphs = ['©', '®', '™', '…', '•', '°', '·', '♥', '★', '→', '∞', '†', '½', '¼', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="logo" />
                    <h1 className="sidebar-title">ARCH FONT HUB</h1>
                </div>
                <div className="sidebar-content">
                    {Object.entries(fontLibrary).map(([category, fonts]) => (
                        <div key={category} className="font-category">
                            <h2 className="font-category-title">{category}</h2>
                            <div className="font-grid">
                                {fonts.map(font => {
                                    const isSelected = selectedFonts.some(f => f.name === font.name);
                                    const defaultStyle = font.styles[Object.keys(font.styles)[0]];
                                    return (
                                        <button key={font.name} onClick={() => handleFontSelect(font)} className={`font-card ${isSelected ? 'selected' : ''}`}>
                                            <span className="font-card-name" style={{ fontFamily: defaultStyle }}>{font.name}</span>
                                            <div className="font-card-icon">{isSelected ? <CheckIcon /> : <PlusIcon />}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
            <main className="main-content">
                <div className="card text-input-card">
                    <div className="card-header">
                        <h2>Text to Preview</h2>
                        <button className="button-glyph" onClick={() => setIsGlyphModalOpen(true)}>Ω</button>
                    </div>
                    <textarea ref={textInputRef} className="text-input" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Type your text..." />
                </div>
                <div className="card preview-card">
                    <div className="card-header with-slider">
                        <h2>Live Preview</h2>
                        <div className="font-size-control">
                            <label htmlFor="fontSize">Size: {fontSize}px</label>
                            <input type="range" id="fontSize" min="20" max="150" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="preview-area">
                        {selectedFonts.length > 0 && customText.trim() !== '' ? (
                            selectedFonts.map(font => (
                                <div key={font.name} className="preview-item">
                                    <div className="preview-item-header">
                                        <span className="preview-font-name">{font.name}</span>
                                        <div className="style-selector">
                                            {Object.keys(font.styles).map(styleKey => (
                                                <button key={styleKey} onClick={() => handleStyleChange(font.name, styleKey)} className={font.activeStyle === styleKey ? 'active' : ''}>{styleKey}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="preview-text" style={{ fontFamily: font.styles[font.activeStyle], fontSize: `${fontSize}px` }}>{customText}</p>
                                </div>
                            ))
                        ) : (
                            <div className="preview-placeholder">Select a font and enter text to see a preview.</div>
                        )}
                    </div>
                </div>
            </main>

            <button className="save-fab" onClick={handleSaveSvg} disabled={selectedFonts.length === 0 || !customText.trim()} title="Generate Proof & Save SVG">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.522a.75.75 0 00.5.707c1.707.44 3.282.555 4.75.555A9.735 9.735 0 0012 21a9.707 9.707 0 005.25-1.467.75.75 0 00.5-.707V4.25a.75.75 0 00-.5-.707A9.735 9.735 0 0012 3a9.707 9.707 0 00-.75.033zM13.5 7.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" /></svg>
                <span>Generate Proof</span>
            </button>

            <Modal isOpen={isGlyphModalOpen} onClose={() => setIsGlyphModalOpen(false)} title="Glyph Palette">
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