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
            className={`rounded-[1.25rem] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_20px_28px_-24px_rgba(15,23,42,0.1)] ${
                disabled
                    ? 'border-[rgba(148,180,193,0.12)] bg-slate-100/70 opacity-70'
                    : 'border-[rgba(148,180,193,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,249,0.94))]'
            }`}
        >
            <div className="mb-2 flex items-center justify-between gap-3">
                <label
                    htmlFor={id}
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
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
                            className={`w-20 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition-colors focus:border-[rgba(84,119,146,0.36)] focus:outline-none ${
                                disabled
                                    ? 'cursor-not-allowed border-[rgba(148,180,193,0.16)] bg-slate-100 text-slate-400'
                                    : 'border-[rgba(148,180,193,0.2)] bg-white text-slate-800'
                            }`}
                            aria-label={numberInputAriaLabel}
                        />
                    ) : (
                        <span
                            className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
                                disabled
                                    ? 'border-[rgba(148,180,193,0.16)] bg-slate-100 text-slate-400'
                                    : 'border-[rgba(148,180,193,0.2)] bg-white text-slate-800'
                            }`}
                        >
                            {displayValue}
                        </span>
                    )}
                    {secondaryAction}
                </div>
            </div>

            <div className="relative py-1">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[rgba(148,180,193,0.18)]" />
                <div
                    className={`pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${
                        disabled
                            ? 'bg-slate-300/80'
                            : 'bg-[linear-gradient(90deg,#ecefca_0%,#94b4c1_55%,#547792_100%)]'
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
