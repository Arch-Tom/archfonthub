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
    label: 'Scroll flourish',
    shortLabel: 'Scroll',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M20 24C40 24 45 12 64 12C82 12 82 36 64 36C51 36 51 19 66 18C84 17 93 32 109 32C116 32 120 28 120 24',
      },
      {
        d: 'M220 24C200 24 195 12 176 12C158 12 158 36 176 36C189 36 189 19 174 18C156 17 147 32 131 32C124 32 120 28 120 24',
      },
      {
        d: 'M24 24H45M195 24H216',
      },
      {
        d: 'M96 24C104 12 116 12 120 24C124 12 136 12 144 24',
      },
      {
        d: 'M96 24C104 36 116 36 120 24C124 36 136 36 144 24',
      },
      {
        d: 'M113 18C117 15 123 15 127 18M113 30C117 33 123 33 127 30',
      },
      {
        d: 'M72 24C84 15 95 16 102 24M138 24C145 16 156 15 168 24',
      },
    ],
  },
  {
    id: 'divider-flourish',
    label: 'Acanthus divider',
    shortLabel: 'Acanthus',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M16 24H58M182 24H224',
      },
      {
        d: 'M58 24C72 7 91 7 104 24C111 33 118 33 120 24',
      },
      {
        d: 'M182 24C168 7 149 7 136 24C129 33 122 33 120 24',
      },
      {
        d: 'M58 24C72 41 91 41 104 24C111 15 118 15 120 24',
      },
      {
        d: 'M182 24C168 41 149 41 136 24C129 15 122 15 120 24',
      },
      {
        d: 'M88 24C95 13 108 12 115 20M152 24C145 13 132 12 125 20',
      },
      {
        d: 'M88 24C95 35 108 36 115 28M152 24C145 35 132 36 125 28',
      },
      {
        d: 'M111 24H129M117 18C119 15 121 15 123 18M117 30C119 33 121 33 123 30',
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
        d: 'M18 24H50C69 24 74 10 92 10C107 10 113 24 102 33C91 24 96 16 106 16C115 16 120 24 120 24',
      },
      {
        d: 'M222 24H190C171 24 166 10 148 10C133 10 127 24 138 33C149 24 144 16 134 16C125 16 120 24 120 24',
      },
      {
        d: 'M18 24C33 24 41 34 58 34C73 34 77 23 91 23C104 23 112 31 120 39',
      },
      {
        d: 'M222 24C207 24 199 34 182 34C167 34 163 23 149 23C136 23 128 31 120 39',
      },
      {
        d: 'M102 33C109 38 116 37 120 31C124 37 131 38 138 33',
      },
      {
        d: 'M55 24C68 16 81 17 88 24M185 24C172 16 159 17 152 24',
      },
      {
        d: 'M64 29C74 39 88 39 98 29M176 29C166 39 152 39 142 29',
      },
    ],
  },
  {
    id: 'centered-ornamental-flourish',
    label: 'Victorian cartouche',
    shortLabel: 'Cartouche',
    viewBox: '0 0 240 48',
    paths: [
      {
        d: 'M18 24H48M192 24H222',
      },
      {
        d: 'M48 24C66 3 92 4 108 24C113 31 119 31 120 24',
      },
      {
        d: 'M192 24C174 3 148 4 132 24C127 31 121 31 120 24',
      },
      {
        d: 'M48 24C66 45 92 44 108 24C113 17 119 17 120 24',
      },
      {
        d: 'M192 24C174 45 148 44 132 24C127 17 121 17 120 24',
      },
      {
        d: 'M74 24C82 13 96 12 105 20M166 24C158 13 144 12 135 20',
      },
      {
        d: 'M74 24C82 35 96 36 105 28M166 24C158 35 144 36 135 28',
      },
      {
        d: 'M96 24C104 8 116 10 120 20C124 10 136 8 144 24',
      },
      {
        d: 'M96 24C104 40 116 38 120 28C124 38 136 40 144 24',
      },
      {
        d: 'M113 14C116 10 124 10 127 14M113 34C116 38 124 38 127 34',
      },
      {
        d: 'M116 24H124',
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
