import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
    // --- Constants ---
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;

    // This font list is from the version you provided.
    const categorizedFonts = {
        'Sans-serif': [
            'Arial',
            'Calibri',
            'Century Gothic',
        ],
        'Serif': [
            'Benguiat',
            'Copperplate Gothic',
            'Garamond',
            'Times New Roman'
        ],
        'Script': [
            'I Love Glitter'
        ],
        'Display': [
            'Tinplate Titling Black'
        ],
        'Monospace': [
            'Zapf Humanist'
        ]
    };

    // --- State Management ---
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    // State needed for the Save-to-R2 functionality
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    // This useEffect is from your working version to handle font display
    useEffect(() => {
        const customFontsCss = `
          @font-face { font-family: 'Benguiat'; src: url('/fonts/Benguiat.ttf') format('truetype'); }
          @font-face { font-family: 'Copperplate Gothic'; src: url('/fonts/Copperplate%20Gothic.ttf') format('truetype'); }
          @font-face { font-family: 'I Love Glitter'; src: url('/fonts/I%20Love%20Glitter.ttf') format('truetype'); }
          @font-face { font-family: 'Arial'; src: url('/fonts/arial.ttf') format('truetype'); }
          @font-face { font-family: 'Calibri'; src: url('/fonts/CALIBRI.ttf') format('truetype'); }
          @font-face { font-family: 'Century Gothic'; src: url('/fonts/CenturyGothicPaneuropeanRegular.ttf') format('truetype'); }
          @font-face { font-family: 'Garamond'; src: url('/fonts/GARA.ttf') format('truetype'); }
          @font-face { font-family: 'Times New Roman'; src: url('/fonts/TIMES.ttf') format('truetype'); }
          @font-face { font-family: 'Tinplate Titling Black'; src: url('/fonts/Tinplate%20Titling%20Black.ttf') format('truetype'); }
          @font-face { font-family: 'Zapf Humanist'; src: url('/fonts/ZHUM601D.ttf') format('truetype'); }
        `;
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCss;
        document.head.appendChild(styleElement);
    }, []);

    // --- Helper & Event Handler Functions ---
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

    // --- WORKING SAVE FUNCTIONALITY ---
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
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            showMessage(`Could not save file locally: ${error.message}`);
        }

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

        setCustomerName(''); setCustomerCompany(''); setOrderNumber(''); setPendingSvgContent(null);
    };

    // --- Render Method ---
    return (
        <div className="app-container">
            {/* Customer Info Modal */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Enter Customer Information to Save SVG</h3>
                        <form onSubmit={handleCustomerModalSubmit}>
                            <div>
                                <label>Order Number<span style={{ color: 'red' }}>*</span>:</label>
                                <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                            </div>
                            <div>
                                <label>Customer Name<span style={{ color: 'red' }}>*</span>:</label>
                                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                            </div>
                            <div>
                                <label>Customer Company:</label>
                                <input type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} />
                            </div>
                            <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'flex-end', gap: '1em' }}>
                                <button type="button" className="message-button" style={{ background: '#aaa' }} onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                <button type="submit" className="message-button">Submit & Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* General Message Box */}
            {showMessageBox && (
                <div className="message-overlay">
                    <div className="message-box">
                        <p className="message-text">{message}</p>
                        <button onClick={() => setShowMessageBox(false)} className="message-button">OK</button>
                    </div>
                </div>
            )}

            <div className="main-content-wrapper">
                <header className="app-header">
                    <h1 className="header-title">Arch Font Hub</h1>
                    <p className="header-subtitle">Experiment with fonts and text display</p>
                </header>

                <main className="main-sections-container">
                    <section className="section-card">
                        <h2 className="section-title">1. Choose Your Fonts (Max 3)</h2>
                        <div className="font-grid-container custom-scrollbar">
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
                                    <div key={`preview-${font}`} className="border-b pb-4 last:border-b-0">
                                        <p className="preview-font-label">{font}:</p>
                                        <p className="preview-text" style={{ fontFamily: font }}>{customText}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="save-button-container">
                        <button onClick={handleSaveSvg} className="save-button">
                            Save Live Preview as SVG
                        </button>
                    </div>
                </main>

                <footer className="app-footer">
                    <p>&copy; 2023 Font Preview Simulator. All rights reserved.</p>
                </footer>
            </div>

            <style>{`
                /* Universal Styles */
                html {
                  min-height: 100vh;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  min-height: 100vh;
                  font-family: 'Inter', sans-serif;
                  color: #374151; /* gray-800 */
                  background: linear-gradient(to bottom right, #eef2ff, #d2e4f7); /* Adapted light blue gradient */
                  box-sizing: border-box;
                  overflow-x: hidden;
                  overflow-y: auto; /* Allow scrolling only if content overflows */
                  display: flex;
                  flex-direction: column;
                  align-items: center; /* Center horizontally */
                  justify-content: center; /* Center vertically if content doesn't fill height */
                }
                .app-container {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                  flex: 1; 
                  padding: 0.5rem;
                }
                @media (min-width: 640px) {
                  .app-container {
                    padding: 1rem;
                  }
                }
                .main-content-wrapper {
                  background-color: white;
                  border-radius: 0.75rem;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                  overflow: hidden;
                  width: 100%;
                  max-width: 1500px;
                }
                .app-header {
                  background-color: #2E7ABF;
                  color: white;
                  padding: 1rem;
                  text-align: center;
                  border-top-left-radius: 0.75rem;
                  border-top-right-radius: 0.75rem;
                }
                .header-title {
                  font-size: 1.5rem;
                  line-height: 2rem;
                  font-weight: 800;
                  letter-spacing: -0.05em;
                  margin: 0;
                }
                @media (min-width: 640px) {
                  .header-title {
                    font-size: 2rem;
                    line-height: 2.5rem;
                  }
                }
                .header-subtitle {
                  margin-top: 0.25rem;
                  color: #dbeafe;
                  font-size: 1rem;
                  line-height: 1.5rem;
                }
                .main-sections-container {
                  padding: 1rem;
                  display: flex;
                  flex-direction: column;
                  gap: 1.5rem;
                }
                @media (min-width: 640px) {
                  .main-sections-container {
                    padding: 1.5rem;
                  }
                }
                .section-card, .preview-section-card, .saved-output-section {
                  background-color: #f9fafb;
                  padding: 1rem;
                  border-radius: 0.5rem;
                  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
                  border: 1px solid #cfe2f7;
                }
                .preview-section-card {
                  background-color: white;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .saved-output-section {
                  background-color: #e6f0fa;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  border-color: #9ac2e6;
                }
                .section-title {
                  font-size: 1.25rem;
                  line-height: 1.75rem;
                  font-weight: 700;
                  color: #2E7ABF;
                  margin-bottom: 0.75rem;
                }
                .font-grid-container {
                  padding-right: 0;
                }
                .font-category {
                  margin-bottom: 1rem;
                }
                .font-category-title {
                  font-size: 1.125rem;
                  font-weight: 600;
                  color: #2E7ABF;
                  margin-bottom: 0.5rem;
                  border-bottom: 2px solid #57A3E1;
                  padding-bottom: 0.25rem;
                }
                .font-buttons-grid {
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 0.5rem;
                }
                @media (min-width: 640px) {
                  .font-buttons-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                  }
                }
                @media (min-width: 768px) {
                  .font-buttons-grid {
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                  }
                }
                .font-button {
                  padding: 0.5rem;
                  border-radius: 0.375rem;
                  border: 2px solid #57A3E1;
                  transition: all 200ms ease-in-out;
                  background-color: white;
                  color: #181717;
                  font-weight: 500;
                  font-size: 0.75rem;
                  line-height: 1rem;
                  cursor: pointer;
                  outline: none;
                }
                .font-button:hover {
                  background-color: #d2e4f7;
                  border-color: #2E7ABF;
                }
                .font-button-selected {
                  background-color: #2E7ABF;
                  color: white;
                  border-color: #181717;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                  transform: scale(1.05);
                }
                .text-input {
                  width: 100%;
                  padding: 0.75rem;
                  border: 1px solid #57A3E1;
                  border-radius: 0.5rem;
                  outline: none;
                  transition: all 200ms;
                  font-size: 1rem;
                  line-height: 1.5rem;
                  resize: vertical;
                  min-height: 80px;
                }
                .text-input:focus {
                  box-shadow: 0 0 0 2px #57A3E1;
                  border-color: transparent;
                }
                .preview-text-container, .output-text-container {
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;
                }
                .empty-preview-message {
                  color: #6b7280;
                  font-style: italic;
                  text-align: center;
                  padding-top: 0.5rem;
                  padding-bottom: 0.5rem;
                }
                .preview-text-item, .output-text-item {
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 0.75rem;
                }
                .preview-text-item:last-child, .output-text-item:last-child {
                  border-bottom: none;
                }
                .preview-font-label, .output-font-label {
                  font-size: 0.875rem;
                  color: #4b5563;
                  margin-bottom: 0.25rem;
                  font-weight: 600;
                }
                .preview-text, .output-text {
                  font-size: 1.25rem;
                  line-height: 1.75rem;
                  word-break: break-word;
                  line-height: 1.625;
                  margin: 0;
                }
                @media (min-width: 640px) {
                  .preview-text, .output-text {
                    font-size: 1.5rem;
                    line-height: 2rem;
                  }
                }
                .output-description {
                  color: #6b7280;
                  margin-bottom: 0.75rem;
                }
                .save-button-container {
                  text-align: center;
                  margin-top: 1rem;
                }
                .save-button {
                  padding: 0.75rem 1.5rem;
                  background-color: #57A3E1;
                  color: #181717;
                  font-size: 1rem;
                  line-height: 1.5rem;
                  font-weight: 700;
                  border-radius: 9999px;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  transition: all 300ms ease-in-out;
                  cursor: pointer;
                  border: none;
                  outline: none;
                }
                .save-button:hover {
                  background-color: #2E7ABF;
                  transform: scale(1.05);
                }
                .save-button:active {
                  transform: scale(0.95);
                }
                .save-button:focus {
                  box-shadow: 0 0 0 4px #57A3E1;
                }
                .app-footer {
                  background-color: #181717;
                  color: white;
                  padding: 0.75rem;
                  text-align: center;
                  font-size: 0.75rem;
                  line-height: 1rem;
                  border-bottom-left-radius: 0.75rem;
                  border-bottom-right-radius: 0.75rem;
                }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-box { background: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 2px 16px rgba(0,0,0,0.2); min-width: 320px; max-width: 500px; width: 90%; color: #333; }
                .modal-box h3 { margin-top: 0; color: #2E7ABF; }
                .modal-box label { display: block; margin-bottom: 0.5em; font-weight: 600; text-align: left; }
                .modal-box input { width: 100%; padding: 0.8em; margin-bottom: 1em; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                .message-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 50; background-color: rgba(0, 0, 0, 0.3); }
                .message-box { background-color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #57A3E1; text-align: center; }
                .message-text { font-size: 1rem; font-weight: 600; color: #2E7ABF; margin-bottom: 0.75rem; }
                .message-button { margin-top: 0.75rem; padding: 0.4rem 1rem; background-color: #2E7ABF; color: white; border-radius: 0.375rem; transition: background-color 300ms; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); cursor: pointer; border: none; outline: none; }
                .message-button:hover { background-color: #57A3E1; }
            `}</style>
        </div>
    );
};

export default App;
