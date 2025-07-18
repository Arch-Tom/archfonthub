import React, { useState, useMemo, useRef, useEffect } from 'react';
import MonogramPreview from './MonogramPreview';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    // --- STATE AND REFS ---
    const monogramFonts = useMemo(() => {
        return Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
    }, [fontLibrary]);

    const [selectedFont, setSelectedFont] = useState(
        monogramFonts.find(f => f.category === 'Serif') || monogramFonts[0]
    );
    const [activeStyle, setActiveStyle] = useState(Object.keys(selectedFont.styles)[0]);

    // Use a single array for initials to simplify state management
    const [initials, setInitials] = useState(['', '', '']);

    const [fontSize, setFontSize] = useState(100);

    // Create refs for each input field to manage focus
    const inputRefs = useRef([]);

    // --- EFFECTS ---

    // Set initial focus on the first input when the modal mounts
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Effect to update the active style when the font changes
    useEffect(() => {
        setActiveStyle(Object.keys(selectedFont.styles)[0]);
    }, [selectedFont]);


    // --- HANDLERS ---

    // Handles changes for any of the three initial inputs
    const handleInitialChange = (e, index) => {
        const newInitials = [...initials];
        // Limit to a single uppercase character
        newInitials[index] = e.target.value.slice(0, 1).toUpperCase();
        setInitials(newInitials);

        // If a character was entered and it's not the last input, move focus to the next one
        if (e.target.value && index < 2) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handles the backspace key to move focus backward
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !initials[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleInsert = () => {
        const [first, middle, last] = initials;
        if (!first || !middle || !last) return;

        onInsert({
            text: initials.join(''),
            font: selectedFont,
            style: activeStyle,
            fontSize,
        });
        onClose();
    };

    // --- RENDER ---

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-[3px] p-0 sm:p-2 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-5xl h-screen sm:h-[90vh] flex flex-col overflow-hidden transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/95 border-b border-slate-200 flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4">
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Alumni Sans Regular' }}>
                            Monogram Maker
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm">Create your three-letter monogram instantly.</p>
                    </div>
                    <button
                        className="text-3xl font-light text-slate-400 hover:text-slate-800 transition p-2 -mr-2"
                        onClick={onClose}
                        title="Close"
                    >
                        &times;
                    </button>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex flex-row overflow-y-auto">
                    {/* === Controls: left side === */}
                    <section className="w-full md:w-1/2 flex flex-col gap-6 px-3 sm:p-5 pb-28 sm:pb-0 max-w-xl min-w-[320px]">
                        {/* Initials input */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">Your Initials</h3>
                            <div className="flex gap-3">
                                {initials.map((initial, index) => (
                                    <input
                                        key={index}
                                        ref={el => (inputRefs.current[index] = el)}
                                        type="text"
                                        placeholder={['F', 'L', 'M'][index]}
                                        value={initial}
                                        onChange={e => handleInitialChange(e, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        maxLength={1}
                                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-2xl sm:text-3xl md:text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Font Selection Area */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">Choose a Font</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                {monogramFonts.map(font => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font)}
                                        className={`group flex flex-col items-center justify-center px-2 py-3 rounded-xl border-2 transition
                                            ${selectedFont.name === font.name
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                                        style={{
                                            minHeight: '80px',
                                            outline: selectedFont.name === font.name ? '2px solid #2563eb55' : 'none',
                                        }}
                                    >
                                        <MonogramPreview
                                            first={initials[0] || 'F'}
                                            middle={initials[1] || 'L'}
                                            last={initials[2] || 'M'}
                                            fontFamily={font.styles[Object.keys(font.styles)[0]]}
                                            fontSize={28}
                                            middleScale={1.5}
                                            className="mb-1"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{font.name}</span>
                                        <span className="text-[11px] text-slate-400">{font.category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">Size</h3>
                            <div className="flex items-center gap-3">
                                <input
                                    id="monogramFontSize"
                                    type="range"
                                    min={50}
                                    max={250}
                                    value={fontSize}
                                    onChange={e => setFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600"
                                />
                                <span className="font-semibold text-slate-600 w-12 text-center">{fontSize}px</span>
                            </div>
                        </div>
                    </section>

                    {/* === Preview: right side === */}
                    <aside className="flex-1 flex flex-col items-center justify-center bg-white md:bg-gradient-to-tr md:from-blue-50 md:to-white px-3 sm:p-5 pt-5 sm:pt-5 min-w-[200px]">
                        <div className="w-full h-40 sm:h-56 md:h-[70%] flex items-center justify-center rounded-xl border border-slate-200 shadow-inner bg-white mb-5 sm:mb-6">
                            <MonogramPreview
                                first={initials[0] || 'F'}
                                middle={initials[1] || 'L'}
                                last={initials[2] || 'M'}
                                fontFamily={selectedFont.styles[activeStyle]}
                                fontSize={fontSize}
                                middleScale={1.5}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </aside>
                </div>

                {/* Footer Actions */}
                <footer className="fixed sm:sticky bottom-0 left-0 w-full bg-white/95 border-t border-slate-200 px-4 py-3 flex flex-row-reverse justify-between gap-3 z-20">
                    <button
                        onClick={handleInsert}
                        disabled={!initials[0] || !initials[1] || !initials[2]}
                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Monogram
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-200 text-slate-800 rounded-2xl hover:bg-slate-300 font-semibold transition-colors text-base"
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}