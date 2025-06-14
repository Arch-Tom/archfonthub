import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here to see a live preview.';
const MAX_SELECTED_FONTS = 3;
const CLOUDFLARE_WORKER_URL = 'https://arch-worker.tom-4a9.workers.dev';

// --- Font Data ---
const categorizedFonts = {
    'Sans-serif': [
        { name: 'Arial', path: null },
        { name: 'Calibri', path: null },
        { name: 'Century Gothic', path: null },
        { name: 'Verdana', path: null },
    ],
    'Serif': [
        { name: 'Benguiat', path: '/fonts/Benguiat-Regular.woff' },
        { name: 'Copperplate Gothic', path: null },
        { name: 'Garamond', path: null },
        { name: 'Times New Roman', path: null },
        { name: 'Zapf Humanist', path: '/fonts/Zapf-Humanist.woff' },
    ],
    'Script': [
        { name: 'I Love Glitter', path: '/fonts/I-Love-Glitter.woff' },
    ],
    'Display': [
        { name: 'Tinplate Titling Black', path: '/fonts/Tinplate-Titling-Black.woff' },
    ],
    'Monospace': [
        { name: 'Courier New', path: null },
        { name: 'Lucida Console', path: null },
    ]
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const App = () => {
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);
    const [fontDataUris, setFontDataUris] = useState({});
    const previewSectionRef = useRef(null);

    useEffect(() => {
        const fetchFontData = async () => {
            const allFonts = Object.values(categorizedFonts).flat();
            const customFonts = allFonts.filter(font => font.path);
            const dataUris = {};
            for (const font of customFonts) {
                try {
                    const response = await fetch(font.path);
                    if (!response.ok) throw new Error(`Could not fetch ${font.path}`);
                    const buffer = await response.arrayBuffer();
                    const base64 = arrayBufferToBase64(buffer);
                    dataUris[font.name] = `data:font/woff;base64,${base64}`;
                } catch (error) {
                    console.error(`Failed to load font ${font.name}:`, error);
                }
            }
            setFontDataUris(dataUris);
        };
        fetchFontData();
    }, []);

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const showMessage = (msg, duration = 4000) => {
        setMessage(msg);
        setShowMessageBox(true);
        setTimeout(() => { setShowMessageBox(false); setMessage(''); }, duration);
    };
    const handleFontSelect = (fontName) => {
        setSelectedFonts(prev => {
            if (prev.includes(fontName)) return prev.filter(f => f !== fontName);
            if (prev.length < MAX_SELECTED_FONTS) return [...prev, fontName];
            showMessage(`You can select a maximum of ${MAX_SELECTED_FONTS} fonts.`);
            return prev;
        });
    };
    const handleTextChange = (e) => setCustomText(e.target.value);
    const handleFocus = () => { if (customText === DEFAULT_TEXT_PLACEHOLDER) setCustomText(''); };
    const handleBlur = () => { if (customText.trim() === '') setCustomText(DEFAULT_TEXT_PLACEHOLDER); };
    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select at least one font and enter some text to save an SVG.');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            showMessage('Please enter some text to save an SVG.');
            return;
        }
        let fontFaceStyles = '';
        const fontsToEmbed = selectedFonts.filter(fontName => fontDataUris[fontName]);
        fontsToEmbed.forEach(fontName => {
            fontFaceStyles += `@font-face { font-family: '${fontName}'; src: url('${fontDataUris[fontName]}') format('woff'); }\n`;
        });
        let svgTextElements = '';
        const lineHeight = 40;
        const mainFontSize = 32;
        const labelFontSize = 16;
        const padding = 20;
        let y = padding;
        selectedFonts.forEach((font, fontIndex) => {
            y += labelFontSize + 5;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial, sans-serif" font-size="${labelFontSize}" fill="#888">${font}</text>\n`;
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
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n<style>${fontFaceStyles}</style>\n${svgTextElements}</svg>`;
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
        const order = formatForFilename(orderNumber);
        const name = formatForFilename(customerName);
        const company = customerCompany.trim() ? formatForFilename(customerCompany) : '';
        const filename = [order, name, company].filter(Boolean).join('_') + '.svg';
        try {
            const blob = new Blob([pendingSvgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('SVG saved locally. Now uploading...');
        } catch (error) { showMessage(`Could not save file locally: ${error.message}`); }
        try {
            const response = await fetch(`${CLOUDFLARE_WORKER_URL}/${filename}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: pendingSvgContent
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status ${response.status}. ${errorText}`);
            }
            showMessage('SVG uploaded successfully!', 5000);
        } catch (error) {
            console.error('Upload error:', error);
            showMessage(`Error uploading SVG: ${error.message}`, 6000);
        }
        setCustomerName(''); setCustomerCompany(''); setOrderNumber(''); setPendingSvgContent(null);
    };

    return (
        <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
            <div className="container mx-auto p-4 md:p-8">

                {showCustomerModal && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">Enter Customer Information</h3>
                            <form onSubmit={handleCustomerModalSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Order Number<span className="text-red-500">*</span></label>
                                        <input type="text" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Customer Name<span className="text-red-500">*</span></label>
                                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Customer Company</label>
                                        <input type="text" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowCustomerModal(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">Submit & Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showMessageBox && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
                            <p className="text-lg text-slate-700 mb-6">{message}</p>
                            <button onClick={() => setShowMessageBox(false)} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">OK</button>
                        </div>
                    </div>
                )}

                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">ArchFontHub</h1>
                    <p className="text-slate-500 mt-2 text-lg">Your go-to tool for font previews and outputs.</p>
                </header>

                <main className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-slate-700 border-b pb-3 mb-4">1. Select up to 3 Fonts</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {Object.entries(categorizedFonts).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold text-slate-600 mb-2">{category}</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {fonts.map(font => (
                                                <button
                                                    key={font.name}
                                                    onClick={() => handleFontSelect(font.name)}
                                                    className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${selectedFonts.includes(font.name) ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg' : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
                                                    style={{ fontFamily: font.name }}
                                                >
                                                    {font.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-slate-700 border-b pb-3 mb-4">2. Enter Your Text</h2>
                            <textarea
                                className="w-full h-full min-h-[200px] p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={customText}
                                onChange={handleTextChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            />
                        </section>
                    </div>

                    <section className="bg-white p-6 rounded-xl shadow-md" ref={previewSectionRef}>
                        <h2 className="text-2xl font-bold text-slate-700 border-b pb-3 mb-4">3. Live Preview</h2>
                        <div className="p-4 bg-slate-50 rounded-lg min-h-[200px]">
                            {selectedFonts.length > 0 && customText.trim() !== '' && customText !== DEFAULT_TEXT_PLACEHOLDER ? (
                                <div className="space-y-6">
                                    {selectedFonts.map(font => (
                                        <div key={font}>
                                            <div className="text-sm text-slate-500" style={{ fontFamily: font }}>{font}</div>
                                            <p className="text-3xl md:text-4xl text-black" style={{ fontFamily: font }}>
                                                {customText.split('\n').map((line, index) => (
                                                    <React.Fragment key={index}>{line}<br /></React.Fragment>
                                                ))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <p>Select a font and type some text to see a preview.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="text-center pt-4">
                        <button onClick={handleSaveSvg} className="px-12 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300">
                            Save Live Preview as SVG
                        </button>
                    </div>

                </main>

                <footer className="text-center text-slate-400 mt-12 py-6 border-t">
                    &copy; {new Date().getFullYear()} ArchFontHub. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
};

export default App;