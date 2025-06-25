import React, { useState, useRef } from 'react';
import './App.css';

// --- Helper Icons ---
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

// --- Font Library (Unchanged) ---
const fontLibrary = {
    'Sans-serif': [{ name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } }, { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } }, { name: 'Berlin Sans FB', styles: { regular: 'BerlinSansFB-Reg', bold: 'BerlinSansFB-Bold' } }, { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri-Bold', italic: 'Calibri-Italic' } }, { name: 'Century Gothic', styles: { regular: 'CenturyGothicPaneuropean', bold: 'CenturyGothicPaneuropean-Bold', boldItalic: 'CenturyGothicPaneuropean-BoldItalic' } }, { name: 'Graphik', styles: { thin: 'Graphik-Thin', regular: 'Graphik-Regular', medium: 'Graphik-Medium', semibold: 'Graphik-Semibold', thinItalic: 'Graphik-ThinItalic', regularItalic: 'Graphik-RegularItalic', mediumItalic: 'Graphik-MediumItalic' } }, { name: 'Zapf Humanist', styles: { demi: 'ZapfHumanist601BT-Demi' } },],
    'Serif': [{ name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'BenguiatITCbyBT-Bold', italic: 'BenguiatITCbyBT-BookItalic' } }, { name: 'Century Schoolbook', styles: { regular: 'CenturySchoolbook', bold: 'CenturySchoolbook-Bold', boldItalic: 'CenturySchoolbook-BoldItalic' } }, { name: 'CopprplGoth BT', styles: { regular: 'CopperplateGothicBT-Roman' } }, { name: 'Garamond', styles: { regular: 'Garamond' } }, { name: 'Garamond 3 LT Std', styles: { regular: 'Garamond3LTStd', bold: 'Garamond3LTStd-Bold', italic: 'Garamond3LTStd-Italic', boldItalic: 'Garamond3LTStd-BoldItalic' } }, { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT', boldItalic: 'TimesNewRomanPS-BoldItalicMT' } },],
    'Script': [{ name: 'Amazone BT', styles: { regular: 'AmazoneBT-Regular' } }, { name: 'Angelface', styles: { regular: 'Angelface' } }, { name: 'Birds of Paradise', styles: { regular: 'BirdsofParadise-PersonaluseOnly' } }, { name: 'Clicker Script', styles: { regular: 'ClickerScript-Regular' } }, { name: 'Courgette', styles: { regular: 'Courgette-Regular' } }, { name: 'Freebooter Script', styles: { regular: 'FreebooterScript' } }, { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } }, { name: 'Honey Script', styles: { light: 'HoneyScript-Light', semiBold: 'HoneyScript-SemiBold' } }, { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } }, { name: 'ITC Zapf Chancery', styles: { regular: 'ZapfChancery-Roman' } }, { name: 'Lisbon Script', styles: { regular: 'LisbonScript-Regular' } }, { name: 'Murray Hill', styles: { regular: 'MurrayHill' } },],
    'Display': [{ name: 'BlackChancery', styles: { regular: 'BlackChancery' } }, { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } }, { name: 'Cowboy Rodeo', styles: { regular: 'CowboyRodeoW01-Regular' } }, { name: 'Machine BT', styles: { regular: 'MachineITCbyBT-Regular' } }, { name: 'Old English Text MT', styles: { regular: 'OldEnglishTextMT' } }, { name: 'Planscribe', styles: { regular: 'PlanscribeNFW01-Regular' } }, { name: 'Tinplate Titling Black', styles: { regular: 'TinplateTitlingBlack' } },]
};


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="modal-close-button"><XIcon /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const App = () => {
    // --- State and Refs (Unchanged) ---
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');
    const [fontSize, setFontSize] = useState(48);
    const [toasts, setToasts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [pendingSvgContent, setPendingSvgContent] = useState(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isGlyphModalOpen, setIsGlyphModalOpen] = useState(false);
    const textInputRef = useRef(null);

    // --- Core Functions (Unchanged) ---
    const showToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    };

    const handleFontSelect = (font) => {
        setSelectedFonts(prev =>
            prev.some(f => f.name === font.name)
                ? prev.filter(f => f.name !== font.name)
                : [...prev, { ...font, activeStyle: Object.keys(font.styles)[0] }]
        );
    };

    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev => prev.map(f => f.name === fontName ? { ...f, activeStyle: newStyle } : f));
    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev => prev.map(f => f.name === fontName ? { ...f, activeStyle: newStyle } : f));
    };

    const formatForFilename = (str) => str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    const handleGlyphInsert = (glyph) => {
        const { current: textarea } = textInputRef;
        if (!textarea) return;
        const { selectionStart, selectionEnd } = textarea;
        const newText = customText.substring(0, selectionStart) + glyph + customText.substring(selectionEnd);
        setCustomText(newText);
        textarea.focus();
        setTimeout(() => textarea.selectionStart = textarea.selectionEnd = selectionStart + glyph.length, 0);
    };

    const handleInitiateSave = () => {
        if (selectedFonts.length === 0 || !customText.trim()) {
            showToast('Please select a font and enter some text.', 'error');
            return;
        }
        const lines = customText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            showToast('Please enter some text to save.', 'error');
            return;
        }

        let svgTextElements = '';
        const lineHeight = fontSize * 1.5;
        const labelFontSize = 14;
        const padding = 30;
        let y = padding;

        selectedFonts.forEach((font, fontIndex) => {
            const activeFontFamily = font.styles[font.activeStyle];
            const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);
            y += labelFontSize + 15;
            svgTextElements += `<text x="${padding}" y="${y}" font-family="Inter, sans-serif" font-size="${labelFontSize}" fill="#4a5568" font-weight="600">${font.name} (${styleName})</text>\n`;
            y += 5;

            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                y += lineHeight;
                svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#1a202c">${sanitizedLine}</text>\n`;
            });
            if (fontIndex < selectedFonts.length - 1) y += lineHeight * 0.5;
        });