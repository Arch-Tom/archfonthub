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
            className={`rounded-[1.15rem] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ${
                disabled
                    ? 'border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.84),rgba(241,245,249,0.72))] opacity-75'
                    : 'border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72))]'
            }`}
        >
            <div className="mb-2 flex items-center justify-between gap-3">
                <label
                    htmlFor={id}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
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
                            className={`w-18 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition-colors focus:border-blue-400 focus:outline-none ${
                                disabled
                                    ? 'cursor-not-allowed border-slate-200/80 bg-slate-100 text-slate-400'
                                    : 'border-slate-200/90 bg-white/95 text-slate-700'
                            }`}
                            aria-label={numberInputAriaLabel}
                        />
                    ) : (
                        <span
                            className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
                                disabled
                                    ? 'border-slate-200/80 bg-slate-100 text-slate-400'
                                    : 'border-slate-200/90 bg-white/95 text-slate-700'
                            }`}
                        >
                            {displayValue}
                        </span>
                    )}
                    {secondaryAction}
                </div>
            </div>

            <div className="relative py-1">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
                <div
                    className={`pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${
                        disabled
                            ? 'bg-slate-300'
                            : 'bg-[linear-gradient(90deg,rgba(59,130,246,0.95),rgba(96,165,250,0.9))]'
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
