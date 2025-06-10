import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
  // Pre-defined list of fonts, now including Benguiat, Copperplate Gothic, and I Love Glitter
  const categorizedFonts = {
    'Sans-serif': [
      // No sans-serif custom fonts added yet, but you can add them here
    ],
    'Serif': [
      'Benguiat',
      'Copperplate Gothic'
    ],
    'Script': [
      'I Love Glitter' // Added I Love Glitter
    ],
    'Display': [
      // No display custom fonts added yet
    ],
    'Monospace': [
      // No monospace custom fonts added yet
    ]
  };

  // Flattened list of all available fonts
  const allAvailableFonts = Object.values(categorizedFonts).flat();

  // State for selected fonts (up to 3)
  const [selectedFonts, setSelectedFonts] = useState([]);
  // State for user-entered text
  const [customText, setCustomText] = useState('Type your text here...');
  // State for the final "saved" output
  const [savedOutput, setSavedOutput] = useState([]);
  // State for message box
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  // useEffect hook runs after the component renders.
  // The empty dependency array `[]` ensures it runs only once after the initial render.
  useEffect(() => {
    // --- Custom Hosted Fonts ---
    // This defines the font families and tells the browser where to find them.
    // Ensure 'Benguiat.ttf', 'Copperplate Gothic.ttf', and 'I Love Glitter.ttf' are in your 'public/fonts/'
    // directory in your Cloudflare Pages deployment.
    // Spaces in URLs are now URL-encoded (%20) for better browser compatibility.
    const customFontsCss = `
      @font-face {
        font-family: 'Benguiat'; /* Font family name */
        src: url('/fonts/Benguiat.ttf') format('truetype'); /* Path relative to your deployed Cloudflare Pages site */
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Copperplate Gothic'; /* Font family name for Copperplate Gothic */
        src: url('/fonts/Copperplate%20Gothic.ttf') format('truetype'); /* URL-encoded path for space */
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'I Love Glitter'; /* Font family name for I Love Glitter */
        src: url('/fonts/I%20Love%20Glitter.ttf') format('truetype'); /* URL-encoded path for space */
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      /* Add more @font-face rules here for other custom fonts if needed */
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = customFontsCss;
    document.head.appendChild(styleElement);

  }, []); // Empty dependency array ensures this runs only once

  // Function to handle selecting and deselecting fonts.
  // Allows up to 3 fonts to be selected.
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

  // Handles changes in the custom text input field.
  const handleTextChange = (e) => {
    setCustomText(e.target.value);
  };

  // Simulates saving the text with chosen fonts to a "document".
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
            CorelDRAW Font Preview Simulator
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

          <section className="preview-section-card">
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
          background: linear-gradient(to bottom right, #f5f3ff, #e0e7ff); /* purple-50 to indigo-100 */
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-y: scroll;

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
          padding: 1rem; /* ADDED: padding around the main content wrapper */
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .app-container {
            padding: 2rem; /* ADDED: larger padding for larger screens */
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
          background-color: #4f46e5; /* indigo-600 */
          color: white;
          padding: 1.5rem; /* p-6 */
          text-align: center;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }

        .header-title {
          font-size: 1.875rem; /* text-3xl */
          line-height: 2.25rem;
          font-weight: 800; /* font-extrabold */
          letter-spacing: -0.05em; /* tracking-tight */
          margin: 0;
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .header-title {
            font-size: 2.25rem; /* sm:text-4xl */
            line-height: 2.5rem;
          }
        }

        .header-subtitle {
          margin-top: 0.5rem; /* mt-2 */
          color: #c7d2fe; /* text-indigo-200 */
          font-size: 1.125rem; /* text-lg */
          line-height: 1.75rem;
        }

        /* Main Sections Container - Now holds the padding */
        .main-sections-container {
          padding: 1.5rem; /* p-6 - This padding now defines the inner spacing of the white card */
          display: flex;
          flex-direction: column;
          gap: 2rem; /* space-y-8 */
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .main-sections-container {
            padding: 2rem; /* sm:p-8 */
          }
        }

        /* Section Card Base Styles */
        .section-card, .preview-section-card, .saved-output-section {
          background-color: #f9fafb; /* gray-50 */
          padding: 1.5rem; /* p-6 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
          border: 1px solid #e0e7ff; /* border-indigo-200, used for preview/output as well */
        }

        .preview-section-card {
          background-color: white; /* bg-white */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
        }

        .saved-output-section {
          background-color: #eef2ff; /* indigo-50 */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          border-color: #c7d2fe; /* border-indigo-300 */
        }

        .section-title {
          font-size: 1.5rem; /* text-2xl */
          line-height: 2rem;
          font-weight: 700; /* font-bold */
          color: #4338ca; /* indigo-700 */
          margin-bottom: 1rem;
        }

        /* Font Grid Container */
        .font-grid-container {
          max-height: 24rem; /* max-h-96 */
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        /* Font Category (for h3 in grid) */
        .font-category {
          margin-bottom: 1.5rem;
        }

        .font-category-title {
          font-size: 1.25rem; /* text-xl */
          font-weight: 600; /* font-semibold */
          color: #4f46e5; /* indigo-600 */
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #a5b4fc; /* border-b-2 border-indigo-300 */
          padding-bottom: 0.25rem;
        }

        /* Font Buttons Grid */
        .font-buttons-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
          gap: 0.75rem;
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
          padding: 0.75rem; /* p-3 */
          border-radius: 0.375rem; /* rounded-md */
          border: 2px solid #d1d5db; /* border-2 border-gray-300 */
          transition: all 200ms ease-in-out;
          background-color: white;
          color: #4b5563; /* text-gray-700 */
          font-weight: 500; /* font-medium */
          font-size: 0.875rem; /* text-sm */
          line-height: 1.25rem;
          cursor: pointer;
          outline: none;
        }
        .font-button:hover {
          background-color: #eef2ff; /* hover:bg-indigo-50 */
          border-color: #a5b4fc; /* hover:border-indigo-400 */
        }

        .font-button-selected {
          background-color: #6366f1; /* bg-indigo-500 */
          color: white;
          border-color: #4f46e5; /* border-indigo-600 */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: scale(1.05);
        }

        /* Text Input */
        .text-input {
          width: 100%;
          padding: 1rem; /* p-4 */
          border: 1px solid #d1d5db; /* border border-gray-300 */
          border-radius: 0.5rem; /* rounded-lg */
          outline: none;
          transition: all 200ms;
          font-size: 1.125rem; /* text-lg */
          line-height: 1.75rem;
          resize: vertical; /* resize-y */
          min-height: 100px; /* min-h-[100px] */
        }
        .text-input:focus {
          box-shadow: 0 0 0 2px #a5b4fc; /* focus:ring-2 focus:ring-indigo-400 */
          border-color: transparent;
        }

        /* Live Preview & Simulated Output Text Container */
        .preview-text-container, .output-text-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* space-y-6 */
        }

        .empty-preview-message {
          color: #6b7280; /* text-gray-500 */
          font-style: italic;
          text-align: center;
          padding-top: 1rem;
          padding-bottom: 1rem;
        }

        .preview-text-item, .output-text-item {
          border-bottom: 1px solid #e5e7eb; /* border-b */
          padding-bottom: 1rem;
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
          font-size: 1.5rem; /* text-2xl */
          line-height: 2rem;
          word-break: break-word;
          line-height: 1.625; /* leading-relaxed (approx) */
          margin: 0;
        }

        @media (min-width: 640px) { /* sm: breakpoint */
          .preview-text, .output-text {
            font-size: 1.875rem; /* sm:text-3xl */
            line-height: 2.25rem;
          }
        }

        .output-description {
          color: #6b7280; /* text-gray-600 */
          margin-bottom: 1rem;
        }

        /* Save Button */
        .save-button-container {
          text-align: center;
        }

        .save-button {
          padding: 1rem 2rem; /* px-8 py-4 */
          background-color: #22c55e; /* bg-green-500 */
          color: white;
          font-size: 1.25rem; /* text-xl */
          line-height: 1.75rem;
          font-weight: 700; /* font-bold */
          border-radius: 9999px; /* rounded-full */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
          transition: all 300ms ease-in-out;
          cursor: pointer;
          border: none;
          outline: none;
        }

        .save-button:hover {
          background-color: #16a34a; /* hover:bg-green-600 */
          transform: scale(1.05);
        }

        .save-button:active {
          transform: scale(0.95);
        }

        .save-button:focus {
          box-shadow: 0 0 0 4px #86efac; /* focus:ring-4 focus:ring-green-300 */
        }

        /* Footer */
        .app-footer {
          background-color: #4338ca; /* indigo-700 */
          color: white;
          padding: 1rem; /* p-4 */
          text-align: center;
          font-size: 0.875rem; /* text-sm */
          line-height: 1.25rem;
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
          padding: 1.5rem; /* p-6 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-xl */
          border: 1px solid #bfdbfe; /* border border-blue-200 */
          text-align: center;
        }

        .message-text {
          font-size: 1.125rem; /* text-lg */
          font-weight: 600; /* font-semibold */
          color: #1d4ed8; /* text-blue-700 */
          margin-bottom: 1rem;
        }

        .message-button {
          margin-top: 1rem; /* mt-4 */
          padding: 0.5rem 1.5rem; /* px-6 py-2 */
          background-color: #2563eb; /* bg-blue-600 */
          color: white;
          border-radius: 0.375rem; /* rounded-md */
          transition: background-color 300ms;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          cursor: pointer;
          border: none;
          outline: none;
        }
        .message-button:hover {
          background-color: #1d4ed8; /* hover:bg-blue-700 */
        }

        /* Custom Scrollbar Styling (retained from previous versions) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa; /* Tailwind indigo-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6; /* Tailwind indigo-500 */
        }
        /* Inter font is still loaded from Google Fonts in the useEffect if needed for default, but here it's assumed to be available */
      `}</style>
    </div>
  );
};

export default App;
