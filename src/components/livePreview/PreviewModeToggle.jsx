import React from 'react';

const PreviewModeToggle = ({ showFontMixingMode, onToggle }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Preview mode
        </div>
        <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-[15px] font-semibold transition-all duration-200 ${
                showFontMixingMode
                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.38)]'
                    : 'border-slate-200 bg-white text-slate-700 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.26)] hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-pressed={showFontMixingMode}
        >
            <span
                className={`h-3 w-3 rounded-full ${
                    showFontMixingMode ? 'bg-blue-300' : 'bg-slate-300'
                }`}
            />
            {showFontMixingMode ? 'Font Mixing On' : 'Enable Font Mixing'}
        </button>
    </div>
);

export default PreviewModeToggle;
