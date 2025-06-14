import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
    // --- Constants ---
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;

    const categorizedFonts = {
        'Sans-serif': [
            'Arial',
            'Calibri',
            'Century Gothic'
        ],
        'Serif': [
            'Benguiat Book BT',
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

    // Rest of the component remains unchanged...
    return (
        <div className="main-sections-container">
            <header className="app-header">
                <h1 className="header-title">Upload SVG to Cloudflare Worker</h1>
            </header>

            <div className="section-card">
                <label className="section-title" htmlFor="svgUpload">Select an SVG file</label>
                <input id="svgUpload" type="file" accept=".svg" onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile && selectedFile.type === 'image/svg+xml') {
                        setPendingSvgContent(selectedFile);
                        setMessage('');
                    } else {
                        setMessage('Please upload a valid SVG file.');
                    }
                }} />
                <button className="save-button" onClick={() => setShowCustomerModal(true)}>
                    Upload
                </button>
                {message && <p className="output-description">{message}</p>}
            </div>

                    <section className="section-card">
                        <h2 className="section-title">2. Enter Your Custom Text</h2>
                        <textarea
                            className="text-input"
                            value={customText}
                            onChange={handleTextChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={DEFAULT_TEXT_PLACEHOLDER}
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
