import React, { useState, useEffect, useRef } from 'react';

// Define a constant for the default text
const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

// Main App Component
const App = () => {
    // Pre-defined list of fonts, now including Benguiat, Copperplate Gothic, and I Love Glitter
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

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [savedOutput, setSavedOutput] = useState([]);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const previewSectionRef = useRef(null);

    const customFontsCssContent = `
    @font-face {
      font-family: 'Benguiat';
      src: url('/fonts/Benguiat.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Copperplate Gothic';
      src: url('/fonts/Copperplate%20Gothic.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'I Love Glitter';
      src: url('/fonts/I%20Love%20Glitter.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Arial';
      src: url('/fonts/arial.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Calibri';
      src: url('/fonts/CALIBRI.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Century Gothic';
      src: url('/fonts/CenturyGothicPaneuropeanRegular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Garamond';
      src: url('/fonts/GARA.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Times New Roman';
      src: url('/fonts/TIMES.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Tinplate Titling Black';
      src: url('/fonts/Tinplate%20Titling%20Black.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Zapf Humanist';
      src: url('/fonts/ZHUM601D.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCssContent;
        document.head.appendChild(styleElement);
    }, []);

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

    const handleTextChange = (e) => {
        setCustomText(e.target.value);
    };

    const handleFocus = () => {
        if (customText === DEFAULT_TEXT_PLACEHOLDER) {
            setCustomText('');
        }
    };

    const handleBlur = () => {
        if (customText.trim() === '') {
            setCustomText(DEFAULT_TEXT_PLACEHOLDER);
        }
    };

    // SVG Export Handler
    const handleSaveSvg = async () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select fonts and enter text to generate SVG.');
            return;
        }

        // Split text into lines if needed
        const lines = customText.split('\n');
        const lineHeight = 40; // px, adjust as needed
        const fontSize = 32; // px, adjust as needed
        const padding = 20;
        const svgWidth = 800;
        const svgHeight = selectedFonts.length * lines.length * lineHeight + padding * 2;

        // Build SVG content
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">\n`;

        let y = padding + fontSize;
        selectedFonts.forEach((font) => {
            lines.forEach((line, idx) => {
                if (line.trim() !== '') {
                    svgContent += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${fontSize}" fill="#181717">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
                    y += lineHeight;
                }
            });
            y += lineHeight / 2; // Extra space between font groups
        });

        svgContent += '</svg>';

        // Save locally
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ArchFontHub_Preview.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Upload to Cloudflare Worker
        try {
            const response = await fetch('https://arch-worker.tom-4a9.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'image/svg+xml'
                    // Add authentication headers here if needed
                },
                body: svgContent
            });

            if (!response.ok) {
                throw new Error('Failed to upload SVG to Cloudflare Worker.');
            }

            showMessage('SVG uploaded successfully.');
        } catch (error) {
            showMessage(`Error uploading SVG: ${error.message}`);
        }
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

            <div className="main-content-wrapper">
                <header className="app-header">
                    <h1 className="header-title">
                        Arch Font Hub
                    </h1>
                    <p className="header-subtitle">
                        Experiment with fonts and text display
                    </p>
                </header>

                <main className="main-sections-container">
                    <section className="section-card">
                        <h2 className="section-title">
                            1. Choose Your Fonts (Max 3)
                        </h2>
                        <div className="font-grid-container custom-scrollbar">
                            {Object.keys(categorizedFonts).map(category => (
                                <div key={category} className="font-category">
                                    <h3 className="font-category-title">
                                        {category}
                                    </h3>
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
                        <h2 className="section-title">
                            2. Enter Your Custom Text
                        </h2>
                        <textarea
                            className="text-input"
                            value={customText}
                            onChange={handleTextChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                    </section>

                    <section className="preview-section-card" ref={previewSectionRef}>
                        <h2 className="section-title">
                            3. Live Preview
                        </h2>
                        {selectedFonts.length === 0 ? (
                            <p className="empty-preview-message">
                                Select up to 3 fonts to see a live preview.
                            </p>
                        ) : (
                            <div className="preview-text-container">
                                {selectedFonts.map((font) => (
                                    <div key={`preview-${font}`} className="border-b pb-4 last:border-b-0">
                                        <p className="preview-font-label">{font}:</p>
                                        <p
                                            className="preview-text"
                                            style={{ fontFamily: font }}
                                        >
                                            {customText === DEFAULT_TEXT_PLACEHOLDER ? '' : customText}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="save-button-container">
                        <button
                            onClick={handleSaveSvg}
                            className="save-button"
                            style={{ backgroundColor: '#28a745' }}
                        >
                            Save Live Preview as SVG
                        </button>
                    </div>

                    {savedOutput.length > 0 && (
                        <section className="saved-output-section">
                            <h2 className="section-title">
                                4. Simulated CorelDRAW Output
                            </h2>
                            <p className="output-description">
                                This is how your text would appear on the CorelDRAW document,
                                with each line representing a text object in its selected font.
                            </p>
                            <div className="output-text-container">
                                {savedOutput.map((item, index) => (
                                    <div key={`saved-${index}`} className="output-text-item">
                                        <p className="output-font-label">Font: {item.font}</p>
                                        <p
                                            className="output-text"
                                            style={{ fontFamily: item.font }}
                                        >
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <footer className="app-footer">
                    <p>&copy; 2023 Font Preview Simulator. All rights reserved.</p>
                </footer>
            </div>

            <style>{`
        /* ...styles remain unchanged... */
      `}</style>
        </div>
    );
};

export default App;