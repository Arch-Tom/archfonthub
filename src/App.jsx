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
            {/* ... existing JSX remains intact ... */}
        </div>
    );
};

export default App;
