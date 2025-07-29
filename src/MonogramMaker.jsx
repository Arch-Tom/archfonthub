import React, { useState, useMemo, useRef, useEffect } from 'react';
import CircularMonogram from './CircularMonogram';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    const monogramFonts = useMemo(() => {
        const fonts = Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
        return [
            ...fonts,
            { name: 'Circular Monogram', category: 'Special', circular: true, frameStyle: 'none' }
        ];
    }, [fontLibrary]);

    const [monogramStyle, setMonogramStyle] = useState('classic'); // 'classic' | 'flat' | 'circular'
    const [selectedFont, setSelectedFont] = useState(monogramFonts[0]);
    const [activeStyle, setActiveStyle] = useState(
        selectedFont.circular ? null : Object.keys(selectedFont.styles || {})[0]
    );
    const [initials, setInitials] = useState(['', '', '']);
    const [fontSize] = useState(100);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, []);

    useEffect(() => {
        if (!selectedFont.circular && selectedFont.styles) {
            setActiveStyle(Object.keys(selectedFont.styles)[0]);
        }
    }, [selectedFont]);

    const visibleFonts = monogramFonts.filter(font => {
        if (monogramStyle === 'circular') return font.circular;
        return !font.circular;
    });

    const handleInitialChange = (e, index) => {
        const newInitials = [...initials];
        newInitials[index] = e.target.value.slice(0, 1).toUpperCase();
        setInitials(newInitials);
        if (e.target.value && index < 2) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !initials[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleInsert = () => {
        const [first, middle, last] = initials;
        if (!first || !middle || !last) return;
        onInsert({
            text: [first, middle, last],
            font: selectedFont,
            style: activeStyle,
            fontSize,
            isCircular: monogramStyle === 'circular',
            frameStyle: monogramStyle === 'circular' ? selectedFont.frameStyle || 'none' : 'none',
            disableScaling: monogramStyle === 'flat'
        });
        onClose();
    };

    const previewBox = (
        <div className="w-full flex flex-col items-center mb-2">
            <label className="text-xs font-semibold text-slate-500 mb-1" htmlFor="monogram-preview-box">Preview</label>
            <div
                id="monogram-preview-box"
                className="w-full max-w-[400px] flex items-center justify-center rounded-xl border border-slate-200 shadow-inner bg-white px-2"
                style={{ height: '180px', minHeight: '180px' }}
            >
                <CircularMonogram
                    text={[
                        initials[0] || 'N',
                        initials[1] || 'X',
                        initials[2] || 'D'
                    ]}
                    fontSize={monogramStyle === 'circular' ? fontSize * 1.2 : fontSize}
                    frameStyle={monogramStyle === 'circular' ? selectedFont.frameStyle || 'none' : 'none'}
                    color={
                        monogramStyle === 'circular'
                            ? (selectedFont.frameStyle && selectedFont.frameStyle !== 'none' ? 'white' : 'black')
                            : 'black'
                    }
                    fontFamily={monogramStyle === 'circular' ? undefined : selectedFont.styles?.[activeStyle]}
                    isCircular={monogramStyle === 'circular'}
                    disableScaling={monogramStyle === 'flat'}
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-[3px] p-0 sm:p-2 animate-fade-in" onClick={onClose}>
            <div className="relative bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl h-screen sm:h-[90vh] flex flex-col overflow-hidden transition-all" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/95 border-b border-slate-200 flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4">
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Alumni Sans Regular' }}>
                            Monogram Maker
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm">Create your three-letter monogram instantly.</p>
                    </div>
                    <button className="text-3xl font-light text-slate-400 hover:text-slate-800 transition p-2 -mr-2" onClick={onClose} title="Close">
                        &times;
                    </button>
                </header>

                <div className="flex-1 flex flex-col overflow-y-auto pb-[100px] items-center px-4 sm:px-6">
                    {/* Initials input & Style Selector */}
                    <div className="w-full max-w-xl flex flex-col gap-4 mt-6">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 text-center">Your Initials</h3>
                            <div className="flex justify-center gap-3">
                                {initials.map((initial, index) => (
                                    <input
                                        key={index}
                                        ref={el => (inputRefs.current[index] = el)}
                                        type="text"
                                        placeholder={['N', 'X', 'D'][index]}
                                        value={initial}
                                        onChange={e => handleInitialChange(e, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        maxLength={1}
                                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white border-2 border-slate-200 text-2xl sm:text-3xl md:text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Style Buttons */}
                        <div className="flex justify-center gap-2 bg-slate-100 p-1 rounded-xl shadow-inner overflow-x-auto">
                            {['classic', 'flat', 'circular'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => setMonogramStyle(style)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition 
                                        ${monogramStyle === style
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                                >
                                    {style === 'classic' ? 'Classic' : style === 'flat' ? 'All Same Size' : 'Circular'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="w-full max-w-xl mt-6">
                        {previewBox}
                    </div>

                    {/* Font Selection */}
                    {monogramStyle !== 'circular' && (
                        <div className="w-full max-w-2xl mt-6">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 text-center">Choose a Font</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {visibleFonts.map(font => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font)}
                                        className={`group flex flex-col items-center justify-between rounded-xl border-2 transition h-32 w-full p-3
                                            ${selectedFont.name === font.name
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
                                    >
                                        <CircularMonogram
                                            text={[
                                                initials[0] || 'N',
                                                initials[1] || 'X',
                                                initials[2] || 'D'
                                            ]}
                                            fontSize={32}
                                            fontFamily={font.circular ? undefined : font.styles?.[Object.keys(font.styles)[0]]}
                                            isCircular={font.circular}
                                            disableScaling={monogramStyle === 'flat'}
                                            color="black"
                                        />
                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 text-center">{font.name}</span>
                                        <span className="text-[11px] text-slate-400">{font.category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl hover:bg-slate-300 font-semibold transition-colors shadow-sm text-base"
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}
