import React, { useState } from 'react';
import './App.css';

const App = () => {
    // ... [existing state and handlers]

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
                            {/* ... [form fields] */}
                            <div className="button-group">
                                <button type="button" className="cancel-button same-size-button" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                <button type="submit" className="same-size-button">Submit & Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMessageBox && (
                <div className="modal-overlay">
                    <div className="message-box modal-box">
                        <p className="message-text">{message}</p>
                        <button onClick={() => setShowMessageBox(false)} className="message-button same-size-button">OK</button>
                    </div>
                </div>
            )}

            <div className="main-content">
                <section className="section-card">
                    <h2 className="section-title">Choose Your Fonts (Max {MAX_SELECTED_FONTS})</h2>
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
                    <h2 className="section-title">Enter Your Custom Text</h2>
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
                    <h2 className="section-title">Live Preview</h2>
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

                <button className="save-button same-size-button" onClick={handleSaveSvg}>
                    Submit Fonts to Arch Engraving
                </button>
            </div>
        </div>
    );
};

export default App;
