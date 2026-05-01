import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import CircularMonogram from './CircularMonogram.jsx';
import SplitLetterMonogram from './SplitLetterMonogram.jsx';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
    const monogramFonts = useMemo(() => {
        const fonts = Object.entries(fontLibrary)
            .flatMap(([category, fonts]) => fonts.map(font => ({ ...font, category })));
        return [
            ...fonts,
            { name: 'Circular Monogram', category: 'Special', circular: true, styles: {} }
        ];
    }, [fontLibrary]);

    const defaultFont = useMemo(() => monogramFonts.find(f => !f.circular) || monogramFonts[0], [monogramFonts]);

    const [monogramStyle, setMonogramStyle] = useState('classic');
    const [selectedFont, setSelectedFont] = useState(defaultFont);
    const [activeStyle, setActiveStyle] = useState(Object.keys(defaultFont.styles)[0]);

    // State for classic/flat/circular
    const [initials, setInitials] = useState(['', '', '']);
    const [frameStyle, setFrameStyle] = useState('none');

    // State for split-letter
    const [splitInitial, setSplitInitial] = useState('');
    const [splitName, setSplitName] = useState('');

    const [fontSize] = useState(100);
    const inputRefs = useRef([]);
    const splitInitialInputRef = useRef(null);
    const splitNameInputRef = useRef(null);

    useEffect(() => {
        if (monogramStyle === 'split') {
            splitInitialInputRef.current?.focus();
        } else {
            inputRefs.current[0]?.focus();
        }
    }, [monogramStyle]);

    // UPDATE: This effect now sets the default font based on the selected monogram style.
    useEffect(() => {
        if (monogramStyle === 'circular') {
            const circularFont = monogramFonts.find(f => f.circular);
            if (circularFont) {
                setSelectedFont(circularFont);
                setActiveStyle(null);
            }
        } else if (monogramStyle === 'split') {
            const timesFont = monogramFonts.find(f => f.name === 'Times New Roman');
            if (timesFont) {
                setSelectedFont(timesFont);
                setActiveStyle(Object.keys(timesFont.styles)[0] || 'regular');
            } else {
                // Fallback to the first available font if Times New Roman isn't found
                const firstStandardFont = monogramFonts.find(f => !f.circular);
                if (firstStandardFont) {
                    setSelectedFont(firstStandardFont);
                    setActiveStyle(Object.keys(firstStandardFont.styles)[0]);
                }
            }
        } else { // 'classic' or 'flat'
            const firstStandardFont = monogramFonts.find(f => !f.circular);
            if (firstStandardFont) {
                setSelectedFont(firstStandardFont);
                setActiveStyle(Object.keys(firstStandardFont.styles)[0]);
            }
        }
    }, [monogramStyle, monogramFonts]);


    const visibleFonts = monogramFonts.filter(font => !font.circular);

    const handleInitialChange = (e, index) => {
        const newInitials = [...initials];
        newInitials[index] = e.target.value.slice(0, 1).toUpperCase();
        setInitials(newInitials);
        if (e.target.value && index < 2) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !initials[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleInsert = () => {
        let monogramData;
        let htmlString = null;

        if (monogramStyle === 'split') {
            if (!splitInitial || !splitName) return;
            monogramData = {
                type: 'split',
                initial: splitInitial,
                name: splitName,
                font: selectedFont,
                style: activeStyle,
            };
        } else {
            const [first, middle, last] = initials;
            if (!first || !middle || !last) return;
            monogramData = {
                type: monogramStyle,
                text: [first, middle, last],
                font: selectedFont,
                style: activeStyle,
                fontSize,
                isCircular: monogramStyle === 'circular',
                frameStyle: monogramStyle === 'circular' ? frameStyle : 'none',
                disableScaling: monogramStyle === 'flat'
            };

            const previewComponent = (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    {monogramStyle === 'circular' ? (
                        <CircularMonogram text={initials} fontSize={80} isCircular={true} frameStyle={frameStyle} />
                    ) : (
                        <CircularMonogram isCircular={false} text={initials} fontFamily={selectedFont.styles?.[activeStyle]} fontSize={fontSize} disableScaling={monogramStyle === 'flat'} />
                    )}
                </div>
            );
            htmlString = ReactDOMServer.renderToStaticMarkup(previewComponent);
        }

        onInsert({ htmlString, data: monogramData });
        onClose();
    };

    const isInsertDisabled = () => {
        if (monogramStyle === 'split') {
            return !splitInitial || !splitName;
        }
        return !initials[0] || !initials[1] || !initials[2];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212B]/[0.76] backdrop-blur-[3px] p-0 sm:p-2 animate-fade-in" onClick={onClose}>
            <div className="relative border border-[#D8CEC0] bg-[#FFFDF8] rounded-none sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl h-screen sm:h-[90vh] flex flex-col overflow-hidden transition-all" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 z-10 bg-[#FFFDF8]/95 border-b border-[#D8CEC0] flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4">
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#17212B] tracking-tight" style={{ fontFamily: 'Alumni Sans Regular' }}>Monogram Maker</h2>
                        <p className="text-[#66737A] text-xs sm:text-sm">Create your monogram instantly.</p>
                    </div>
                    <button className="text-3xl font-light text-[#B58A3A] hover:text-[#17212B] transition p-2 -mr-2" onClick={onClose} title="Close">&times;</button>
                </header>

                <div className="flex-1 flex flex-col overflow-y-auto pb-[100px] items-center px-4 sm:px-6">
                    <div className="w-full max-w-xl flex flex-col gap-4 mt-6">
                        {/* Monogram Style Selection */}
                        <div className="flex justify-center gap-2 bg-[#F5F1EA] p-1 rounded-xl shadow-inner overflow-x-auto">
                            {['classic', 'flat', 'circular', 'split'].map(style => (
                                    <button key={style} onClick={() => setMonogramStyle(style)} className={`px-4 py-2 rounded-lg font-semibold text-sm transition capitalize ${monogramStyle === style ? 'bg-[#245E73] text-white shadow' : 'border border-[#D8CEC0] bg-[#FFFDF8] text-[#245E73] hover:bg-[#EAF3F4]'}`}>
                                    {style === 'split' ? 'Split Letter' : style}
                                </button>
                            ))}
                        </div>

                        {/* Conditional Inputs based on Style */}
                        {monogramStyle === 'split' ? (
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <h3 className="text-base sm:text-lg font-semibold text-[#245E73] mb-1 text-center">Initial & Name</h3>
                                <div className="flex items-center justify-center gap-4">
                                    <input ref={splitInitialInputRef} type="text" placeholder="S" value={splitInitial} onChange={e => setSplitInitial(e.target.value.slice(0, 1).toUpperCase())} maxLength={1} className="w-16 h-16 bg-[#FFFDF8] border-2 border-[#D8CEC0] text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EAF3F4] focus:border-[#245E73] transition" />
                                    <input ref={splitNameInputRef} type="text" placeholder="SMITH" value={splitName} onChange={e => setSplitName(e.target.value.toUpperCase())} className="h-16 px-4 bg-[#FFFDF8] border-2 border-[#D8CEC0] text-2xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EAF3F4] focus:border-[#245E73] transition w-48" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-[#245E73] mb-2 sm:mb-3 text-center">Your Initials</h3>
                                <div className="flex justify-center gap-3">
                                    {initials.map((initial, index) => (
                                        <input key={index} ref={el => (inputRefs.current[index] = el)} type="text" placeholder={['N', 'X', 'D'][index]} value={initial} onChange={e => handleInitialChange(e, index)} onKeyDown={e => handleKeyDown(e, index)} maxLength={1} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#FFFDF8] border-2 border-[#D8CEC0] text-2xl sm:text-3xl md:text-4xl text-center rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EAF3F4] focus:border-[#245E73] transition" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Frame Style for Circular Monogram */}
                    {monogramStyle === 'circular' && (
                        <div className="w-full max-w-xl mt-6">
                            <h3 className="text-base sm:text-lg font-semibold text-[#245E73] mb-2 sm:mb-3 text-center">Frame Style</h3>
                            <div className="grid grid-cols-3 gap-2 bg-[#F5F1EA] p-2 rounded-xl shadow-inner">
                                {['none', 'solid', 'double', 'dotted', 'outline', 'thick-thin'].map(style => (
                                    <button key={style} onClick={() => setFrameStyle(style)} className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize transition w-full ${frameStyle === style ? 'bg-[#245E73] text-white shadow' : 'border border-[#D8CEC0] bg-[#FFFDF8] text-[#245E73] hover:bg-[#EAF3F4]'}`}>
                                        {style.replace('-', ' & ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Preview Area */}
                    <div className="w-full max-w-xl mt-6">
                        <div className="w-full flex flex-col items-center mb-2">
                            <label className="text-xs font-semibold text-[#66737A] mb-1" htmlFor="monogram-preview-box">Preview</label>
                            <div id="monogram-preview-box" className="w-full max-w-[400px] flex items-center justify-center rounded-xl border border-[#D8CEC0] shadow-inner bg-[#FFFDF8] px-2" style={{ height: '180px', minHeight: '180px' }}>
                                {monogramStyle === 'split' ? (
                                    <SplitLetterMonogram initial={splitInitial || 'S'} name={splitName || 'NAME'} fontFamily={selectedFont?.styles?.[activeStyle]} />
                                ) : monogramStyle === 'circular' ? (
                                    <CircularMonogram text={initials.map(i => i || 'A')} fontSize={80} isCircular={true} frameStyle={frameStyle} />
                                ) : (
                                    <CircularMonogram isCircular={false} text={[initials[0] || 'N', initials[1] || 'X', initials[2] || 'D']} fontFamily={selectedFont?.styles?.[activeStyle]} fontSize={fontSize} disableScaling={monogramStyle === 'flat'} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Font Selection Grid */}
                    {monogramStyle !== 'circular' && (
                        <div className="w-full max-w-2xl mt-6">
                            <h3 className="text-base sm:text-lg font-semibold text-[#245E73] mb-2 sm:mb-3 text-center">Choose a Font {monogramStyle === 'split' && 'for the Initial'}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {visibleFonts.map(font => (
                                    <button key={font.name} onClick={() => { setSelectedFont(font); setActiveStyle(Object.keys(font.styles)[0]); }} className={`group flex flex-col items-center justify-between rounded-xl border-2 transition h-32 w-full p-3 ${selectedFont.name === font.name ? 'border-[#245E73] bg-[#EAF3F4] shadow-md' : 'border-[#D8CEC0] bg-[#FFFDF8] hover:border-[#245E73] hover:bg-[#EAF3F4]'}`}>
                                        <CircularMonogram isCircular={false} text={['N', 'X', 'D']} fontFamily={font.styles?.[Object.keys(font.styles)[0]]} fontSize={32} disableScaling={monogramStyle === 'flat'} sideScale={1.2} middleScale={1.5} />
                                        <span className="text-xs font-semibold text-[#245E73] group-hover:text-[#1B4657] text-center">{font.name}</span>
                                        <span className="text-[11px] text-[#B58A3A]">{font.category}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="fixed sm:sticky bottom-0 left-0 w-full bg-[#FFFDF8]/95 border-t border-[#D8CEC0] px-4 py-3 flex flex-row-reverse justify-between gap-3 z-20">
                    <button onClick={handleInsert} disabled={isInsertDisabled()} className="px-8 py-3 bg-[#245E73] text-white rounded-2xl hover:bg-[#2F6F84] font-bold transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed">Insert Monogram</button>
                    <button onClick={onClose} className="px-6 py-3 bg-[#EAF3F4] text-[#245E73] rounded-2xl hover:bg-[#EAF3F4] font-semibold transition-colors shadow-sm text-base">Cancel</button>
                </footer>
            </div>
        </div>
    );
}
