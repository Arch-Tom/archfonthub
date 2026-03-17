import React from 'react';

const ALIGNMENTS = ['left', 'center', 'right'];

const AlignmentControl = ({ textAlign, setTextAlign, AlignIcon, keyPrefix = '' }) => (
    <div>
        <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Alignment
        </div>

        <div className="inline-flex rounded-[1rem] border border-slate-200 bg-slate-100/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {ALIGNMENTS.map((alignment) => (
                <button
                    key={`${keyPrefix}${alignment}`}
                    type="button"
                    onClick={() => setTextAlign(alignment)}
                    title={`Align ${alignment}`}
                    aria-label={`Align ${alignment}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-[0.8rem] transition-all duration-200 ${
                        textAlign === alignment
                            ? 'bg-slate-900 text-white shadow-[0_12px_20px_-16px_rgba(15,23,42,0.55)]'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                >
                    <AlignIcon align={alignment} />
                </button>
            ))}
        </div>
    </div>
);

export default AlignmentControl;
