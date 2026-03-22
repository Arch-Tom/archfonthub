import React from 'react';
import { formatStyleLabel } from './utils';

const ActiveLineControls = ({ activePreviewLine, activeStyleKeys, handleLineStyleChange }) => {
    if (!activePreviewLine) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-[38rem]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Focus Controls
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                            Editing line {activePreviewLine.lineIndex + 1}
                        </h3>

                        <span className="inline-flex items-center rounded-full border border-blue-100/80 bg-blue-50/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                            Active line
                        </span>
                    </div>

                    <p className="mt-1.5 max-w-[34rem] text-sm leading-6 text-slate-500">
                        Choose the style for the selected line here, then apply fonts in the shared
                        font area below without the layout controls jumping around.
                    </p>
                </div>
            </div>

            {activeStyleKeys.length > 0 && (
                <div>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Style
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {activeStyleKeys.map((styleKey) => {
                            const isActiveStyle = activePreviewLine.styleKey === styleKey;

                            return (
                                <button
                                    key={styleKey}
                                    type="button"
                                    onClick={() =>
                                        handleLineStyleChange(activePreviewLine.lineIndex, styleKey)
                                    }
                                    aria-pressed={isActiveStyle}
                                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                                        isActiveStyle
                                            ? 'border-blue-500 bg-blue-600 text-white shadow-[0_14px_24px_-18px_rgba(37,99,235,0.42)]'
                                            : 'border-slate-200/90 bg-white/92 text-slate-600 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {formatStyleLabel(styleKey)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveLineControls;
