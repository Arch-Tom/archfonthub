import React, { useState } from 'react';

// NOTE: Ensure the import for App.css is removed or the file is empty.
// import './App.css'; 

const App = () => {
    // State and constants from your original file
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;

    // The updated font list from the file you provided
    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic', 'Berlin Sans FB', 'Bebas Neue'],
        'Serif': ['Benguiat', 'Benguiat Bk BT', 'Copperplate Gothic', 'Garamond', 'Times New Roman', 'Murray Hill'],
        'Script': ['I Love Glitter', 'Amazone BT', 'Great Vibes', 'Honey Script', 'ITC Zapf Chancery', 'BlackChancery'],
        'Display': ['Tinplate Titling Black', 'ChocolateBox', 'CollegiateBlackFLF', 'CollegiateOutlineFLF'],
        'Monospace': ['Zapf Humanist']
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    // All your handler functions remain the same
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
        const lineHeight = 40;
        const mainFontSize = 32;
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
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${mainFontSize}" fill="#181717">${sanitizedLine}</text>\n`;
            });
            if (fontIndex < selectedFonts.length - 1) {
                y += lineHeight * 0.75;
            }
        });
        const svgWidth = 800;
        const svgHeight = y + padding;
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgTextElements}</svg>`;
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

    // Reusable component for styled form inputs
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
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="bg-slate-800 text-white w-full lg:w-72 p-6 lg:p-8 shrink-0 flex flex-col">
                <div className="font-black text-3xl tracking-wide leading-tight text-white">ARCH<br />FONT HUB</div>
                <p className="mt-2 text-sm text-slate-400 border-b border-slate-700 pb-6">
                    Experiment with fonts and text display for customer proofs.
                </p>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Font Selection Card */}
                        <section className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-5">1. Choose Your Fonts (Max {MAX_SELECTED_FONTS})</h2>
                            <div className="space-y-5">
                                {Object.entries(categorizedFonts).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="text-md font-semibold text-slate-700 border-b-2 border-slate-200 pb-2 mb-4">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {fonts.map((font) => (
                                                <button
                                                    key={font}
                                                    onClick={() => handleFontSelect(font)}
                                                    className={`px-4 py-2 rounded-lg text-base font-semibold border-2 transition-all duration-200 ease-in-out transform hover:scale-105
                                                        ${selectedFonts.includes(font)
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                            : 'bg-white text-blue-600 border-blue-500 hover:bg-blue-50'
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
                        <section className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-5">2. Enter Text to Preview</h2>
                            <textarea
                                className="w-full p-4 border-2 border-slate-200 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] text-lg"
                                value={customText}
                                onChange={handleTextChange}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            />
                        </section>

                        {/* Live Preview Card */}
                        <section className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-5">3. Live Preview</h2>
                            <div className="bg-slate-50 p-4 rounded-lg min-h-[150px] space-y-6">
                                {selectedFonts.length > 0 && customText.trim() !== '' ? (
                                    selectedFonts.map((font) => (
                                        <div key={`preview-${font}`}>
                                            <p className="text-sm font-bold text-blue-700 mb-2 tracking-wide uppercase">{font}</p>
                                            <p className="text-3xl text-slate-800 break-words" style={{ fontFamily: font }}>{customText}</p>
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
                    <div className="mt-10">
                        <button
                            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 transition-all duration-200 transform hover:scale-[1.01]"
                            onClick={handleSaveSvg}
                        >
                            Submit Fonts to Arch Engraving
                        </button>
                    </div>
                </div>
            </main>

            {/* Modals Overlay */}
            {(showCustomerModal || showMessageBox) && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                        {showCustomerModal && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Enter Customer Information to Save</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold transition-colors" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors shadow-sm">Submit & Save</button>
                                </div>
                            </form>
                        )}
                        {showMessageBox && (
                            <div className="text-center">
                                <p className="text-slate-800 text-lg mb-6">{message}</p>
                                <button
                                    onClick={() => setShowMessageBox(false)}
                                    className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors shadow-sm"
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