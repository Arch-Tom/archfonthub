import React, { useState } from 'react';
import CircularMonogram from './CircularMonogram';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    const [firstLetter, setFirstLetter] = useState('');
    const [middleLetter, setMiddleLetter] = useState('');
    const [lastLetter, setLastLetter] = useState('');
    const [monogramFontSize, setMonogramFontSize] = useState(100);
    const [selectedFont, setSelectedFont] = useState(Object.values(fontLibrary)[0][0]);
    const [selectedFrameStyle, setSelectedFrameStyle] = useState('none');

    const isCircularMonogram = selectedFont.name === 'Circular Monogram Style';

    const handleInsert = () => {
        if (!firstLetter || !middleLetter || !lastLetter) return;
        onInsert({
            text: [firstLetter.toUpperCase(), middleLetter.toUpperCase(), lastLetter.toUpperCase()],
            font: selectedFont,
            fontSize: monogramFontSize,
            isCircular: isCircularMonogram,
            frameStyle: selectedFrameStyle,
        });
    };

    const frameStyles = ['none', 'solid', 'double', 'dotted'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Monogram Maker</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Letters Input */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <input
                        type="text"
                        maxLength={1}
                        value={firstLetter}
                        onChange={(e) => setFirstLetter(e.target.value)}
                        placeholder="A"
                        className="text-center text-3xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        maxLength={1}
                        value={middleLetter}
                        onChange={(e) => setMiddleLetter(e.target.value)}
                        placeholder="B"
                        className="text-center text-3xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        maxLength={1}
                        value={lastLetter}
                        onChange={(e) => setLastLetter(e.target.value)}
                        placeholder="C"
                        className="text-center text-3xl p-4 border rounded-xl focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Font Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-slate-800">Choose a Font</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Object.entries(fontLibrary).flatMap(([category, fonts]) =>
                            fonts.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => setSelectedFont(font)}
                                    className={`p-3 border rounded-lg text-center transition-all text-base font-medium ${selectedFont.name === font.name
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-800 border-slate-300 hover:bg-blue-50'
                                        }`}
                                    style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
                                >
                                    {font.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Frame Style Selection (Only for Circular Monogram) */}
                {isCircularMonogram && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-slate-800">Frame Style</h3>
                        <div className="flex flex-wrap gap-3">
                            {frameStyles.map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedFrameStyle(style)}
                                    className={`px-4 py-2 rounded-lg border transition-all ${selectedFrameStyle === style
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-slate-800 border-slate-300 hover:bg-blue-50'
                                        }`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monogram Preview */}
                <div className="mb-6 flex justify-center">
                    <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-center">
                        <CircularMonogram
                            text={[
                                firstLetter || 'A',
                                middleLetter || 'B',
                                lastLetter || 'C',
                            ]}
                            fontSize={monogramFontSize}
                            frameStyle={isCircularMonogram ? selectedFrameStyle : 'none'}
                            color={isCircularMonogram && selectedFrameStyle !== 'none' ? 'white' : 'black'}
                        />
                    </div>
                </div>

                {/* Font Size Slider */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <label className="text-slate-700">Size</label>
                    <input
                        type="range"
                        min="50"
                        max="200"
                        step="1"
                        value={monogramFontSize}
                        onChange={(e) => setMonogramFontSize(Number(e.target.value))}
                        className="w-48"
                    />
                    <span className="text-slate-700">{monogramFontSize}px</span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInsert}
                        disabled={!firstLetter || !middleLetter || !lastLetter}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Monogram
                    </button>
                </div>
            </div>
        </div>
    );
}
