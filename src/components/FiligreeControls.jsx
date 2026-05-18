import {
  FILIGREE_PLACEMENTS,
  FILIGREE_PRESETS,
  FILIGREE_SIZES,
  getFiligreePlacement,
  getFiligreePreset,
  getFiligreeSize,
  hasActiveFiligree,
} from '../constants/filigreeConfig';

const FiligreeOptionButton = ({
  children,
  disabled = false,
  isSelected,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    aria-pressed={isSelected}
    onClick={onClick}
    className={`rounded-full border px-2.5 py-1 text-[0.72rem] font-bold leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#58A068]/55 ${
      isSelected
        ? 'border-[#478CCA] bg-[#478CCA] text-white'
        : 'border-[#BFD5E8] bg-[#FFFFFF] text-[#478CCA] hover:border-[#58A068] hover:bg-[#EAF5FC]'
    } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
  >
    {children}
  </button>
);

const FiligreePreview = ({ preset }) => (
  <svg
    viewBox={preset.viewBox}
    aria-hidden="true"
    className="h-7 w-full max-w-[150px] text-[#232124]"
    fill="none"
  >
    {preset.paths.map((path) => (
      <path
        key={path.d}
        d={path.d}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);

export default function FiligreeControls({
  isExpanded,
  onChange,
  onExpandedChange,
  selection,
}) {
  const isActive = hasActiveFiligree(selection);
  const selectedPreset = getFiligreePreset(selection.presetId);
  const selectedPlacement = getFiligreePlacement(selection.placement);
  const selectedSize = getFiligreeSize(selection.size);
  const summaryText = isActive
    ? `${selectedPreset.shortLabel} / ${selectedPlacement.label} / ${selectedSize.label}`
    : 'Choose artwork';

  const updateSelection = (nextValues) => {
    onChange({
      ...selection,
      ...nextValues,
    });
  };

  if (!isExpanded && !isActive) return null;

  return (
    <div className="mt-2 rounded-[16px] border border-[#BFD5E8] bg-[rgba(255,255,255,0.78)] px-2.5 py-2 shadow-[0_12px_26px_-28px_rgba(30,40,75,0.32)]">
      <button
        type="button"
        onClick={() => onExpandedChange?.(!isExpanded)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-3 rounded-[12px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#58A068]/55"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-none text-[#232124]">
            Filigree artwork
          </span>
          <span className="mt-1 block truncate text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#4D5B68]">
            {summaryText}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {isActive && (
            <span className="rounded-full bg-[#E6F3EA] px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-[#347041]">
              Active
            </span>
          )}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`text-[#478CCA] transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.9"
            />
          </svg>
        </span>
      </button>

      {!isExpanded && null}

      {isExpanded && (
        <>
          <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#4D5B68]">
            Engraving-safe artwork
          </p>

          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {FILIGREE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selection.presetId === preset.id}
                onClick={() => updateSelection({ presetId: preset.id })}
                className={`relative flex min-h-[58px] flex-col items-center justify-center rounded-[13px] border px-2 py-1.5 text-center text-[0.72rem] font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#58A068]/55 ${
                  selection.presetId === preset.id
                    ? 'border-[#478CCA] bg-[#EAF5FC] text-[#232124] shadow-[inset_0_0_0_1px_rgba(71,140,202,0.16)]'
                    : 'border-[#BFD5E8] bg-[#FFFFFF] text-[#478CCA] hover:border-[#58A068] hover:bg-[#FFFFFF]'
                }`}
              >
                {preset.paths.length > 0 && <FiligreePreview preset={preset} />}
                <span className={preset.paths.length > 0 ? 'mt-1' : ''}>
                  {preset.id === 'none' ? 'No filigree' : preset.shortLabel}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <p className="mb-1.5 text-xs font-bold text-[#478CCA]">
                Placement
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FILIGREE_PLACEMENTS.map((placement) => (
                  <FiligreeOptionButton
                    key={placement.id}
                    disabled={!isActive}
                    isSelected={selection.placement === placement.id}
                    onClick={() => updateSelection({ placement: placement.id })}
                  >
                    {placement.label}
                  </FiligreeOptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-[#478CCA]">Size</p>
              <div className="flex flex-wrap gap-1.5">
                {FILIGREE_SIZES.map((size) => (
                  <FiligreeOptionButton
                    key={size.id}
                    disabled={!isActive}
                    isSelected={selection.size === size.id}
                    onClick={() => updateSelection({ size: size.id })}
                  >
                    {size.label}
                  </FiligreeOptionButton>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={!isActive}
                onClick={() => updateSelection({ presetId: 'none' })}
                className="rounded-full border border-[#BFD5E8] bg-[#FFFFFF] px-2.5 py-1 text-[0.72rem] font-bold leading-none text-[#4D5B68] outline-none transition-colors hover:border-[#58A068] hover:text-[#478CCA] focus-visible:ring-2 focus-visible:ring-[#58A068]/55 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
