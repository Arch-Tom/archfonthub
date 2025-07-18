import React, { useState } from 'react';

export default function MonogramMaker({ fontLibrary, onClose, onInsert }) {
  const [monogramText, setMonogramText] = useState('');
  const [selectedFont, setSelectedFont] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [fontSize, setFontSize] = useState(140);

  // Filter out fonts that might be hard to read in monogram form if you want (optional)
  const fontList = Object.values(fontLibrary).flat();

  const handleFontClick = (font) => {
    setSelectedFont(font);
    setSelectedStyle(Object.keys(font.styles)[0]);
  };

  const handleStyleClick = (style) => setSelectedStyle(style);

  // For accessibility, only allow 1-3 capital letters
  const handleInput = (e) => {
    let val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (val.length > 3) val = val.slice(0, 3);
    setMonogramText(val);
  };

  // Pass monogram data back to parent for preview
  const handleInsert = () => {
    if (!monogramText || !selectedFont || !selectedStyle) return;
    onInsert({
      text: monogramText,
      font: selectedFont,
      style: selectedStyle,
      fontSize
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative">
        <button className="absolute top-4 right-4 text-xl font-bold text-slate-600 hover:text-slate-900" onClick={onClose} title="Close">&times;</button>
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Alumni Sans Regular' }}>Monogram Maker</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Controls */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-1">Monogram (1–3 letters):</label>
              <input
                type="text"
                maxLength={3}
                value={monogramText}
                onChange={handleInput}
                className="w-full text-3xl p-3 border rounded-xl"
                placeholder="ABC"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Choose Font:</label>
              <div className="flex flex-wrap gap-3 max-h-36 overflow-y-auto">
                {fontList.map(font => (
                  <button
                    key={font.name}
                    onClick={() => handleFontClick(font)}
                    className={`px-4 py-2 rounded-lg border-2 ${selectedFont?.name === font.name ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}
                    style={{ fontFamily: font.styles[Object.keys(font.styles)[0]], fontSize: '1.5rem' }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
              {selectedFont && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {Object.keys(selectedFont.styles).map(styleKey => (
                    <button
                      key={styleKey}
                      onClick={() => handleStyleClick(styleKey)}
                      className={`px-3 py-2 rounded border ${selectedStyle === styleKey ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}
                    >
                      {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">Monogram Size:</label>
              <input
                type="range"
                min={72}
                max={220}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-48"
              />
              <span className="ml-2 font-mono">{fontSize}px</span>
            </div>
            <div className="flex gap-4 pt-6">
              <button
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg flex-1"
                onClick={handleInsert}
                disabled={!monogramText || !selectedFont || !selectedStyle}
              >
                Insert Into Preview
              </button>
              <button className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-semibold hover:bg-slate-300" onClick={onClose}>Cancel</button>
            </div>
          </div>
          {/* Live Preview */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <label className="block text-lg font-semibold mb-2">Preview:</label>
            <div className="border-2 border-slate-200 rounded-xl w-full min-h-[180px] flex items-center justify-center bg-slate-50">
              <span
                style={{
                  fontFamily: selectedFont ? selectedFont.styles[selectedStyle] : 'inherit',
                  fontSize: `${fontSize}px`,
                  letterSpacing: '0.15em'
                }}
                className="text-slate-800"
              >
                {monogramText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
