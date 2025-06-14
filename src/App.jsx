// Full App.jsx with Font Fixes
import React, { useState, useEffect, useRef } from 'react';

const App = () => {
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;
    const WORKER_URL = 'https://customerfontselection-worker.tom-4a9.workers.dev';

    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic'],
        'Serif': ['Benguiat Book BT', 'Copperplate Gothic', 'Garamond', 'Times New Roman'],
        'Script': ['I Love Glitter'],
        'Display': ['Tinplate Titling Black'],
        'Monospace': ['Zapf Humanist']
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    useEffect(() => {
        const customFontsCss = `
      @font-face { font-family: 'Benguiat Book BT'; src: url('/fonts/Benguiat.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Copperplate Gothic'; src: url('/fonts/Copperplate Gothic.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'I Love Glitter'; src: url('/fonts/I Love Glitter.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Arial'; src: url('/fonts/arial.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Calibri'; src: url('/fonts/CALIBRI.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Century Gothic'; src: url('/fonts/CenturyGothicPaneuropeanRegular.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Garamond'; src: url('/fonts/GARA.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Times New Roman'; src: url('/fonts/TIMES.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Tinplate Titling Black'; src: url('/fonts/Tinplate Titling Black.ttf') format('truetype'); font-display: swap; }
      @font-face { font-family: 'Zapf Humanist'; src: url('/fonts/ZHUM601D.ttf') format('truetype'); font-display: swap; }
    `;
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCss;
        document.head.appendChild(styleElement);
    }, []);

    const handleFontSelect = (font) => {
        if (selectedFonts.includes(font)) {
            setSelectedFonts(selectedFonts.filter((f) => f !== font));
        } else {
            if (selectedFonts.length < MAX_SELECTED_FONTS) {
                setSelectedFonts([...selectedFonts, font]);
            } else {
                showMessage(`You can select a maximum of ${MAX_SELECTED_FONTS} fonts.`);
            }
        }
    };

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFocus = () => { if (customText === DEFAULT_TEXT_PLACEHOLDER) setCustomText(''); };
    const handleBlur = () => { if (customText.trim() === '') setCustomText(DEFAULT_TEXT_PLACEHOLDER); };

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => { setShowMessageBox(false); setMessage(''); }, duration);
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select at least one font and enter some text to save an SVG.');
            return;
        }

        const lines = customText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            showMessage('Please enter some text to save an SVG.');
            return;
        }

        let svgTextElements = '';
        const lineHeight = 40;
        const mainFontSize = 32;
        const labelFontSize = 16;
        const padding = 20;
        let y = padding;

        selectedFonts.forEach((font, fontIndex) => {
            y += labelFontSize + 5;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#888">${font}</text>\n`;
            y += lineHeight * 0.5;
            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${mainFontSize}" fill="#181717">${sanitizedLine}</text>\n`;
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

        const order = formatForFilename(orderNumber);
        const name = formatForFilename(customerName);
        const company = customerCompany.trim() ? formatForFilename(customerCompany) : '';
        const filename = [order, name, company].filter(Boolean).join('_') + '.svg';

        try {
            const response = await fetch(`${WORKER_URL}/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: pendingSvgContent
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status ${response.status}. ${errorText}`);
            }
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

    return (
        <div>
            {/* Message Box */}
            {showMessageBox && (
                <div className="message-overlay">
                    <div className="message-box">
                        <p className="message-text">{message}</p>
                        <button onClick={() => setShowMessageBox(false)} className="message-button">OK</button>
                    </div>
                </div>
            )}

            {/* Customer Info Modal */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Enter Customer Information to Save SVG</h3>
                        <form onSubmit={handleCustomerModalSubmit}>
                            <label>Order Number<span style={{ color: 'red' }}>*</span>:</label>
                            <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                            <label>Customer Name<span style={{ color: 'red' }}>*</span>:</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            <label>Customer Company:</label>
                            <input type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} />
                            <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'flex-end', gap: '1em' }}>
                                <button type="button" className="message-button" style={{ background: '#aaa' }} onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                <button type="submit" className="message-button">Submit & Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Font Selection UI */}
            <div className="app-container">
                <header className="app-header">
                    <h1 className="header-title">Arch Font Hub</h1>
                    <p className="header-subtitle">Experiment with fonts and text display</p>
                </header>

                <main className="main-sections-container">
                    <section className="section-card">
                        <h2 className="section-title">1. Choose Your Fonts (Max 3)</h2>
                        <div className="font-grid-container">
                            {Object.keys(categorizedFonts).map(category => (
                                <div key={category} className="font-category">
                                    <h3 className="font-category-title">{category}</h3>
                                    <div className="font-buttons-grid">
                                        {categorizedFonts[category].map((font) => (
                                            <button
                                                key={font}
                                                onClick={() => handleFontSelect(font)}
                                                className={`font-button ${selectedFonts.includes(font) ? 'font-button-selected' : ''}`}
                                                style={{ fontFamily: font }}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="section-card">
                        <h2 className="section-title">2. Enter Your Custom Text</h2>
                        <textarea
                            className="text-input"
                            value={customText}
                            onChange={handleTextChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            style={{ fontFamily: 'Arial' }}
                        />
                    </section>

                    <section className="preview-section-card">
                        <h2 className="section-title">3. Live Preview</h2>
                        {selectedFonts.length === 0 ? (
                            <p className="empty-preview-message">Select up to 3 fonts to see a live preview.</p>
                        ) : (
                            <div className="preview-text-container">
                                {selectedFonts.map((font) => (
                                    <div key={`preview-${font}`} className="preview-text-item">
                                        <p className="preview-font-label">{font}:</p>
                                        <p className="preview-text" style={{ fontFamily: font }}>{customText}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="save-button-container">
                        <button onClick={handleSaveSvg} className="save-button">Save Live Preview as SVG</button>
                    </div>
                </main>

                <footer className="app-footer">
                    <p>&copy; {new Date().getFullYear()} Font Preview Simulator. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
