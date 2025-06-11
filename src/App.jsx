import React, { useState, useEffect, useRef } from 'react'; // Import useRef

// Import the html2pdf library (after npm install html2pdf.js)
// You might need to adjust the import path based on the library's exact structure
// import html2pdf from 'html2pdf.js'; // This is a common way
// Or if it's a default export from a specific path in node_modules
import html2pdf from 'html2pdf.js/dist/html2pdf.min'; // This is a more specific common path

// Main App Component
const App = () => {
    // ... (existing categorizedFonts and other state declarations) ...

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
    const [customText, setCustomText] = useState('Type your text here...');
    const [savedOutput, setSavedOutput] = useState([]);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    // Create a ref for the preview section
    const previewSectionRef = useRef(null);

    // ... (existing useEffect for @font-face rules) ...
    useEffect(() => {
        const customFontsCss = `
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

        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCss;
        document.head.appendChild(styleElement);

    }, []);

    // ... (existing handleFontSelect and handleTextChange functions) ...
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


    // Function to handle saving to PDF
    const handleSavePdf = () => {
        if (selectedFonts.length === 0 || customText.trim() === '') {
            showMessage('Please select fonts and enter text to generate PDF.');
            return;
        }

        const previewElement = previewSectionRef.current;
        if (!previewElement) {
            showMessage('Could not find preview section to save.');
            return;
        }

        // Temporarily hide the h2 heading before PDF generation
        const headingElement = previewElement.querySelector('.section-title');
        if (headingElement) {
            headingElement.style.display = 'none';
        }

        // PDF generation options
        const options = {
            margin: 10,
            filename: 'ArchFontHub_Preview.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(previewElement).save().finally(() => {
            // Show the h2 heading again after PDF generation is complete
            if (headingElement) {
                headingElement.style.display = ''; // Reset to default display
            }
        });

        showMessage('Generating PDF...');
    };


    const handleSave = () => {
        if (selectedFonts.length === 0) {
            showMessage('Please select at least one font to save.');
            return;
        }
        if (customText.trim() === '') {
            showMessage('Please enter some text to save.');
            return;
        }

        const output = selectedFonts.map((font) => ({
            font: font,
            text: customText,
        }));
        setSavedOutput(output);
        showMessage('Text saved to simulated document!');
    };


    // Function to display a temporary message box to the user.
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
                            placeholder="Type your text here..."
                        />
                    </section>

                    <section className="preview-section-card" ref={previewSectionRef}> {/* Add ref here */}
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
                                            {customText}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="save-button-container">
                        <button
                            onClick={handleSave}
                            className="save-button"
                        >
                            Simulate Save to Document
                        </button>
                        <button
                            onClick={handleSavePdf}
                            className="save-button"
                            style={{ marginLeft: '1rem', backgroundColor: '#dc3545' }} // Added a new button for PDF with some basic styling
                        >
                            Save Live Preview as PDF
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

          /* Flexbox for centering content within the viewport */
          display: flex;
          flex-direction: column;
          align-items: center; /* Center horizontally */
          justify-content: center; /* Center vertically if content doesn't fill height */
        }

        /* App Container */
        .app-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1; /* Allow app-container to grow and fill available space */
          padding: 0.5rem; /* Reduced padding */
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .app-container {
            padding: 1rem; /* Reduced padding for larger screens */
          }
        }


        /* Main Content Wrapper (like a card) */
        .main-content-wrapper {
          background-color: white;
          border-radius: 0.75rem; /* rounded-xl */
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
          overflow: hidden;
          
          width: 100%; /* Take 100% of the app-container's padded width */
          max-width: 1500px; /* Set a large max-width to prevent it from becoming too wide on ultra-wide screens */
        }
        
        /* Header Styles */
        .app-header {
          background-color: #2E7ABF; /* Medium Blue from logo */
          color: white;
          padding: 1rem; /* Reduced padding */
          text-align: center;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }

        .header-title {
          font-size: 1.5rem; /* Reduced font size */
          line-height: 2rem;
          font-weight: 800; /* font-extrabold */
          letter-spacing: -0.05em; /* tracking-tight */
          margin: 0;
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .header-title {
            font-size: 2rem; /* sm:text-4xl, slightly reduced */
            line-height: 2.5rem;
          }
        }

        .header-subtitle {
          margin-top: 0.25rem; /* Reduced margin */
          color: #dbeafe; /* Adjusted light blue for contrast */
          font-size: 1rem; /* Reduced font size */
          line-height: 1.5rem;
        }

        /* Main Sections Container - Now holds the padding */
        .main-sections-container {
          padding: 1rem; /* Reduced padding */
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Reduced gap */
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .main-sections-container {
            padding: 1.5rem; /* Reduced padding */
          }
        }

        /* Section Card Base Styles */
        .section-card, .preview-section-card, .saved-output-section {
          background-color: #f9fafb; /* gray-50 - kept light for content contrast */
          padding: 1rem; /* Reduced padding */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
          border: 1px solid #cfe2f7; /* Adapted light blue border */
        }

        .preview-section-card {
          background-color: white; /* bg-white */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
        }

        .saved-output-section {
          background-color: #e6f0fa; /* Adapted light blue for saved output */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          border-color: #9ac2e6; /* Adapted medium blue border */
        }

        .section-title {
          font-size: 1.25rem; /* Reduced font size */
          line-height: 1.75rem;
          font-weight: 700; /* font-bold */
          color: #2E7ABF; /* Medium Blue from logo */
          margin-bottom: 0.75rem; /* Reduced margin */
        }

        /* Font Grid Container */
        .font-grid-container {
          padding-right: 0; /* Remove padding if custom scrollbar not needed */
        }

        /* Font Category (for h3 in grid) */
        .font-category {
          margin-bottom: 1rem; /* Reduced margin */
        }

        .font-category-title {
          font-size: 1.125rem; /* Reduced font size */
          font-weight: 600; /* font-semibold */
          color: #2E7ABF; /* Medium Blue from logo */
          margin-bottom: 0.5rem; /* Reduced margin */
          border-bottom: 2px solid #57A3E1; /* Light Blue from logo */
          padding-bottom: 0.25rem;
        }

        /* Font Buttons Grid */
        .font-buttons-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
          gap: 0.5rem; /* Reduced gap */
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .font-buttons-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)); /* sm:grid-cols-3 */
          }
        }

        @media (min-width: 768px) { /* md: breakpoint */
          .font-buttons-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)); /* md:grid-cols-4 */
          }
        }

        /* Font Button Styles */
        .font-button {
          padding: 0.5rem; /* p-3 */
          border-radius: 0.375rem; /* rounded-md */
          border: 2px solid #57A3E1; /* Light Blue from logo */
          transition: all 200ms ease-in-out;
          background-color: white;
          color: #181717; /* Dark Grey from logo */
          font-weight: 500; /* font-medium */
          font-size: 0.75rem; /* Reduced font size */
          line-height: 1rem;
          cursor: pointer;
          outline: none;
        }
        .font-button:hover {
          background-color: #d2e4f7; /* Lighter blue on hover */
          border-color: #2E7ABF; /* Medium Blue on hover */
        }

        .font-button-selected {
          background-color: #2E7ABF; /* Medium Blue from logo */
          color: white;
          border-color: #181717; /* Dark Grey from logo */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: scale(1.05);
        }

        /* Text Input */
        .text-input {
          width: 100%;
          padding: 0.75rem; /* p-4 */
          border: 1px solid #57A3E1; /* Light Blue from logo */
          border-radius: 0.5rem; /* rounded-lg */
          outline: none;
          transition: all 200ms;
          font-size: 1rem; /* text-lg */
          line-height: 1.5rem;
          resize: vertical; /* resize-y */
          min-height: 80px; /* min-h-[100px] */
        }
        .text-input:focus {
          box-shadow: 0 0 0 2px #57A3E1; /* focus:ring-2 Light Blue from logo */
          border-color: transparent;
        }

        /* Live Preview & Simulated Output Text Container */
        .preview-text-container, .output-text-container {
          display: flex;
          flex-direction: column;
          gap: 1rem; /* space-y-6 */
        }

        .empty-preview-message {
          color: #6b7280; /* text-gray-500 */
          font-style: italic;
          text-align: center;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .preview-text-item, .output-text-item {
          border-bottom: 1px solid #e5e7eb; /* border-b */
          padding-bottom: 0.75rem;
        }
        .preview-text-item:last-child, .output-text-item:last-child {
          border-bottom: none;
        }

        .preview-font-label, .output-font-label {
          font-size: 0.875rem; /* text-sm */
          color: #4b5563; /* text-gray-600 */
          margin-bottom: 0.25rem;
          font-weight: 600; /* font-semibold */
        }

        .preview-text, .output-text {
          font-size: 1.25rem; /* text-2xl */
          line-height: 1.75rem;
          word-break: break-word;
          line-height: 1.625; /* leading-relaxed (approx) */
          margin: 0;
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .preview-text, .output-text {
            font-size: 1.5rem; /* sm:text-3xl */
            line-height: 2rem;
          }
        }

        .output-description {
          color: #6b7280; /* text-gray-600 */
          margin-bottom: 0.75rem;
        }

        /* Save Button */
        .save-button-container {
          text-align: center;
          margin-top: 1rem;
        }

        .save-button {
          padding: 0.75rem 1.5rem; /* px-8 py-4 */
          background-color: #57A3E1; /* Light Blue from logo */
          color: #181717; /* Dark Grey from logo */
          font-size: 1rem; /* text-xl */
          line-height: 1.5rem;
          font-weight: 700; /* font-bold */
          border-radius: 9999px; /* rounded-full */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          transition: all 300ms ease-in-out;
          cursor: pointer;
          border: none;
          outline: none;
        }

        .save-button:hover {
          background-color: #2E7ABF; /* Medium Blue from logo */
          transform: scale(1.05);
        }

        .save-button:active {
          transform: scale(0.95);
        }

        .save-button:focus {
          box-shadow: 0 0 0 4px #57A3E1; /* focus:ring-4 Light Blue from logo */
        }

        /* Footer */
        .app-footer {
          background-color: #181717; /* Dark Grey from logo */
          color: white;
          padding: 0.75rem; /* p-4 */
          text-align: center;
          font-size: 0.75rem; /* text-sm */
          line-height: 1rem;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }

        /* Message Box Overlay */
        .message-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          background-color: rgba(0, 0, 0, 0.3);
        }

        .message-box {
          background-color: white;
          padding: 1rem; /* p-6 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-xl */
          border: 1px solid #57A3E1; /* Light Blue from logo */
          text-align: center;
        }

        .message-text {
          font-size: 1rem; /* text-lg */
          font-weight: 600; /* font-semibold */
          color: #2E7ABF; /* Medium Blue from logo */
          margin-bottom: 0.75rem;
        }

        .message-button {
          margin-top: 0.75rem; /* mt-4 */
          padding: 0.4rem 1rem; /* px-6 py-2 */
          background-color: #2E7ABF; /* Medium Blue from logo */
          color: white;
          border-radius: 0.375rem; /* rounded-md */
          transition: background-color 300ms;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          border: none;
          outline: none;
        }
        .message-button:hover {
          background-color: #57A3E1; /* Light Blue from logo */
        }

        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #57A3E1; /* Light Blue from logo */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2E7ABF; /* Medium Blue from logo */
        }
      `}</style>
        </div>
    );
};

export default App;