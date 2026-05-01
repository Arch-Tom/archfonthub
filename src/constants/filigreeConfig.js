export const FILIGREE_PRESETS = [
  {
    id: 'none',
    label: 'None',
    shortLabel: 'None',
    viewBox: '0 0 240 48',
    paths: [],
  },
  {
    id: 'simple-flourish',
    label: 'Simple flourish',
    shortLabel: 'Simple',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M42 24C64 8 82 8 103 24C116 34 129 34 142 24C163 8 181 8 203 24',
      },
      {
        d: 'M28 24H62M178 24H212',
      },
      {
        d: 'M103 24C111 15 129 15 137 24',
      },
    ],
  },
  {
    id: 'divider-flourish',
    label: 'Divider flourish',
    shortLabel: 'Divider',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M18 24H92',
      },
      {
        d: 'M148 24H222',
      },
      {
        d: 'M95 24C103 12 113 12 120 24C127 36 137 36 145 24',
      },
      {
        d: 'M112 18C117 12 123 12 128 18',
      },
    ],
  },
  {
    id: 'heart-flourish',
    label: 'Heart flourish',
    shortLabel: 'Heart',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M24 24H86C101 24 105 14 116 14C124 14 130 20 120 31C110 20 116 14 124 14C135 14 139 24 154 24H216',
      },
      {
        d: 'M94 24C102 36 114 37 120 31C126 37 138 36 146 24',
      },
    ],
  },
  {
    id: 'centered-ornamental-flourish',
    label: 'Centered ornamental flourish',
    shortLabel: 'Ornament',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M20 24H78',
      },
      {
        d: 'M162 24H220',
      },
      {
        d: 'M80 24C96 6 112 8 120 24C128 8 144 6 160 24',
      },
      {
        d: 'M88 24C100 39 112 38 120 24C128 38 140 39 152 24',
      },
      {
        d: 'M112 16C116 11 124 11 128 16',
      },
      {
        d: 'M112 32C116 37 124 37 128 32',
      },
    ],
  },
];

export const FILIGREE_PLACEMENTS = [
  { id: 'above', label: 'Above text' },
  { id: 'between', label: 'Between lines' },
  { id: 'below', label: 'Below text' },
];

export const FILIGREE_SIZES = [
  { id: 'small', label: 'Small', previewWidth: 128, previewHeight: 26, exportWidth: 190 },
  { id: 'medium', label: 'Medium', previewWidth: 172, previewHeight: 34, exportWidth: 250 },
  { id: 'large', label: 'Large', previewWidth: 220, previewHeight: 42, exportWidth: 320 },
];

export const DEFAULT_FILIGREE_SELECTION = {
  presetId: 'none',
  placement: 'below',
  size: 'medium',
};

export const getFiligreePreset = (presetId) =>
  FILIGREE_PRESETS.find((preset) => preset.id === presetId) ||
  FILIGREE_PRESETS[0];

export const getFiligreePlacement = (placementId) =>
  FILIGREE_PLACEMENTS.find((placement) => placement.id === placementId) ||
  FILIGREE_PLACEMENTS[0];

export const getFiligreeSize = (sizeId) =>
  FILIGREE_SIZES.find((size) => size.id === sizeId) || FILIGREE_SIZES[1];

export const hasActiveFiligree = (selection) =>
  Boolean(selection && selection.presetId && selection.presetId !== 'none');

export const getFiligreeInsertIndex = (placement, lineCount) => {
  if (placement === 'above') return 0;
  if (placement === 'below') return lineCount;
  if (lineCount <= 1) return 1;
  return Math.ceil(lineCount / 2);
};
