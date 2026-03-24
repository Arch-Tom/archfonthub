import React from 'react';

const clampPercentage = (value, min, max) => {
    const numericValue = Number(value);
    const numericMin = Number(min);
    const numericMax = Number(max);

    if (
        Number.isNaN(numericValue) ||
        Number.isNaN(numericMin) ||
        Number.isNaN(numericMax) ||
        numericMax <= numericMin
    ) {
        return 0;
    }

    const ratio = ((numericValue - numericMin) / (numericMax - numericMin)) * 100;
    return Math.min(100, Math.max(0, ratio));
};

const PreviewRangeControl = ({
    id,
    label,
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    secondaryAction,
    showNumberInput = false,
    numberInputAriaLabel,
    disabled = false,
}) => {
    const percent = clampPercentage(value, min, max);
    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <div
            className={`rounded-[1.25rem] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_28px_-24px_rgba(15,23,42,0.55)] ${
                disabled
                    ? 'border-white/8 bg-slate-900/40 opacity-70'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72))] backdrop-blur-sm'
            }`}
        >
            <div className="mb-2 flex items-center justify-between gap-3">
                <label
                    htmlFor={id}
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300"
                >
                    {label}
                </label>

                <div className="flex items-center gap-2">
                    {showNumberInput ? (
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={onChange}
                            disabled={disabled}
                            className={`w-20 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition-colors focus:border-blue-400 focus:outline-none ${
                                disabled
                                    ? 'cursor-not-allowed border-white/10 bg-slate-800 text-slate-500'
                                    : 'border-white/10 bg-slate-950/80 text-white'
                            }`}
                            aria-label={numberInputAriaLabel}
                        />
                    ) : (
                        <span
                            className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
                                disabled
                                    ? 'border-white/10 bg-slate-800 text-slate-500'
                                    : 'border-white/10 bg-slate-950/80 text-white'
                            }`}
                        >
                            {displayValue}
                        </span>
                    )}
                    {secondaryAction}
                </div>
            </div>

            <div className="relative py-1">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
                <div
                    className={`pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${
                        disabled
                            ? 'bg-slate-500/40'
                            : 'bg-[linear-gradient(90deg,#38bdf8_0%,#2563eb_55%,#7c3aed_100%)]'
                    }`}
                    style={{ width: `${percent}%` }}
                />
                <input
                    id={id}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`preview-range relative z-10 ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
                />
            </div>
        </div>
    );
};

export default PreviewRangeControl;