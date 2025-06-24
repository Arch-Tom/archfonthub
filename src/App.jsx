import React, { useState } from 'react';

const App = () => {
    const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

    // --- FONT LIBRARY SYNCHRONIZED WITH PostScriptFontList.txt ---
    const fontLibrary = {
        'Sans-serif': [
            { name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } },
            { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } },
            { name: 'Century Gothic', styles: { regular: 'CenturyGothicPaneuropean', bold: 'CenturyGothicPaneuropean-Bold', boldItalic: 'CenturyGothicPaneuropean-BoldItalic' } },
            { name: 'Berlin Sans FB', styles: { regular: 'BerlinSansFB-Reg', bold: 'BerlinSansFB-Bold' } },
            { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } },
            { name: 'Zapf Humanist', styles: { demi: 'ZapfHumanist601BT-Demi' } },
            { name: 'Graphik', styles: { thin: 'Graphik-Thin', regular: 'Graphik-Regular', medium: 'Graphik-Medium', semibold: 'Graphik-Semibold' } },
        ],
        'Serif': [
            { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },
            { name: 'Garamond', styles: { regular: 'Garamond' } },
            { name: 'Garamond 3 LT Std', styles: { regular: 'Garamond3LTStd', bold: 'Garamond3LTStd-Bold', italic: 'Garamond3LTStd-Italic', boldItalic: 'Garamond3LTStd-BoldItalic' } },
            { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BenguiatITCbyBT-Bold', italic: 'BenguiatITCbyBT-BookItalic' } },
            { name: 'Century Schoolbook', styles: { regular: 'CenturySchoolbook', bold: 'CenturySchoolbook-Bold', boldItalic: 'CenturySchoolbook-BoldItalic' } },
            { name: 'CopprplGoth BT', styles: { regular: 'CopperplateGothicBT-Roman' } },
        ],
        'Script & Display': [
            { name: 'Amazone BT', styles: { regular: 'AmazoneBT-Regular' } },
            { name: 'Angelface', styles: { regular: 'Angelface' } },
            { name: 'Birds of Paradise', styles: { regular: 'BirdsofParadise-PersonaluseOnly' } },
            { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
            { name: 'Clicker Script', styles: { regular: 'ClickerScript-Regular' } },
            { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
            { name: 'Courgette', styles: { regular: 'Courgette-Regular' } },
            { name: 'Cowboy Rodeo', styles: { regular: 'CowboyRodeoW01-Regular' } },
            { name: 'Freebooter Script', styles: { regular: 'FreebooterScript' } },
            { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } },
            { name: 'Honey Script', styles: { light: 'HoneyScript-Light', semiBold: 'HoneyScript-SemiBold' } },
            { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } },
            { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } },
            { name: 'Lisbon Script', styles: { regular: 'LisbonScript-Regular' } },
            { name: 'Machine BT', styles: { regular: 'MachineITCbyBT-Regular' } },
            { name: 'Murray Hill', styles: { regular: 'MurrayHill' } },
            { name: 'Old English Text MT', styles: { regular: 'OldEnglishTextMT' } },
            { name: 'Planscribe', styles: { regular: 'PlanscribeNFW01-Regular' } },
            { name: 'Tinplate Titling Black', styles: { regular: 'TinplateTitlingBlack' } },
        ],
    };

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
/* commit to revert changes */