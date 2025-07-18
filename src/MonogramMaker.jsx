import React, { useState, useMemo } from 'react';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    // Use useMemo to flatten the font list. The filter for Script fonts has been removed.
    const monogramFonts = useMemo(() => {
        return Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
    }, [fontLibrary]);

    // Set a default font on initial render
    const [selectedFont, setSelectedFont] = useState(monogramFonts.find(f => f.category === 'Serif') || monogramFonts[0]);
    const [activeStyle, setActiveStyle] = useState(Object.keys(selectedFont.styles)[0]);

    // Use three separate state variables for each initial
    const [firstInitial, setFirstInitial] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastInitial, setLastInitial] = useState('');

    const [fontSize, setFontSize] = useState(100);

    const handleInsert = () => {
        // Check if all three initials are provided
        if (!firstInitial || !middleInitial || !lastInitial) return;

        onInsert({
            text: `${firstInitial}${middleInitial}${lastInitial}`,
            font: selectedFont,
            style: activeStyle,
            fontSize: fontSize,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Alumni Sans Regular' }}>Monogram Maker</h2>
                        <p className="text-slate-500">Design your three-letter monogram for preview.</p>
                    </div>
                    <button className="text-3xl font-light text-slate-500 hover:text-slate-900" onClick={onClose} title="Close">&times;</button>
                </div>

                {/* Main Content (2-column layout) */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* === Left Column: Controls === */}
                    <div className="w-full md:w-1/2 p-6 space-y-6 overflow-y-auto border-r border-slate-200">
                        {/* 1. Font Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">1. Select a Font</h3>
                            <div className="max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                {monogramFonts.map(font => (
                                    <button
                                        key={font.name}
                                        onClick={() => {
                                            setSelectedFont(font);
                                            setActiveStyle(Object.keys(font.styles)[0]);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-colors text-lg ${selectedFont.name === font.name ? 'bg-blue-600 text-white shadow' : 'bg-white hover:bg-blue-50'}`}
                                        style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
                                    >
                                        {font.name} <span className="text-xs opacity-70">({font.category})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Initials Input */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">2. Enter Initials</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <input type="text" placeholder="First" value={firstInitial} onChange={e => setFirstInitial(e.target.value.toUpperCase())} maxLength="1" className="p-4 text-center text-2xl border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <input type="text" placeholder="Middle" value={middleInitial} onChange={e => setMiddleInitial(e.target.value.toUpperCase())} maxLength="1" className="p-4 text-center text-2xl border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <input type="text" placeholder="Last" value={lastInitial} onChange={e => setLastInitial(e.target.value.toUpperCase())} maxLength="1" className="p-4 text-center text-2xl border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        </div>

                        {/* 3. Font Size Slider */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">3. Adjust Size</h3>
                            <div className="flex items-center gap-4">
                                <input id="monogramFontSize" type="range" min="50" max="250" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                <span className="font-semibold text-slate-600 w-16 text-center">{fontSize}px</span>
                            </div>
                        </div>
                    </div>

                    {/* === Right Column: Preview === */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
                        <div className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-200 flex items-center justify-center overflow-hidden">
                            {/* Spacing and alignment has been adjusted here */}
                            <div
                                className="flex items-baseline justify-center transition-all duration-150"
                                style={{
                                    fontFamily: selectedFont.styles[activeStyle],
                                    fontSize: `${fontSize}px`,
                                    lineHeight: 1,
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <span className="transition-all duration-150">{firstInitial || 'F'}</span>
                                <span className="transition-all duration-150" style={{ fontSize: '1.5em' }}>
                                    {middleInitial || 'M'}
                                </span>
                                <span className="transition-all duration-150">{lastInitial || 'L'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors text-base">
                        Cancel
                    </button>
                    <button
                        onClick={handleInsert}
                        disabled={!firstInitial || !middleInitial || !lastInitial}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Monogram
                    </button>
                </div>
            </div>
        </div>
    );
}