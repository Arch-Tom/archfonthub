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

            <footer className="app-footer">
                &copy; {new Date().getFullYear()} Your Company
            </footer>
        </div>
    );
};

export default App;
