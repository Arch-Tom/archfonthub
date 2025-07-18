import React, { useState, useMemo } from 'react';
import MonogramPreview from './MonogramPreview'; // <-- import the shared preview!

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    const monogramFonts = useMemo(() => {
        return Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
    }, [fontLibrary]);

    const [selectedFont, setSelectedFont] = useState(
        monogramFonts.find(f => f.category === 'Serif') || monogramFonts[0]
    );
    const [activeStyle, setActiveStyle] = useState(Object.keys(selectedFont.styles)[0]);
    const [firstInitial, setFirstInitial] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastInitial, setLastInitial] = useState('');
    const [fontSize, setFontSize] = useState(100);

    // Ensure selectedFont/activeStyle are always in sync
    React.useEffect(() => {
        setActiveStyle(Object.keys(selectedFont.styles)[0]);
    }, [selectedFont]);

    const handleInsert = () => {
        if (!firstInitial || !middleInitial || !lastInitial) return;
        onInsert({
            text: `${firstInitial}${middleInitial}${lastInitial}`,
            font: selectedFont,
            style: activeStyle,
            fontSize,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-[3px] p-2 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full md:max-w-5xl md:h-[90vh] flex flex-col overflow-hidden transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/95 border-b border-slate-200 flex justify-between items-center px-5 py-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Alumni Sans Regular' }}>
                            Monogram Maker
                        </h2>
                        <p className="text-slate-500 text-sm">Create your three-letter monogram instantly.</p>
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
                <div className="flex-1 flex flex-col-reverse md:flex-row overflow-y-auto">

                    {/* Controls: mobile and desktop */}
                    <section className="w-full md:w-1/2 flex flex-col gap-7 p-5 bg-gradient-to-br from-slate-50 via-white to-slate-100">

                        {/* === Initials input (at the top) === */}
                        <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-3">Your Initials</h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="F"
                                    value={firstInitial}
                                    onChange={e => setFirstInitial(e.target.value.toUpperCase())}
                                    maxLength={1}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-3xl md:text-4xl text-center rounded-2xl focus:ring-2 focus:ring-blue-500 transition"
                                />
                                <input
                                    type="text"
                                    placeholder="M"
                                    value={middleInitial}
                                    onChange={e => setMiddleInitial(e.target.value.toUpperCase())}
                                    maxLength={1}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-3xl md:text-4xl text-center rounded-2xl focus:ring-2 focus:ring-blue-500 transition"
                                />
                                <input
                                    type="text"
                                    placeholder="L"
                                    value={lastInitial}
                                    onChange={e => setLastInitial(e.target.value.toUpperCase())}
                                    maxLength={1}
                                    className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-3xl md:text-4xl text-center rounded-2xl focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* === Font Selection Area - Grid of mini-cards === */}
                        <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-3">Choose a Font</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {monogramFonts.map(font => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font)}
                                        className={`group flex flex-col items-center justify-center px-2 py-3 rounded-xl border-2 transition
                      ${selectedFont.name === font.name
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                                        style={{
                                            minHeight: '90px',
                                            outline: selectedFont.name === font.name ? '2px solid #2563eb55' : 'none',
                                        }}
                                    >
                                        {/* Monogram preview for the font */}
                                        <MonogramPreview
                                            first={firstInitial || 'F'}
                                            middle={middleInitial || 'M'}
                                            last={lastInitial || 'L'}
                                            fontFamily={font.styles[Object.keys(font.styles)[0]]}
                                            fontSize={36}
                                            middleScale={1.5}
                                            className="mb-1"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{font.name}</span>
                                        <span className="text-[11px] text-slate-400">{font.category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* === Font Size === */}
                        <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-3">Size</h3>
                            <div className="flex items-center gap-4">
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

                    {/* === Preview Area === */}
                    <aside className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white md:bg-gradient-to-tr md:from-blue-50 md:to-white p-5">
                        <div className="w-full h-56 md:h-[70%] flex items-center justify-center rounded-xl border border-slate-200 shadow-inner bg-white mb-6 md:mb-0">
                            <MonogramPreview
                                first={firstInitial || 'F'}
                                middle={middleInitial || 'M'}
                                last={lastInitial || 'L'}
                                fontFamily={selectedFont.styles[activeStyle]}
                                fontSize={fontSize}
                                middleScale={1.5}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </aside>
                </div>

                {/* Footer Actions */}
                <footer className="sticky bottom-0 left-0 w-full bg-white/95 border-t border-slate-200 px-4 py-3 flex flex-row-reverse justify-between gap-3 z-20">
                    <button
                        onClick={handleInsert}
                        disabled={!firstInitial || !middleInitial || !lastInitial}
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
