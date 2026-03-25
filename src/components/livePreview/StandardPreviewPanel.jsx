import React from 'react';
import { formatStyleLabel, getSafeFontFamilyPreview } from './utils';

const StandardPreviewPanel = ({
    fontSize,
    getDefaultStyleKey,
    getSortedStyleKeys,
    lineSpacing,
    safeSelectedFonts,
    setStandardPreviewStyleMap,
    standardPreviewLines,
    standardPreviewStyleMap,
    textAlign,
}) => (
    <div className="space-y-4">
        <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,24,0.98),rgba(15,23,42,0.96)_52%,rgba(22,28,45,0.94)_100%)] p-5 shadow-[0_34px_78px_-46px_rgba(15,23,42,0.88)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-[38rem]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/70">
                            Standard Preview
                        </div>
                        <div className="mt-1 text-[1.35rem] font-semibold tracking-tight text-white">
                            Compare your selected fonts like a specimen gallery
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            This mode keeps every font in the same layout so differences in tone,
                            weight, and personality are easy to judge at a glance.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[0_14px_24px_-20px_rgba(15,23,42,0.45)]">
                        <span className="h-2 w-2 rounded-full bg-sky-300" />
                        Font specimen mode
                    </div>
                </div>
            </div>

            <div className="mt-5">
                {safeSelectedFonts.length > 0 ? (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {safeSelectedFonts.map((font, index) => {
                            const fallbackFontFamily = getSafeFontFamilyPreview(font);
                            const styleKeys = getSortedStyleKeys(font.styles || {});
                            const displayStyleKeys = styleKeys.length > 0 ? styleKeys : ['regular'];
                            const selectedStyleKey =
                                standardPreviewStyleMap[font.name] ||
                                getDefaultStyleKey(font.name) ||
                                displayStyleKeys[0];
                            const activeStandardFontFamily =
                                font?.styles?.[selectedStyleKey] || fallbackFontFamily;
                            const standardPreviewFontSize = Math.min(fontSize, 82);

                            const accentSets = [
                                {
                                    glow: 'from-sky-400/12 via-blue-400/8 to-transparent',
                                    chip: 'border-sky-300/20 bg-sky-400/10 text-sky-100',
                                    active: 'border-sky-300/20 bg-[linear-gradient(180deg,rgba(56,189,248,0.96),rgba(37,99,235,0.96))] text-white shadow-[0_12px_20px_-18px_rgba(56,189,248,0.6)]',
                                },
                                {
                                    glow: 'from-indigo-400/12 via-violet-400/8 to-transparent',
                                    chip: 'border-indigo-300/20 bg-indigo-400/10 text-indigo-100',
                                    active: 'border-indigo-300/20 bg-[linear-gradient(180deg,rgba(129,140,248,0.96),rgba(79,70,229,0.96))] text-white shadow-[0_12px_20px_-18px_rgba(99,102,241,0.58)]',
                                },
                                {
                                    glow: 'from-amber-300/12 via-orange-400/8 to-transparent',
                                    chip: 'border-amber-300/20 bg-amber-400/10 text-amber-50',
                                    active: 'border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.96),rgba(234,88,12,0.96))] text-white shadow-[0_12px_20px_-18px_rgba(245,158,11,0.56)]',
                                },
                            ];

                            const accent = accentSets[index % accentSets.length];

                            return (
                                <section
                                    key={`standard-preview-${font.name}`}
                                    className="group relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(22,30,46,0.58))] p-5 shadow-[0_22px_40px_-30px_rgba(15,23,42,0.72)]"
                                >
                                    <div
                                        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_60%)]"
                                        aria-hidden="true"
                                    />
                                    <div
                                        className={`pointer-events-none absolute -left-10 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] ${accent.glow} blur-3xl`}
                                        aria-hidden="true"
                                    />

                                    <div className="relative flex h-full flex-col gap-5">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <div
                                                        className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold shadow-[0_10px_18px_-16px_rgba(15,23,42,0.52)] ${accent.chip}`}
                                                        style={{ fontFamily: activeStandardFontFamily }}
                                                    >
                                                        {font.name}
                                                    </div>

                                                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                                        Styles
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {displayStyleKeys.map((styleKey) => {
                                                        const isActiveStyle = styleKey === selectedStyleKey;

                                                        return (
                                                            <button
                                                                key={`${font.name}-${styleKey}`}
                                                                type="button"
                                                                onClick={() =>
                                                                    setStandardPreviewStyleMap((current) => ({
                                                                        ...current,
                                                                        [font.name]: styleKey,
                                                                    }))
                                                                }
                                                                aria-pressed={isActiveStyle}
                                                                className={`inline-flex rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                                                                    isActiveStyle
                                                                        ? accent.active
                                                                        : 'border-white/10 bg-white/[0.04] text-slate-300 hover:-translate-y-px hover:border-white/16 hover:bg-white/[0.08] hover:text-white'
                                                                }`}
                                                            >
                                                                {formatStyleLabel(styleKey)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative flex-1 overflow-hidden rounded-[1.28rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(246,248,252,0.965))] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_16px_28px_-22px_rgba(15,23,42,0.24)]">
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_72%)]" />
                                            {standardPreviewLines.length > 0 ? (
                                                <div
                                                    className="relative min-h-[220px] max-w-full break-words whitespace-pre-wrap text-slate-950"
                                                    style={{
                                                        fontFamily: activeStandardFontFamily,
                                                        fontSize: `${standardPreviewFontSize}px`,
                                                        lineHeight: Math.max(lineSpacing, 0.9),
                                                        textAlign,
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                    dir="auto"
                                                >
                                                    {standardPreviewLines.join('\n')}
                                                </div>
                                            ) : (
                                                <div className="relative max-w-sm text-sm leading-6 text-slate-400">
                                                    Enter text above to preview it in {font.name}.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex min-h-[240px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.03] text-center">
                        <div className="max-w-xs text-sm leading-6 text-slate-400">
                            Select fonts and enter text above to compare them here.
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default StandardPreviewPanel;
