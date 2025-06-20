import React, { useState } from 'react';

const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;

    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic', 'Berlin Sans FB', 'Bebas Neue'],
        'Serif': ['Benguiat', 'Benguiat Bk BT', 'Copperplate Gothic', 'Garamond', 'Times New Roman', 'Murray Hill'],
        'Script': ['I Love Glitter', 'Amazone BT', 'Great Vibes', 'Honey Script', 'ITC Zapf Chancery', 'BlackChancery'],
        'Display': ['Tinplate Titling Black', 'ChocolateBox', 'CollegiateBlackFLF', 'CollegiateOutlineFLF'],
        'Monospace': ['Zapf Humanist']
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [fontSize, setFontSize] = useState(36);
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
    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };
    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));

    // ... [keep all other functions unchanged, such as handleSaveSvg, handleCustomerModalSubmit, FormInput etc.]

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            {/* Sidebar remains unchanged */}
            {/* ... */}

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-8 lg:p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-10">
                        {/* Font Selection Card */}
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Font Selection</h2>
                            <div className="space-y-6">
                                {Object.entries(categorizedFonts).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="text-md font-semibold text-slate-700 border-b-2 border-slate-200 pb-2 mb-3 tracking-wide">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {fonts.map((font) => (
                                                <button
                                                    key={font}
                                                    onClick={() => handleFontSelect(font)}
                                                    className={`px-4 py-2 rounded-xl text-base font-semibold border-2 transition-all duration-150 transform hover:scale-105 focus:outline-none
                                                        ${selectedFonts.includes(font)
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                            : 'bg-white text-black border-blue-400 hover:bg-blue-50'}
                                                    `}
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

                        {/* Text Input Card */}
                        {/* ... unchanged */}

                        {/* Live Preview Card */}
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Preview</h2>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="fontSize" className="text-sm text-slate-600">Font Size: {fontSize}px</label>
                                    <input
                                        id="fontSize"
                                        type="range"
                                        min="12"
                                        max="100"
                                        value={fontSize}
                                        onChange={handleFontSizeChange}
                                        className="w-48"
                                    />
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-6 rounded-xl min-h-[150px] space-y-10 border border-slate-100">
                                {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                    selectedFonts.map((font) => (
                                        <div key={`preview-${font}`} className="relative flex flex-col items-start gap-3">
                                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm z-10 mb-2 mt-2" style={{ fontFamily: 'Arial' }}>{font}</span>
                                            <p className="break-words" style={{ fontFamily: font, fontSize: `${fontSize}px`, color: '#1e293b' }}>{customText}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-500 italic">Select fonts and enter text to see a live preview.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Submit Button remains unchanged */}
                    {/* ... */}
                </div>
            </main>

            {/* Modals remain unchanged */}
            {/* ... */}
        </div>
    );
};

export default App;
