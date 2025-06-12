import React, { useState, useEffect, useRef } from 'react';
import './App.css'

const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

const App = () => {
    // ...existing font and state declarations...
    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic'],
        'Serif': ['Benguiat', 'Copperplate Gothic', 'Garamond', 'Times New Roman', 'Zapf Humanist'],
        'Script': ['I Love Glitter'],
        'Display': ['Tinplate Titling Black'],
        'Monospace': []
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [savedOutput, setSavedOutput] = useState([]);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    // Modal state
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    const previewSectionRef = useRef(null);

    // ...font-face CSS and useEffect remain unchanged...

    const customFontsCssContent = `
    /* ...font-face rules... */
    `;
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCssContent;
        document.head.appendChild(styleElement);
    }, []);

    // Helper to sanitize filename
    const formatForFilename = (str) =>
        str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    // Font selection, text change, focus/blur handlers remain unchanged...

    const handleFontSelect = (font) => {
        if (selectedFonts.includes(font)) {
            setSelectedFonts(selectedFonts.filter((f) => f !== font));
        } else {
            if (selectedFonts.length < 3) {
                setSelectedFonts([...selectedFonts, font]);
            } else {
                showMessage('You can select a maximum of 3 fonts.');
            }
        }
    };

    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFocus = () => {
        if (customText === DEFAULT_TEXT_PLACEHOLDER) setCustomText('');
    };
    const handleBlur = () => {
        if (customText.trim() === '') setCustomText(DEFAULT_TEXT_PLACEHOLDER);
    };

    // Show modal instead of saving SVG immediately
    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select fonts and enter text to generate SVG.');
            return;
        }
        // Build SVG content
        const lines = customText.split('\n');
        const lineHeight = 40;
        const fontSize = 32;
        const padding = 20;
        const svgWidth = 800;
        const svgHeight = selectedFonts.length * lines.length * lineHeight + padding * 2;
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">\n`;
        let y = padding + fontSize;
        selectedFonts.forEach((font) => {
            lines.forEach((line) => {
                if (line.trim() !== '') {
                    svgContent += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${fontSize}" fill="#181717">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
                    y += lineHeight;
                }
            });
            y += lineHeight / 2;
        });
        svgContent += '</svg>';
        setPendingSvgContent(svgContent);
        setShowCustomerModal(true);
    };

    // Modal submit handler
    const handleCustomerModalSubmit = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim() || !customerName.trim()) {
            showMessage('Order Number and Customer Name are required.');
            return;
        }
        setShowCustomerModal(false);

        // Format filename
        const order = formatForFilename(orderNumber);
        const name = formatForFilename(customerName);
        const company = customerCompany.trim() ? formatForFilename(customerCompany) : '';
        const filename = [order, name, company].filter(Boolean).join('_') + '.svg';

        // Save locally
        const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Upload to Cloudflare Worker
        try {
            const response = await fetch('https://arch-worker.tom-4a9.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'X-Filename': filename
                },
                body: pendingSvgContent
            });
            if (!response.ok) throw new Error('Failed to upload SVG to Cloudflare Worker.');
            showMessage('SVG uploaded successfully.');
        } catch (error) {
            showMessage(`Error uploading SVG: ${error.message}`);
        }
        setCustomerName('');
        setCustomerCompany('');
        setOrderNumber('');
        setPendingSvgContent(null);
    };

    const showMessage = (msg) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessage('');
        }, 3000);
    };

    return (
        <div className="app-container">
            {/* Customer Info Modal */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Enter Customer Information</h3>
                        <form onSubmit={handleCustomerModalSubmit}>
                            <div>
                                <label>Order Number<span style={{color:'red'}}>*</span>:</label>
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={e => setOrderNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Customer Name<span style={{color:'red'}}>*</span>:</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Customer Company:</label>
                                <input
                                    type="text"
                                    value={customerCompany}
                                    onChange={e => setCustomerCompany(e.target.value)}
                                />
                            </div>
                            <div style={{marginTop: '1em'}}>
                                <button type="submit" className="save-button" style={{marginRight: '1em'}}>Submit</button>
                                <button type="button" className="save-button" style={{background:'#aaa'}} onClick={() => setShowCustomerModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ...existing message box and main content... */}
            {showMessageBox && (
                <div className="message-overlay">
                    <div className="message-box">
                        <p className="message-text">{message}</p>
                        <button
                            onClick={() => setShowMessageBox(false)}
                            className="message-button"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* ...rest of your JSX remains unchanged... */}
            <div className="main-content-wrapper">
                {/* ...header, main, footer... */}
                {/* Replace your Save button with: */}
                <div className="save-button-container">
                    <button
                        onClick={handleSaveSvg}
                        className="save-button"
                        style={{ backgroundColor: '#28a745' }}
                    >
                        Save Live Preview as SVG
                    </button>
                </div>
                {/* ...rest of your JSX... */}
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-box {
                    background: #fff;
                    padding: 2em;
                    border-radius: 8px;
                    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
                    min-width: 320px;
                }
                .modal-box label {
                    display: block;
                    margin-bottom: 0.2em;
                }
                .modal-box input {
                    width: 100%;
                    padding: 0.5em;
                    margin-bottom: 1em;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default App;