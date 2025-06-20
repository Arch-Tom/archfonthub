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
    const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));

    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => setShowMessageBox(false), duration);
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '') {
            showMessage('Please select at least one font and enter some text to save an SVG.');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            showMessage('Please enter some text to save an SVG.');
            return;
        }
        let svgTextElements = '';
        const lineHeight = fontSize + 8;
        const labelFontSize = 16;
        const padding = 20;
        let y = padding;
        selectedFonts.forEach((font, fontIndex) => {
            y += labelFontSize + 10;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">${font}</text>\n`;
            y += lineHeight * 0.5;
            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${fontSize}" fill="#181717">${sanitizedLine}</text>\n`;
            });
            if (fontIndex < selectedFonts.length - 1) {
                y += lineHeight * 0.75;
            }
        });
        const svgWidth = 800;
        const svgHeight = y + padding;
        const fullSvg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${svgWidth}\" height=\"${svgHeight}\" style=\"background-color: #FFF;\">\n${svgTextElements}</svg>`;
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
        const filename = [
            formatForFilename(orderNumber),
            formatForFilename(customerName),
            customerCompany.trim() ? formatForFilename(customerCompany) : ''
        ].filter(Boolean).join('_') + '.svg';
        try {
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('SVG saved locally!');
        } catch (error) {
            showMessage(`Could not save file locally: ${error.message}`);
        }
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

    const FormInput = ({ label, id, value, onChange, required = false, isOptional = false }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
                {isOptional && <span className="text-slate-500 text-xs ml-1">(Optional)</span>}
            </label>
            <input
                id={id}
                type="text"
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-base"
            />
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="bg-gradient-to-b from-slate-800 to-slate-900 text-white w-full lg:w-80 p-8 flex flex-col items-center justify-center shadow-xl rounded-r-3xl">
                <div className="flex flex-col items-center">
                    <div className="mb-4">
                        {/* Real logo SVG */}
                        <img
                            src="/images/Arch Vector Logo White.svg"
                            alt="Arch Font Hub Logo"
                            className="w-140 h-140 object-contain drop-shadow-lg"
                        />
                    </div>
                    <div className="font-black text-3xl tracking-wide leading-tight text-white text-center">ARCH<br />FONT HUB</div>
                </div>
                <p className="mt-4 text-base text-slate-300 border-t border-slate-700 pt-6 text-center">
                    Experiment with fonts and text display for customer proofs.
                </p>
            </aside>

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
                                                            // MODIFIED: Changed text color to a dark slate to match the sidebar.
                                                            : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-50'
                                                        }`}
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
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Custom Text</h2>
                            <textarea
                                className="w-full p-5 border-2 border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-h-[120px] text-lg"
                                value={customText}
                                onChange={handleTextChange}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            />
                        </section>

                        {/* Live Preview Card */}
                        <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Preview</h2>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="fontSizeSlider" className="text-sm font-medium text-slate-600">Size</label>
                                    <input
                                        id="fontSizeSlider"
                                        type="range"
                                        // MODIFIED: Slider range is now 36 to 100.
                                        min="36"
                                        max="100"
                                        step="1"
                                        value={fontSize}
                                        onChange={handleFontSizeChange}
                                        className="w-32 lg:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-slate-600 w-12 text-left">{fontSize}px</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-50 to-slate-200 p-6 rounded-xl min-h-[150px] space-y-10 border border-slate-100">
                                {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                    selectedFonts.map((font) => (
                                        <div key={`preview-${font}`} className="relative flex flex-col items-start gap-3">
                                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm z-10 mb-2 mt-2" style={{ fontFamily: 'Arial' }}>{font}</span>
                                            <p className="text-slate-800 break-words w-full" style={{ fontFamily: font, fontSize: `${fontSize}px`, lineHeight: 1.4 }}>{customText}</p>
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

                    {/* Submit Button */}
                    <div className="mt-12">
                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-blue-200 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 text-xl tracking-wide"
                            onClick={handleSaveSvg}
                        >
                            Submit Fonts to Arch Engraving
                        </button>
                    </div>
                </div>
            </main>

            {/* Modals Overlay */}
            {(showCustomerModal || showMessageBox) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg animate-fade-in">
                        {showCustomerModal && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-8">
                                <h3 className="text-2xl font-bold text-slate-900">Enter Customer Information to Save</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-5 py-2 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm">Submit & Save</button>
                                </div>
                            </form>
                        )}
                        {showMessageBox && (
                            <div className="text-center">
                                <p className="text-slate-800 text-lg mb-8">{message}</p>
                                <button
                                    onClick={() => setShowMessageBox(false)}
                                    className="px-10 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm"
                                >
                                    OK
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
