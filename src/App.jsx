import React, { useState } from 'react';

const App = () => {
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';
    const MAX_SELECTED_FONTS = 3;
    const [text, setText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    const categorizedFonts = {
        'Sans-serif': ['Arial', 'Calibri', 'Century Gothic', 'Berlin Sans FB', 'Bebas Neue', 'Zapf Humanist'],
        'Serif': ['Benguiat', 'Benguiat Bk BT', 'Garamond', 'Times New Roman'],
        'Script': ['I Love Glitter', 'Amazone BT', 'Great Vibes', 'Honey Script', 'ITC Zapf Chancery', 'BlackChancery', 'Murray Hill'],
        'Display': ['Copperplate Gothic', 'Tinplate Titling Black', 'ChocolateBox', 'CollegiateBlackFLF'],
    };

    const handleFontToggle = (font) => {
        setSelectedFonts((prev) =>
            prev.includes(font)
                ? prev.filter((f) => f !== font)
                : prev.length < MAX_SELECTED_FONTS
                    ? [...prev, font]
                    : prev
        );
    };

    const downloadSVG = (svgContent, fileName) => {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateStyledSVG = ({ text, fontFamily, fontSize, isBold, isItalic, fill }) => {
        const fontWeight = isBold ? 'bold' : 'normal';
        const fontStyle = isItalic ? 'italic' : 'normal';
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="300">
  <text x="50" y="150"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        font-style="${fontStyle}"
        fill="${fill}">
    ${text}
  </text>
</svg>`;
    };

    const handleExport = () => {
        selectedFonts.forEach((font) => {
            const svg = generateStyledSVG({
                text,
                fontFamily: font,
                fontSize: 48,
                isBold,
                isItalic,
                fill: 'black',
            });
            downloadSVG(svg, `${font.replace(/ /g, '_')}.svg`);
        });
    };

    return (
        <div className="p-4 font-sans">
            <h1 className="text-xl font-bold mb-2">Arch Font Hub</h1>

            <textarea
                className="w-full p-2 border rounded mb-4"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="flex gap-4 mb-4">
                <label>
                    <input type="checkbox" checked={isBold} onChange={() => setIsBold(!isBold)} /> Bold
                </label>
                <label>
                    <input type="checkbox" checked={isItalic} onChange={() => setIsItalic(!isItalic)} /> Italic
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(categorizedFonts).map(([category, fonts]) => (
                    <div key={category}>
                        <h2 className="font-semibold text-sm mb-1">{category}</h2>
                        {fonts.map((font) => (
                            <button
                                key={font}
                                onClick={() => handleFontToggle(font)}
                                className={`w-full py-1 px-2 mb-1 rounded border ${selectedFonts.includes(font) ? 'bg-blue-200' : 'bg-white'
                                    }`}
                                style={{ fontFamily: font }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <button
                onClick={handleExport}
                className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
            >
                Export Selected Fonts
            </button>
        </div>
    );
};

export default App;
