import React from 'react';

const ALIGNMENTS = ['left', 'center', 'right'];

const AlignmentControl = ({ textAlign, setTextAlign, AlignIcon, keyPrefix = '' }) => (
    <div>
        <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Alignment
        </div>

        <div className="inline-flex rounded-[1.1rem] border border-white/10 bg-slate-950/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_30px_-24px_rgba(15,23,42,0.7)] backdrop-blur-sm">
            {ALIGNMENTS.map((alignment) => (
                <button
                    key={`${keyPrefix}${alignment}`}
                    type="button"
                    onClick={() => setTextAlign(alignment)}
                    title={`Align ${alignment}`}
                    aria-label={`Align ${alignment}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-[0.9rem] transition-all duration-200 ${
                        textAlign === alignment
                            ? 'bg-[linear-gradient(180deg,#60a5fa,#2563eb)] text-white shadow-[0_16px_24px_-18px_rgba(37,99,235,0.85)]'
                            : 'text-slate-400 hover:bg-white/8 hover:text-white'
                    }`}
                >
                    <AlignIcon align={alignment} />
                </button>
            ))}
        </div>
    </div>
);

export default AlignmentControl;