import React from 'react';

const PreviewModeToggle = ({ showFontMixingMode, onToggle }) => (
    <div className="flex flex-col items-start gap-2 lg:items-end">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Preview mode
        </div>
        <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                showFontMixingMode
                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_24px_-18px_rgba(15,23,42,0.35)]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-pressed={showFontMixingMode}
        >
            <span
                className={`h-2.5 w-2.5 rounded-full ${
                    showFontMixingMode ? 'bg-blue-300' : 'bg-slate-300'
                }`}
            />
            {showFontMixingMode ? 'Font Mixing On' : 'Enable Font Mixing'}
        </button>
        <p className="max-w-xs text-sm leading-6 text-slate-500 lg:text-right">
            {showFontMixingMode
                ? 'You are editing one custom composition.'
                : 'Standard preview stays simple and shows all selected fonts.'}
        </p>
    </div>
);

export default PreviewModeToggle;
