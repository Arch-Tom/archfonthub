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
}) => {
    const percent = clampPercentage(value, min, max);
    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <div className="rounded-[1.15rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="mb-3 flex items-center justify-between gap-3">
                <label
                    htmlFor={id}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                    {label}
                </label>

                <div className="flex items-center gap-2">
                    <span className="inline-flex min-w-[3rem] items-center justify-center rounded-full border border-slate-200/90 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {displayValue}
                    </span>
                    {secondaryAction}
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
                    <div
                        className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.95),rgba(96,165,250,0.9))]"
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
                        className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent
                            [&::-webkit-slider-runnable-track]:h-2
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-transparent
                            [&::-webkit-slider-thumb]:mt-[-4px]
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border-2
                            [&::-webkit-slider-thumb]:border-white
                            [&::-webkit-slider-thumb]:bg-blue-600
                            [&::-webkit-slider-thumb]:shadow-[0_8px_18px_-8px_rgba(37,99,235,0.65)]
                            [&::-moz-range-track]:h-2
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-transparent
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:appearance-none
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:border-2
                            [&::-moz-range-thumb]:border-white
                            [&::-moz-range-thumb]:bg-blue-600
                            [&::-moz-range-thumb]:shadow-[0_8px_18px_-8px_rgba(37,99,235,0.65)]"
                    />
                </div>

                {showNumberInput && (
                    <div className="flex justify-end">
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={onChange}
                            className="w-20 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors focus:border-blue-400 focus:outline-none"
                            aria-label={numberInputAriaLabel}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewRangeControl;