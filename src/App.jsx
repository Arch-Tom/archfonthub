import React, { useState } from 'react';
import './App.css';

const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;

    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic'],
        'Serif': ['Benguiat', 'Copperplate Gothic', 'Garamond', 'Times New Roman'],
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

    const handleFontSelect = (font) => {
        setSelectedFonts(prev =>
            prev.includes(font)
                ? prev.filter(f => f !== font)
                : (prev.length < MAX_SELECTED_FONTS ? [...prev, font] : (showMessage(`You can select a maximum of ${MAX_SELECTED_FONTS} fonts.`), prev))
        );
    };

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFocus = () => { if (customText === DEFAULT_TEXT_PLACEHOLDER) setCustomText(''); };
    const handleBlur = () => { if (customText.trim() === '') setCustomText(DEFAULT_TEXT_PLACEHOLDER); };

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
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
            y += labelFontSize + 10;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">${font}</text>\n`;
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

        const filename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_') + '.svg';

        // Save file locally
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

        // Upload to Cloudflare R2
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

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-title">ARCH<br />FONT HUB</div>
                <div className="sidebar-desc">Experiment with fonts and text display</div>
            </aside>

            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Enter Customer Information to Save SVG</h3>
                        <form onSubmit={handleCustomerModalSubmit}>
                            <div>
                                <label htmlFor="orderNumber">Order Number<span style={{ color: 'red' }}>*</span>:</label>
                                <input id="orderNumber" type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="customerName">Customer Name<span style={{ color: 'red' }}>*</span>:</label>
                                <input id="customerName" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="customerCompany">Customer Company (Optional):</label>
                                <input id="customerCompany" type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} />
                            </div>
                            <div className="button-group">
                                <button type="button" className="cancel-button" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                <button type="submit">Submit & Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMessageBox && (
                <div className="modal-overlay">
                    <div className="message-box modal-box">
                        <p className="message-text">{message}</p>
                        <button onClick={() => setShowMessageBox(false)} className="message-button">OK</button>
                    </div>
                </div>
            )}

            <div className="main-content">
                <section className="section-card">
                    <h2 className="section-title">1?? Choose Your Fonts (Max {MAX_SELECTED_FONTS})</h2>
                    <div className="font-grid-container">
                        {Object.entries(categorizedFonts).map(([category, fonts]) => (
                            <div key={category} className="font-category">
                                <h3 className="font-category-title">{category}</h3>
                                <div className="font-buttons-grid">
                                    {fonts.map((font) => (
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
                    <h2 className="section-title">2?? Enter Your Custom Text</h2>
                    <textarea
                        className="text-input"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                        value={customText}
                        onChange={handleTextChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={DEFAULT_TEXT_PLACEHOLDER}
                    />
                </section>

                <section className="section-card">
                    <h2 className="section-title">3?? Live Preview</h2>
                    {selectedFonts.length === 0 && customText === DEFAULT_TEXT_PLACEHOLDER ? (
                        <p className="empty-preview-message">Select up to 3 fonts and enter text to see a live preview.</p>
                    ) : (
                        <div className="preview-text-container">
                            {selectedFonts.map((font) => (
                                <div key={`preview-${font}`}>
                                    <p className="preview-font-label">{font}:</p>
                                    <p className="preview-text" style={{ fontFamily: font }}>{customText}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <button className="save-button" onClick={handleSaveSvg}>
                    Submit Fonts to Arch Engraving
                </button>
            </div>
        </div>
    );
};

export default App;
