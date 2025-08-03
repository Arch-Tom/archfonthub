import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import CircularMonogram from './CircularMonogram';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    const monogramFonts = useMemo(() => {
        const fonts = Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
        return [
            ...fonts,
            { name: 'Circular Monogram', category: 'Special', circular: true, styles: {} }
        ];
    }, [fontLibrary]);

    const [monogramStyle, setMonogramStyle] = useState('classic');
    const [selectedFont, setSelectedFont] = useState(monogramFonts[0]);
    const [activeStyle, setActiveStyle] = useState(Object.keys(selectedFont.styles)[0]);
    const [initials, setInitials] = useState(['', '', '']);
    const [fontSize, setFontSize] = useState(72);
    const [frameStyle, setFrameStyle] = useState('none');

    // keep the circular font selected if the user switches back and forth
    useEffect(() => {
        if (monogramStyle === 'circular') {
            setSelectedFont(monogramFonts.find(f => f.circular));
        } else {
            setSelectedFont(monogramFonts.find(f => !f.circular));
        }
    }, [monogramStyle, monogramFonts]);

    const visibleFonts = monogramFonts.filter(font => !font.circular);

    const previewProps = {
        text: initials.map(i => i || 'A'),
        style: activeStyle,
        fontFamily: selectedFont.family,
        fontWeight: selectedFont.weight,
        fontSize,
        isCircular: monogramStyle === 'circular',
        frameStyle: monogramStyle === 'circular' ? frameStyle : 'none',
        disableScaling: monogramStyle === 'flat'
    };

    const previewBox = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            {monogramStyle === 'circular' ? (
                <CircularMonogram
                    text={previewProps.text}
                    fontSize={80} // Base size for circular preview
                    isCircular
                    frameStyle={frameStyle}
                />
            ) : (
                <div
                    style={{
                        fontFamily: selectedFont.family,
                        fontWeight: selectedFont.weight,
                        fontSize: `${fontSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {previewProps.text.join('')}
                </div>
            )}
        </div>
    );

    const handleInsert = () => {
        const svgString = ReactDOMServer.renderToStaticMarkup(
            monogramStyle === 'circular'
                ? <CircularMonogram {...previewProps} />
                : <div
                    style={{
                        fontFamily: selectedFont.family,
                        fontWeight: selectedFont.weight,
                        fontSize: `${fontSize}px`
                    }}
                >
                    {previewProps.text.join('')}
                </div>
        );
        onInsert(`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-4 sm:mx-6">
                <header className="flex justify-between items-center px-4 py-3 border-b">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ fontFamily: 'Alumni Sans Regular' }}>
                            Monogram Maker
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Create your three-letter monogram instantly.
                        </p>
                    </div>
                    <button
                        className="text-3xl font-light text-slate-800 transition p-2 -mr-2"
                        onClick={onClose}
                        title="Close"
                    >
                        &times;
                    </button>
                </header>

                <div className="flex-1 flex flex-col overflow-y-auto pb-[100px] items-center px-4 sm:px-6">
                    {/* Initials Input */}
                    <div className="w-full max-w-xl flex flex-col gap-4 mt-6">
                        <div>
                            <h3 className="text-base sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                                Your Initials
                            </h3>
                            <div className="flex justify-center gap-3">
                                {initials.map((val, idx) => (
                                    <input
                                        key={idx}
                                        value={val}
                                        onChange={e => {
                                            const newInit = [...initials];
                                            newInit[idx] = e.target.value.toUpperCase().slice(0, 1);
                                            setInitials(newInit);
                                        }}
                                        maxLength={1}
                                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-medium border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Monogram Style */}
                        <div>
                            <h3 className="text-base sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                                Monogram Style
                            </h3>
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
                                        {style === 'classic'
                                            ? 'Classic'
                                            : style === 'flat'
                                                ? 'All Same Size'
                                                : 'Circular'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Frame Style (Circular Only) */}
                        {monogramStyle === 'circular' && (
                            <div className="w-full max-w-xl mt-6">
                                <h3 className="text-base sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                                    Frame Style
                                </h3>
                                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl shadow-inner">
                                    {['none', 'solid', 'double', 'dotted', 'outline', 'thick-thin'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setFrameStyle(style)}
                                            className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize transition
                                                ${frameStyle === style
                                                    ? 'bg-blue-600 text-white shadow'
                                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                                        >
                                            {style.replace('-', ' & ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Live Preview */}
                        <div className="w-full max-w-xl mt-6">
                            {previewBox}
                        </div>

                        {/* Font Picker (Non-Circular) */}
                        {monogramStyle !== 'circular' && (
                            <div className="w-full max-w-2xl mt-6">
                                <h3 className="text-base sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 text-center">
                                    Choose a Font
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {visibleFonts.map(font => (
                                        <button
                                            key={font.name}
                                            onClick={() => {
                                                setSelectedFont(font);
                                                setActiveStyle(Object.keys(font.styles)[0]);
                                            }}
                                            className={`group flex flex-col items-center justify-between rounded-xl border-2 transition h-32 w-full p-3
                                                ${selectedFont.name === font.name
                                                    ? 'border-blue-600'
                                                    : 'border-transparent hover:border-slate-300'}`}
                                        >
                                            <div className="flex items-center justify-center flex-1">
                                                <span
                                                    className="text-2xl font-bold group-hover:text-blue-700"
                                                    style={{ fontFamily: font.family }}
                                                >
                                                    AB
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400">{font.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                <footer className="fixed sm:sticky bottom-0 left-0 right-0 bg-white border-t sm:border-t-0 sm:bg-transparent px-4 py-3 flex flex-row-reverse justify-between gap-3 z-20">
                    <button
                        onClick={handleInsert}
                        disabled={!initials.every(ch => ch)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Insert Monogram
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg border border-slate-300 font-semibold transition-colors shadow-sm text-base"
                    >
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}
