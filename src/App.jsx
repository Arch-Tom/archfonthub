import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- Constants ---
const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here to see a live preview.';
const MAX_SELECTED_FONTS = 3;
const CLOUDFLARE_WORKER_URL = 'https://arch-worker.tom-4a9.workers.dev';

// --- Font Data ---
// This now includes the path to the font file for fetching.
const categorizedFonts = {
    'Sans-serif': [
        { name: 'Arial', path: null },
        { name: 'Calibri', path: null },
        { name: 'Century Gothic', path: null },
        { name: 'Verdana', path: null },
    ],
    'Serif': [
        { name: 'Benguiat', path: '/fonts/Benguiat-Regular.woff' },
        { name: 'Copperplate Gothic', path: null },
        { name: 'Garamond', path: null },
        { name: 'Times New Roman', path: null },
        { name: 'Zapf Humanist', path: '/fonts/Zapf-Humanist.woff' },
    ],
    'Script': [
        { name: 'I Love Glitter', path: '/fonts/I-Love-Glitter.woff' },
    ],
    'Display': [
        { name: 'Tinplate Titling Black', path: '/fonts/Tinplate-Titling-Black.woff' },
    ],
    'Monospace': [
        { name: 'Courier New', path: null },
        { name: 'Lucida Console', path: null },
    ]
};

// --- Helper function to convert binary data to Base64 ---
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// --- Main App Component ---
const App = () => {
    // --- State ---
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);
    const [fontDataUris, setFontDataUris] = useState({}); // State to hold font Data URIs
    const previewSectionRef = useRef(null);

    // --- Effects ---
    // Effect to inject custom font styles for the live preview
    useEffect(() => {
        const customFontsCssContent = `
            @font-face { font-family: 'Benguiat'; src: url('/fonts/Benguiat-Regular.woff') format('woff'); }
            @font-face { font-family: 'I Love Glitter'; src: url('/fonts/I-Love-Glitter.woff') format('woff'); }
            @font-face { font-family: 'Tinplate Titling Black'; src: url('/fonts/Tinplate-Titling-Black.woff') format('woff'); }
            @font-face { font-family: 'Zapf Humanist'; src: url('/fonts/Zapf-Humanist.woff') format('woff'); }
        `;
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCssContent;
        document.head.appendChild(styleElement);
        return () => { document.head.removeChild(styleElement); };
    }, []);

    // Effect to fetch fonts and convert them to Data URIs on component mount
    useEffect(() => {
        const fetchFontData = async () => {
            const allFonts = Object.values(categorizedFonts).flat();
            const customFonts = allFonts.filter(font => font.path);
            const dataUris = {};

            for (const font of customFonts) {
                try {
                    const response = await fetch(font.path);
                    if (!response.ok) throw new Error(`Could not fetch ${font.path}`);
                    const buffer = await response.arrayBuffer();
                    const base64 = arrayBufferToBase64(buffer);
                    dataUris[font.name] = `data:font/woff;base64,${base64}`;
                } catch (error) {
                    console.error(`Failed to load font ${font.name}:`, error);
                }
            }
            setFontDataUris(dataUris);
        };
        fetchFontData();
    }, []);


    // --- Helper Functions ---
    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => { setShowMessageBox(false); setMessage(''); }, duration);
    };

    // --- Event Handlers ---
    const handleFontSelect = (fontName) => {
        setSelectedFonts(prev => {
            if (prev.includes(fontName)) {
                return prev.filter(f => f !== fontName);
            }
            if (prev.length < MAX_SELECTED_FONTS) {
                return [...prev, fontName];
            }
            showMessage(`You can select a maximum of ${MAX_SELECTED_FONTS} fonts.`);
            return prev;
        });
    };

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFocus = () => { if (customText === DEFAULT_TEXT_PLACEHOLDER) setCustomText(''); };
    const handleBlur = () => { if (customText.trim() === '') setCustomText(DEFAULT_TEXT_PLACEHOLDER); };

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

        // Build the <style> block with embedded font data
        let fontFaceStyles = '';
        const fontsToEmbed = selectedFonts.filter(fontName => fontDataUris[fontName]);

        fontsToEmbed.forEach(fontName => {
            fontFaceStyles += `@font-face { font-family: '${fontName}'; src: url('${fontDataUris[fontName]}') format('woff'); }\n`;
        });

        // Build the <text> elements
        let svgTextElements = '';
        const lineHeight = 40;
        const mainFontSize = 32;
        const labelFontSize = 16;
        const padding = 20;
        let y = padding;

        selectedFonts.forEach((font, fontIndex) => {
            // Add font name as a label
            y += labelFontSize + 5; // Add space for the label
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#888">${font}</text>\n`;
            y += lineHeight * 0.5; // Space between label and text

            // Add the user's text rendered in the selected font
            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${mainFontSize}" fill="#181717">${sanitizedLine}</text>\n`;
            });

            if (fontIndex < selectedFonts.length - 1) {
                y += lineHeight * 0.75; // Extra space between font groups
            }
        });

        // Assemble the final SVG
        const svgWidth = 800;
        const svgHeight = y + padding; // Adjust height based on content
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n<style>${fontFaceStyles}</style>\n${svgTextElements}</svg>`;

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

        // Local Save
        try {
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('SVG saved locally. Now uploading...');
        } catch (error) { showMessage(`Could not save file locally: ${error.message}`); }

        // Upload to Cloudflare Worker
        try {
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'image/svg+xml', 'X-Filename': filename },
                body: pendingSvgContent
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status ${response.status}. ${errorText}`);
            }
            showMessage('SVG uploaded successfully!', 5000);
        } catch (error) {
            console.error('Upload error:', error);
            showMessage(`Error uploading SVG: ${error.message}`, 6000);
        }

        // Reset fields
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
                            {/* Form inputs... */}
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

            {/* Message Box */}
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
                    <h1 className="header-title">ArchFontHub</h1>
                    <p className="header-subtitle">Your go-to tool for font previews and outputs.</p>
                </header>

                <main className="main-sections-container">
                    <div className="top-sections-wrapper">
                        {/* Font Selection Section */}
                        <section className="section-card font-grid-container custom-scrollbar">
                            <h2 className="section-title">1. Select up to 3 Fonts</h2>
                            {Object.entries(categorizedFonts).map(([category, fonts]) => (
                                <div key={category} className="font-category">
                                    <h3 className="font-category-title">{category}</h3>
                                    <div className="font-buttons-grid">
                                        {fonts.map(font => (
                                            <button
                                                key={font.name}
                                                onClick={() => handleFontSelect(font.name)}
                                                className={`font-button ${selectedFonts.includes(font.name) ? 'font-button-selected' : ''}`}
                                                style={{ fontFamily: font.name }}
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Text Input Section */}
                        <section className="section-card">
                            <h2 className="section-title">2. Enter Your Text</h2>
                            <textarea
                                className="text-input"
                                value={customText}
                                onChange={handleTextChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            />
                        </section>
                    </div>

                    {/* Live Preview Section */}
                    <section className="preview-section-card" ref={previewSectionRef}>
                        <h2 className="section-title">3. Live Preview</h2>
                        <div className="preview-text-container">
                            {selectedFonts.length > 0 && customText.trim() !== '' && customText !== DEFAULT_TEXT_PLACEHOLDER ? (
                                selectedFonts.map(font => (
                                    <div key={font} className="preview-text-item">
                                        <div className="preview-font-label" style={{ fontFamily: font }}>{font}</div>
                                        <p className="preview-text" style={{ fontFamily: font }}>
                                            {customText.split('\n').map((line, index) => (
                                                <React.Fragment key={index}>{line}<br /></React.Fragment>
                                            ))}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-preview-message">Select a font and type some text to see a preview.</p>
                            )}
                        </div>
                    </section>
                    <div className="save-button-container">
                        <button onClick={handleSaveSvg} className="save-button">
                            Save Live Preview as SVG
                        </button>
                    </div>
                </main>
                <footer className="app-footer">
                    &copy; {new Date().getFullYear()} ArchFontHub. All Rights Reserved.
                </footer>
            </div>

            {/* In-component style for modal */}
            <style>{`
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-box { background: #fff; padding: 2em; border-radius: 8px; box-shadow: 0 2px 16px rgba(0,0,0,0.2); min-width: 320px; max-width: 500px; width: 90%; color: #333; }
                .modal-box h3 { margin-top: 0; color: #2E7ABF; }
                .modal-box label { display: block; margin-bottom: 0.5em; font-weight: 600; text-align: left; }
                .modal-box input { width: 100%; padding: 0.8em; margin-bottom: 1em; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            `}</style>
        </div>
    );
};

export default App;