import {
  FILIGREE_PLACEMENTS,
  FILIGREE_PRESETS,
  FILIGREE_SIZES,
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
    className={`rounded-full border px-2.5 py-1 text-[0.72rem] font-bold leading-none transition-colors ${
      isSelected
        ? 'border-[#245E73] bg-[#245E73] text-white'
        : 'border-[#D8CEC0] bg-[#FFFDF8] text-[#245E73] hover:border-[#B58A3A] hover:bg-[#EAF3F4]'
    } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
  >
    {children}
  </button>
);

const FiligreePreview = ({ preset }) => (
  <svg
    viewBox={preset.viewBox}
    aria-hidden="true"
    className="h-5 w-full max-w-[130px] text-[#B58A3A]"
    fill="none"
  >
    {preset.paths.map((path) => (
      <path
        key={path.d}
        d={path.d}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
);

export default function FiligreeControls({ selection, onChange }) {
  const isActive = hasActiveFiligree(selection);

  const updateSelection = (nextValues) => {
    onChange({
      ...selection,
      ...nextValues,
    });
  };

  return (
    <div className="mt-3 rounded-[18px] border border-[#D8CEC0] bg-[rgba(255,253,248,0.78)] px-3 py-3 shadow-[0_14px_30px_-28px_rgba(20,39,58,0.32)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#17212B]">Decoration</p>
          <p className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#66737A]">
            Engraving-safe presets
          </p>
        </div>
        {isActive && (
          <span className="rounded-full bg-[#F2E7D0] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#7A5B22]">
            Filigree
          </span>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {FILIGREE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={selection.presetId === preset.id}
            onClick={() => updateSelection({ presetId: preset.id })}
            className={`flex min-h-[42px] flex-col items-center justify-center rounded-[13px] border px-2 py-1.5 text-center text-[0.72rem] font-bold transition-colors ${
              selection.presetId === preset.id
                ? 'border-[#245E73] bg-[#EAF3F4] text-[#17212B] shadow-[inset_0_0_0_1px_rgba(36,94,115,0.16)]'
                : 'border-[#D8CEC0] bg-[#FFFDF8] text-[#245E73] hover:border-[#B58A3A] hover:bg-[#FFFDF8]'
            }`}
          >
            {preset.paths.length > 0 && <FiligreePreview preset={preset} />}
            <span className={preset.paths.length > 0 ? 'mt-1' : ''}>
              {preset.shortLabel}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-1.5 text-xs font-bold text-[#245E73]">Placement</p>
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
          <p className="mb-1.5 text-xs font-bold text-[#245E73]">Size</p>
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
      </div>
    </div>
  );
}
