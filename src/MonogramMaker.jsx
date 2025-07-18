import React, { useState, useMemo } from 'react';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    // Flatten font list for easy mapping
    const monogramFonts = useMemo(() => {
        return Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
    }, [fontLibrary]);

    // Set default font on mount
    const [selectedFont, setSelectedFont] = useState(monogramFonts.find(f => f.category === 'Serif') || monogramFonts[0]);
    const [activeStyle, setActiveStyle] = useState(Object.keys(selectedFont.styles)[0]);

    // State for initials and font size
    const [firstInitial, setFirstInitial] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [lastInitial, setLastInitial] = useState('');
    const [fontSize, setFontSize] = useState(100);

    const handleInsert = () => {
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

                {/* Responsive Main Content */}
                <div className="flex-1 flex flex-col-reverse md:flex-row overflow-y-auto">
                    {/* Controls */}
                    <section className="w-full md:w-1/2 p-5 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-100">
                        {/* Font Selection */}
                        <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-3">Font</h3>
                            <div className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:max-h-52 md:overflow-y-auto">
                                {monogramFonts.map(font => (
                                    <button
                                        key={font.name}
                                        onClick={() => {
                                            setSelectedFont(font);
                                            setActiveStyle(Object.keys(font.styles)[0]);
                                        }}
                                        className={`min-w-[120px] md:min-w-0 px-4 py-2 rounded-xl border text-base transition
                                            ${selectedFont.name === font.name ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white border-slate-200 hover:bg-blue-50 text-slate-800'}`}
                                        style={{
                                            fontFamily: font.styles[Object.keys(font.styles)[0]],
                                            fontWeight: 500,
                                            letterSpacing: "0.04em",
                                            outline: selectedFont.name === font.name ? '2px solid #2563eb' : 'none'
                                        }}
                                    >
                                        {font.name}
                                        <span className="ml-1 text-xs opacity-60">({font.category})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Initials Input */}
                        <div>
                            <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-3">Initials</h3>
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

                        {/* Font Size Slider */}
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

                    {/* Preview */}
                    <aside className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white md:bg-gradient-to-tr md:from-blue-50 md:to-white p-5">
                        <div className="w-full h-56 md:h-[70%] flex items-center justify-center rounded-xl border border-slate-200 shadow-inner bg-white mb-6 md:mb-0">
                            <div
                                className="flex items-baseline justify-center w-full transition-all duration-150"
                                style={{
                                    fontFamily: selectedFont.styles[activeStyle],
                                    fontSize: `${fontSize}px`,
                                    lineHeight: 1,
                                    letterSpacing: "0.05em",
                                }}
                            >
                                <span className="transition-all duration-150">{firstInitial || 'F'}</span>
                                <span className="transition-all duration-150" style={{ fontSize: '1.5em' }}>
                                    {middleInitial || 'M'}
                                </span>
                                <span className="transition-all duration-150">{lastInitial || 'L'}</span>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Footer: Always visible & floating on mobile */}
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
