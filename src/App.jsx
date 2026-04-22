import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import MonogramMaker from './MonogramMaker';
import LivePreviewSection from './components/LivePreviewSection';
import {
  exportFontFamilyMap,
  fontLibrary,
  scriptFontsToAdjust,
  styleSortOrder,
} from './constants/fontConfig';
import { buildArtworkTextElement, loadCurveFont } from './utils/svgExport';

const FormInput = ({
  label,
  id,
  value,
  onChange,
  required = false,
  isOptional = false,
  disabled = false,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-medium text-slate-700"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
      {isOptional && (
        <span className="ml-1 text-xs text-slate-500">(Optional)</span>
      )}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full rounded-xl border px-3 py-2 text-base shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        disabled
          ? 'cursor-not-allowed bg-slate-100 text-slate-500'
          : 'border-slate-300'
      }`}
    />
  </div>
);

const AlignIcon = ({ align = 'left' }) => {
  const isLeft = align === 'left';
  const isCenter = align === 'center';

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="block"
    >
      <rect
        x={isLeft ? 3 : isCenter ? 5 : 7}
        y="5"
        width="14"
        height="2.2"
        rx="1.1"
        fill="currentColor"
      />
      <rect
        x={isLeft ? 3 : isCenter ? 7 : 9}
        y="11"
        width="10"
        height="2.2"
        rx="1.1"
        fill="currentColor"
      />
      <rect
        x={isLeft ? 3 : isCenter ? 5 : 7}
        y="17"
        width="14"
        height="2.2"
        rx="1.1"
        fill="currentColor"
      />
    </svg>
  );
};

const glyphs = [
  '©',
  '®',
  '™',
  '&',
  '#',
  '+',
  '–',
  '—',
  '…',
  '•',
  '°',
  '·',
  '♥',
  '♡',
  '♦',
  '♢',
  '♣',
  '♧',
  '♠',
  '♤',
  '★',
  '☆',
  '♪',
  '♫',
  '←',
  '→',
  '↑',
  '↓',
  '∞',
  '†',
  '✡\uFE0E',
  '✞',
  '✠',
  '±',
  '½',
  '¼',
  'Α',
  'Β',
  'Γ',
  'Δ',
  'Ε',
  'Ζ',
  'Η',
  'Θ',
  'Ι',
  'Κ',
  'Λ',
  'Μ',
  'Ν',
  'Ξ',
  'Ο',
  'Π',
  'Ρ',
  'Σ',
  'Τ',
  'Υ',
  'Φ',
  'Χ',
  'Ψ',
  'Ω',
];

const accentedCharacters = {
  A: ['À', 'à', 'Á', 'á', 'Â', 'â', 'Ã', 'ã', 'Ä', 'ä', 'Å', 'å', 'Æ', 'æ'],
  C: ['Ç', 'ç'],
  E: ['È', 'è', 'É', 'é', 'Ê', 'ê', 'Ë', 'ë'],
  I: ['Ì', 'ì', 'Í', 'í', 'Î', 'î', 'Ï', 'ï'],
  N: ['Ñ', 'ñ'],
  O: ['Ò', 'ò', 'Ó', 'ó', 'Ô', 'ô', 'Õ', 'õ', 'Ö', 'ö', 'Ø', 'ø', 'Œ', 'œ'],
  S: ['Š', 'š', 'ß'],
  U: ['Ù', 'ù', 'Ú', 'ú', 'Û', 'û', 'Ü', 'ü'],
  Y: ['Ý', 'ý', 'Ÿ', 'ÿ'],
  Z: ['Ž', 'ž'],
};

const hebrewKeyboardLayout = [
  [
    { unshifted: '`', shifted: '~' },
    { unshifted: '1', shifted: 'ְ', name: 'Shva' },
    { unshifted: '2', shifted: 'ַ', name: 'Patah' },
    { unshifted: '3', shifted: 'ָ', name: 'Qamats' },
    { unshifted: '4', shifted: 'ֶ', name: 'Segol' },
    { unshifted: '5', shifted: 'ֵ', name: 'Tsere' },
    { unshifted: '6', shifted: 'ִ', name: 'Hiriq' },
    { unshifted: '7', shifted: 'ֹ', name: 'Holam' },
    { unshifted: '8', shifted: 'ּ', name: 'Dagesh' },
    { unshifted: '9', shifted: 'ֻ', name: 'Qubuts' },
    { unshifted: '0', shifted: 'ֿ', name: 'Rafe' },
    { unshifted: '-', shifted: 'ׁ', name: 'Shin Dot' },
    { unshifted: '=', shifted: 'ׂ', name: 'Sin Dot' },
  ],
  ['/', "'", 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ', '[', ']'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ','],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ', '.'],
];

const hebrewRegex = /[\u0590-\u05FF]/;

const DEFAULT_LINE_SETTING = {
  fontName: '',
  styleKey: '',
  fontSizeOverride: null,
};

const CATEGORY_FILTERS = ['All', ...Object.keys(fontLibrary)];

const flattenFontLibrary = () =>
  Object.entries(fontLibrary).flatMap(([category, fonts]) =>
    fonts.map((font) => ({ ...font, category }))
  );

const getLineIndexFromPosition = (value, position = 0) => {
  if (!value) return 0;

  const safePosition = Math.max(0, Math.min(position, value.length));
  return value.slice(0, safePosition).split('\n').length - 1;
};

const getLineRange = (value, lineIndex) => {
  const lines = String(value || '').split('\n');
  const clampedIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
  let start = 0;

  for (let index = 0; index < clampedIndex; index += 1) {
    start += lines[index].length + 1;
  }

  return {
    start,
    end: start + (lines[clampedIndex]?.length || 0),
  };
};

const styleLabelMap = {
  thin: 'Thin',
  thinItalic: 'Thin Italic',
  extralight: 'Extra Light',
  extralightItalic: 'Extra Light Italic',
  light: 'Light',
  lightItalic: 'Light Italic',
  regular: 'Regular',
  regularItalic: 'Regular Italic',
  italic: 'Italic',
  book: 'Book',
  bookItalic: 'Book Italic',
  roman: 'Roman',
  medium: 'Medium',
  mediumItalic: 'Medium Italic',
  semibold: 'Semi Bold',
  semiBold: 'Semi Bold',
  semiboldItalic: 'Semi Bold Italic',
  semiBoldItalic: 'Semi Bold Italic',
  demi: 'Demi',
  bold: 'Bold',
  boldItalic: 'Bold Italic',
  extrabold: 'Extra Bold',
  extraboldItalic: 'Extra Bold Italic',
  black: 'Black',
  blackItalic: 'Black Italic',
  outline: 'Outline',
  condensed: 'Condensed',
  condensedBold: 'Condensed Bold',
  condensedItalic: 'Condensed Italic',
  condensedBoldItalic: 'Condensed Bold Italic',
};

const formatStyleLabel = (styleKey = '') => {
  if (!styleKey) return '';
  if (styleLabelMap[styleKey]) return styleLabelMap[styleKey];

  return styleKey
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const truncateLineReference = (line = '', maxLength = 38) => {
  const trimmedLine = line.trim();

  if (trimmedLine.length <= maxLength) return trimmedLine;
  return `${trimmedLine.slice(0, maxLength - 1).trimEnd()}…`;
};

const ToolShortcutButton = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-[64px] flex-col items-center justify-center rounded-[16px] border border-[#ddd5c5] bg-white/86 px-3 py-2.5 text-center text-[#18395a] shadow-[0_10px_26px_-22px_rgba(20,39,58,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#b4ab92] hover:bg-white"
  >
    <span className="text-[1.25rem] leading-none">{icon}</span>
    <span className="mt-1.5 text-[0.86rem] font-semibold">{label}</span>
  </button>
);

const App = () => {
  const WORKER_URL =
    'https://customerfontselection-worker.tom-4a9.workers.dev';
  const DEFAULT_TEXT_PLACEHOLDER =
    'Eleanor & James\nEst. 2024\nForever & Always';
  const allFonts = useMemo(() => flattenFontLibrary(), []);

  const [customText, setCustomText] = useState('');
  const [lineSettings, setLineSettings] = useState([]);
  const [selectedPreviewLineIndex, setSelectedPreviewLineIndex] =
    useState(null);
  const [fontSize, setFontSize] = useState(36);
  const [lineSpacing, setLineSpacing] = useState(1);
  const [textAlign, setTextAlign] = useState('center');
  const [fontCategoryFilter, setFontCategoryFilter] = useState('All');
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const [customerNotes, setCustomerNotes] = useState('');
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showGlyphPalette, setShowGlyphPalette] = useState(false);
  const [showAccentPalette, setShowAccentPalette] = useState(false);
  const [showHebrewPalette, setShowHebrewPalette] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [pendingSvgContent, setPendingSvgContent] = useState(null);
  const [isDataPrefilled, setIsDataPrefilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
  const [showMonogramMaker, setShowMonogramMaker] = useState(false);
  const [monogramInfo, setMonogramInfo] = useState(null);
  const [hebrewPaletteText, setHebrewPaletteText] = useState('');
  const [isShifted, setIsShifted] = useState(false);

  const textInputRef = useRef(null);

  const styleOrderIndex = useMemo(
    () =>
      styleSortOrder.reduce((lookup, styleKey, index) => {
        lookup[styleKey.toLowerCase()] = index;
        return lookup;
      }, {}),
    []
  );

  const getSortedStyleKeys = useCallback(
    (styles) =>
      Object.keys(styles || {}).sort((a, b) => {
        const indexA = styleOrderIndex[a.toLowerCase()];
        const indexB = styleOrderIndex[b.toLowerCase()];

        if (indexA == null && indexB == null) return a.localeCompare(b);
        if (indexA == null) return 1;
        if (indexB == null) return -1;
        return indexA - indexB;
      }),
    [styleOrderIndex]
  );

  const getFontOptionByName = useCallback(
    (fontName, fonts = allFonts) =>
      fonts.find((font) => font.name === fontName),
    [allFonts]
  );

  const getDefaultStyleKey = useCallback(
    (fontName, fonts = allFonts) => {
      const font = fonts.find((fontOption) => fontOption.name === fontName);
      if (!font) return '';

      const sortedStyleKeys = getSortedStyleKeys(font.styles);
      if (font.activeStyle && sortedStyleKeys.includes(font.activeStyle)) {
        return font.activeStyle;
      }

      return sortedStyleKeys[0] || '';
    },
    [allFonts, getSortedStyleKeys]
  );

  const normalizeFontSizeOverride = (value) => {
    if (value == null || value === '') return null;

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) return null;

    return Math.max(12, Math.round(parsedValue));
  };

  const normalizeLineSelection = useCallback(
    (line, fonts = allFonts) => {
      if (fonts.length === 0) {
        return {
          ...line,
          fontName: '',
          styleKey: '',
          fontSizeOverride: normalizeFontSizeOverride(line.fontSizeOverride),
        };
      }

      const selectedFont = getFontOptionByName(line.fontName, fonts) || fonts[0];
      const fontName = selectedFont.name;
      const styleKey = selectedFont.styles[line.styleKey]
        ? line.styleKey
        : getDefaultStyleKey(fontName, fonts);

      return {
        ...line,
        fontName,
        styleKey,
        fontSizeOverride: normalizeFontSizeOverride(line.fontSizeOverride),
      };
    },
    [allFonts, getDefaultStyleKey, getFontOptionByName]
  );

  const getNormalizedLineSetting = useCallback(
    (settings, index, fonts = allFonts) =>
      normalizeLineSelection(settings[index] || DEFAULT_LINE_SETTING, fonts),
    [allFonts, normalizeLineSelection]
  );

  const derivedTextLines = useMemo(
    () => (customText === '' ? [] : customText.split(/\r?\n/)),
    [customText]
  );

  const previewLines = useMemo(
    () =>
      derivedTextLines.map((text, index) => ({
        lineIndex: index,
        text,
        ...getNormalizedLineSetting(lineSettings, index),
      })),
    [derivedTextLines, getNormalizedLineSetting, lineSettings]
  );

  const populatedPreviewLines = useMemo(
    () => previewLines.filter((line) => line.text.trim() !== ''),
    [previewLines]
  );

  const hasReadySubmission = Boolean(
    monogramInfo || populatedPreviewLines.length > 0
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('orderId');
    const urlName = params.get('name');
    const urlCompany = params.get('company');

    if (urlOrderId && urlName) {
      setOrderNumber(urlOrderId);
      setCustomerName(urlName);
      setCustomerCompany(urlCompany || '');
      setIsDataPrefilled(true);
    }
  }, []);

  useEffect(() => {
    setLineSettings((prevSettings) => {
      const nextSettings = derivedTextLines.map((_, index) =>
        getNormalizedLineSetting(prevSettings, index, allFonts)
      );

      const settingsMatch =
        nextSettings.length === prevSettings.length &&
        nextSettings.every(
          (setting, index) =>
            setting.fontName === prevSettings[index]?.fontName &&
            setting.styleKey === prevSettings[index]?.styleKey &&
            setting.fontSizeOverride === prevSettings[index]?.fontSizeOverride
        );

      return settingsMatch ? prevSettings : nextSettings;
    });
  }, [allFonts, derivedTextLines, getNormalizedLineSetting]);

  useEffect(() => {
    if (previewLines.length === 0) {
      if (selectedPreviewLineIndex !== null) {
        setSelectedPreviewLineIndex(null);
      }
      return;
    }

    if (selectedPreviewLineIndex == null) {
      setSelectedPreviewLineIndex(0);
      return;
    }

    if (
      selectedPreviewLineIndex != null &&
      selectedPreviewLineIndex >= previewLines.length
    ) {
      setSelectedPreviewLineIndex(previewLines.length - 1);
    }
  }, [previewLines.length, selectedPreviewLineIndex]);

  const showMessage = (msg, duration = 4000) => {
    setMessage(msg);
    setShowMessageBox(true);
    setTimeout(() => setShowMessageBox(false), duration);
  };

  const syncActiveLineFromTextarea = useCallback((textareaElement) => {
    if (!textareaElement) return;

    const nextLineIndex = getLineIndexFromPosition(
      textareaElement.value,
      textareaElement.selectionStart ?? 0
    );

    setSelectedPreviewLineIndex(nextLineIndex);
  }, []);

  const focusTextareaLine = useCallback((lineIndex) => {
    const textarea = textInputRef.current;
    if (!textarea || lineIndex == null) return;

    const { end } = getLineRange(textarea.value, lineIndex);

    textarea.focus();
    textarea.setSelectionRange(end, end);
    setSelectedPreviewLineIndex(lineIndex);
  }, []);

  const handleTextChange = (e) => {
    setCustomText(e.target.value);
    syncActiveLineFromTextarea(e.target);
  };

  const handleTextInteraction = (e) => {
    syncActiveLineFromTextarea(e.target);
  };

  const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));
  const handleLineSpacingChange = (e) => setLineSpacing(Number(e.target.value));

  const handleApplyFontToLine = useCallback(
    (lineIndex, fontName) => {
      const targetFont = getFontOptionByName(fontName);
      if (!targetFont || lineIndex == null) return;

      setLineSettings((prevSettings) =>
        derivedTextLines.map((text, index) => {
          const currentSetting = getNormalizedLineSetting(
            prevSettings,
            index,
            allFonts
          );

          if (index !== lineIndex) return currentSetting;

          return {
            ...currentSetting,
            fontName,
            styleKey: targetFont.styles[currentSetting.styleKey]
              ? currentSetting.styleKey
              : getDefaultStyleKey(fontName),
          };
        })
      );
    },
    [
      allFonts,
      derivedTextLines,
      getDefaultStyleKey,
      getFontOptionByName,
      getNormalizedLineSetting,
    ]
  );

  const handleFontChipSelect = useCallback(
    (fontName) => {
      if (selectedPreviewLineIndex == null) return;
      handleApplyFontToLine(selectedPreviewLineIndex, fontName);
    },
    [handleApplyFontToLine, selectedPreviewLineIndex]
  );

  const handleStyleSelect = useCallback(
    (styleKey) => {
      if (!styleKey || selectedPreviewLineIndex == null) return;

      setLineSettings((prevSettings) =>
        derivedTextLines.map((text, index) => {
          const currentSetting = getNormalizedLineSetting(
            prevSettings,
            index,
            allFonts
          );

          if (index !== selectedPreviewLineIndex) return currentSetting;

          return {
            ...currentSetting,
            styleKey,
          };
        })
      );
    },
    [
      allFonts,
      derivedTextLines,
      getNormalizedLineSetting,
      selectedPreviewLineIndex,
    ]
  );

  const handlePreviewLineSelect = useCallback(
    (lineIndex) => {
      if (lineIndex == null) return;
      focusTextareaLine(lineIndex);
    },
    [focusTextareaLine]
  );

  const handleResetLayout = () => {
    setFontSize(36);
    setLineSpacing(1);
    setTextAlign('center');
  };

  const handleFitToPreview = useCallback(() => {
    const visibleLines = previewLines.filter((line) => line.text.trim() !== '');
    if (visibleLines.length === 0) return;

    const longestLineLength = visibleLines.reduce(
      (maxLength, line) => Math.max(maxLength, line.text.length),
      0
    );

    const sizeByLineCount = Math.max(34, 70 - (visibleLines.length - 1) * 8);
    const sizeByLength = Math.max(
      30,
      Math.min(72, Math.round(920 / Math.max(longestLineLength, 10)))
    );

    setFontSize(
      Math.max(30, Math.min(72, Math.min(sizeByLineCount, sizeByLength)))
    );
    setLineSpacing(visibleLines.length > 2 ? 0.94 : 1);
  }, [previewLines]);

  const formatForFilename = (str) =>
    str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

  const handleGlyphInsert = (glyph) => {
    const textarea = textInputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? customText.length;
    const end = textarea.selectionEnd ?? customText.length;
    const nextText =
      customText.substring(0, start) + glyph + customText.substring(end);

    setCustomText(nextText);

    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + glyph.length;
      syncActiveLineFromTextarea(textarea);
    }, 0);
  };

  const handleInsertToMain = () => {
    if (!hebrewPaletteText) return;
    handleGlyphInsert(hebrewPaletteText);
    setHebrewPaletteText('');
    setShowHebrewPalette(false);
  };

  const handleHebrewBackspace = () => {
    if (hebrewPaletteText.length === 0) return;

    const segmenter = new Intl.Segmenter('he', { granularity: 'grapheme' });
    const graphemes = Array.from(segmenter.segment(hebrewPaletteText)).map(
      (s) => s.segment
    );

    graphemes.pop();
    setHebrewPaletteText(graphemes.join(''));
  };

  const generateSvgContent = async (mode = 'editable') => {
    const hasStandardSelection = populatedPreviewLines.length > 0;

    if (!monogramInfo && !hasStandardSelection) {
      showMessage(
        'Please create a monogram, or select at least one font and enter some text to submit.'
      );
      return null;
    }

    let svgElements = '';
    let metadataElements = '';
    const labelFontSize = 16;
    const padding = 20;
    const svgWidth = 800;
    let y = padding;

    const escapeXml = (unsafe) =>
      unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '&':
            return '&amp;';
          case "'":
            return '&apos;';
          case '"':
            return '&quot;';
          default:
            return c;
        }
      });

    if (monogramInfo) {
      const data = monogramInfo.data;
      y += labelFontSize + 10;

      const title = data.isCircular
        ? `Circular Monogram (${data.frameStyle})`
        : `${data.font.name} (${
            data.style.charAt(0).toUpperCase() + data.style.slice(1)
          })`;

      svgElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Monogram: ${escapeXml(
        title
      )}</text>\n`;

      const svgCenterX = svgWidth / 2;
      const monogramBlockY = y + 150;

      if (data.isCircular) {
        const [first, middle, last] = data.text;
        const frameStyle = data.frameStyle;
        const textColor =
          frameStyle === 'solid' || frameStyle === 'double' ? 'white' : 'black';
        const baseFontSize = (data.fontSize || 100) * 1.5;
        const finalFontSize = baseFontSize * 0.9875;
        let frameSvg = '';

        if (frameStyle === 'solid') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />`;
        } else if (frameStyle === 'double') {
          frameSvg = `<g><circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" /><circle cx="${svgCenterX}" cy="${monogramBlockY}" r="59" fill="none" stroke="white" stroke-width="3" /></g>`;
        } else if (frameStyle === 'dotted') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="4" stroke-dasharray="10 10" />`;
        } else if (frameStyle === 'outline') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="2" />`;
        } else if (frameStyle === 'thick-thin') {
          frameSvg = `<g><circle cx="${svgCenterX}" cy="${monogramBlockY}" r="65" fill="none" stroke="black" stroke-width="5" /><circle cx="${svgCenterX}" cy="${monogramBlockY}" r="57" fill="none" stroke="black" stroke-width="2" /></g>`;
        }

        svgElements += frameSvg;

        if (mode === 'curves') {
          const letterConfigs = [
            {
              char: first,
              fontFamily: 'LeftCircleMonogram',
              yOffset: 0,
            },
            {
              char: middle,
              fontFamily: 'MiddleCircleMonogram',
              yOffset: -(finalFontSize * 0.02),
            },
            {
              char: last,
              fontFamily: 'RightCircleMonogram',
              yOffset: 0,
            },
          ];

          const measuredWidths = await Promise.all(
            letterConfigs.map(async ({ char, fontFamily }) => {
              const font = await loadCurveFont(fontFamily);
              return font
                ? font.getAdvanceWidth(char, finalFontSize, { kerning: true })
                : finalFontSize * 0.7;
            })
          );

          let currentX =
            svgCenterX -
            measuredWidths.reduce((sum, width) => sum + width, 0) / 2;

          for (const [index, config] of letterConfigs.entries()) {
            svgElements += await buildArtworkTextElement({
              mode,
              text: config.char,
              x: currentX,
              y: monogramBlockY + config.yOffset,
              fontFamily: config.fontFamily,
              exportFontFamily: config.fontFamily,
              fontSize: finalFontSize,
              fill: textColor,
              anchor: 'start',
              verticalAlign: 'middle',
              escapeXml,
            });

            currentX += measuredWidths[index];
          }
        } else {
          svgElements += `<text x="${svgCenterX}" y="${monogramBlockY}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" style="font-size: ${finalFontSize}px;"><tspan font-family="LeftCircleMonogram">${escapeXml(
            first
          )}</tspan><tspan font-family="MiddleCircleMonogram" dy="-0.02em">${escapeXml(
            middle
          )}</tspan><tspan font-family="RightCircleMonogram">${escapeXml(
            last
          )}</tspan></text>`;
        }

        y = monogramBlockY + 100;
      } else {
        const [first, middle, last] = data.text;
        const fontFamily = data.font.styles[data.style];
        const baseSize = data.fontSize || 100;
        const sideScale = 1.2;
        const middleScale = 1.6;
        const sideSize = data.disableScaling ? baseSize : baseSize * sideScale;
        const middleSize = data.disableScaling
          ? baseSize
          : baseSize * middleScale;
        const gap = sideSize * 0.2;
        const middleLetterHalfWidth = (middleSize / 2) * 0.7;
        const middleX = svgCenterX;
        const leftX = middleX - middleLetterHalfWidth - gap;
        const rightX = middleX + middleLetterHalfWidth + gap;

        if (mode === 'curves') {
          svgElements += await buildArtworkTextElement({
            mode,
            text: first,
            x: leftX,
            y: monogramBlockY,
            fontFamily,
            exportFontFamily: fontFamily,
            fontSize: sideSize,
            anchor: 'middle',
            verticalAlign: 'middle',
            escapeXml,
          });

          svgElements += await buildArtworkTextElement({
            mode,
            text: middle,
            x: middleX,
            y: monogramBlockY,
            fontFamily,
            exportFontFamily: fontFamily,
            fontSize: middleSize,
            anchor: 'middle',
            verticalAlign: 'middle',
            escapeXml,
          });

          svgElements += await buildArtworkTextElement({
            mode,
            text: last,
            x: rightX,
            y: monogramBlockY,
            fontFamily,
            exportFontFamily: fontFamily,
            fontSize: sideSize,
            anchor: 'middle',
            verticalAlign: 'middle',
            escapeXml,
          });
        } else {
          svgElements += `<g dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" fill="#181717"><text x="${leftX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(
            first
          )}</text><text x="${middleX}" y="${monogramBlockY}" font-size="${middleSize}px">${escapeXml(
            middle
          )}</text><text x="${rightX}" y="${monogramBlockY}" font-size="${sideSize}px">${escapeXml(
            last
          )}</text></g>`;
        }

        y = monogramBlockY + middleSize / 2;
      }
    }

    let contentY = y + 40;

    if (hasStandardSelection) {
      let artworkY = contentY;
      const estimatedGroupWidth = 560;
      const groupLeftX = svgWidth / 2 - estimatedGroupWidth / 2;
      const groupRightX = svgWidth / 2 + estimatedGroupWidth / 2;

      for (const [index, line] of populatedPreviewLines.entries()) {
        const font = getFontOptionByName(line.fontName);
        const fallbackStyleKey = getDefaultStyleKey(line.fontName);
        const activeFontFamily =
          font?.styles?.[line.styleKey] ||
          font?.styles?.[fallbackStyleKey] ||
          'inherit';
        const exportFontFamily =
          exportFontFamilyMap[activeFontFamily] || activeFontFamily;
        const effectiveFontSize = line.fontSizeOverride ?? fontSize;
        const styleName = line.styleKey
          ? line.styleKey.charAt(0).toUpperCase() + line.styleKey.slice(1)
          : 'No Style';

        artworkY += effectiveFontSize * lineSpacing;

        const lineX =
          textAlign === 'left'
            ? groupLeftX
            : textAlign === 'right'
            ? groupRightX
            : svgWidth / 2;

        const lineAnchor =
          textAlign === 'left'
            ? 'start'
            : textAlign === 'right'
            ? 'end'
            : 'middle';

        svgElements += await buildArtworkTextElement({
          mode,
          text: line.text,
          x: lineX,
          y: artworkY,
          fontFamily: activeFontFamily,
          exportFontFamily,
          fontSize: effectiveFontSize,
          fill: '#181717',
          anchor: lineAnchor,
          escapeXml,
        });

        metadataElements += `<text x="${padding}" y="${
          labelFontSize + 10 + index * labelFontSize * 1.5
        }" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Line ${
          index + 1
        }: ${escapeXml(font?.name || 'No Font')} (${escapeXml(
          styleName
        )})</text>\n`;
      }

      contentY = artworkY;
    }

    if (customerNotes.trim() !== '') {
      contentY += fontSize * 1.4;
      svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">Customer Notes</text>\n`;
      contentY += labelFontSize * 0.5;

      const noteLines = customerNotes
        .split('\n')
        .filter((line) => line.trim() !== '');

      noteLines.forEach((noteLine) => {
        contentY += labelFontSize * 1.4;
        svgElements += `<text x="${padding}" y="${contentY}" font-family="Arial" font-size="${labelFontSize}" fill="#181717">${escapeXml(
          noteLine
        )}</text>\n`;
      });
    }

    let metadataBlock = '';
    let metadataHeight = 0;

    if (metadataElements !== '') {
      metadataHeight =
        populatedPreviewLines.length * labelFontSize * 1.5 + padding;
      const metadataBlockY = contentY + padding + labelFontSize;

      metadataBlock = `<g transform="translate(0, ${metadataBlockY})"><text x="${padding}" y="0" font-family="Arial" font-size="${labelFontSize}" fill="#94a3b8" font-weight="700">Font Reference</text>${metadataElements}</g>`;
    }

    const svgHeight =
      contentY +
      padding +
      metadataHeight +
      (metadataElements !== '' ? labelFontSize * 2 : 0);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">${svgElements}${metadataBlock}</svg>`;
  };

  const uploadSvgFile = async (filename, svgContent) => {
    const response = await fetch(`${WORKER_URL}/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/svg+xml' },
      body: svgContent,
    });

    if (response.status === 409) {
      throw new Error(`A submission for ${filename} already exists.`);
    }

    if (!response.ok) {
      throw new Error(await response.text());
    }
  };

  const handleSubmitClick = async () => {
    const editableSvgContent = await generateSvgContent('editable');
    if (!editableSvgContent) return;

    const curvesSvgContent = await generateSvgContent('curves');
    if (!curvesSvgContent) return;

    const svgContent = {
      editable: editableSvgContent,
      curves: curvesSvgContent,
    };

    setPendingSvgContent(svgContent);

    if (isDataPrefilled) {
      handleFinalSubmit(svgContent);
    } else {
      setShowCustomerModal(true);
    }
  };

  const handleFinalSubmit = async (svgContent) => {
    if (!orderNumber.trim() || !customerName.trim()) {
      showMessage('Order Number and Customer Name are required.');
      return;
    }

    setIsSubmitting(true);
    setShowCustomerModal(false);

    const baseFilename = [
      formatForFilename(orderNumber),
      formatForFilename(customerName),
      customerCompany.trim() ? formatForFilename(customerCompany) : '',
    ]
      .filter(Boolean)
      .join('_');

    const editableFilename = `${baseFilename}.svg`;
    const curvesFilename = `${baseFilename}_CURVES.svg`;

    try {
      await Promise.all([
        uploadSvgFile(editableFilename, svgContent.editable),
        uploadSvgFile(curvesFilename, svgContent.curves),
      ]);

      setShowSuccessModal(true);
      setIsSubmissionComplete(true);
    } catch (error) {
      console.error('Upload error:', error);
      showMessage(`Error uploading SVG: ${error.message}`, 6000);
    } finally {
      setIsSubmitting(false);
    }

    if (!isDataPrefilled) {
      setCustomerName('');
      setCustomerCompany('');
      setOrderNumber('');
    }

    setPendingSvgContent(null);
  };

  const handleCustomerModalSubmit = (e) => {
    e.preventDefault();
    handleFinalSubmit(pendingSvgContent);
  };

  const visibleFontOptions =
    fontCategoryFilter === 'All'
      ? allFonts
      : allFonts.filter((font) => font.category === fontCategoryFilter);

  const selectedPreviewLine =
    previewLines.find((line) => line.lineIndex === selectedPreviewLineIndex) ||
    previewLines[0] ||
    null;

  const hasAnyRealText = populatedPreviewLines.length > 0;
  const hasSelectableLine =
    selectedPreviewLine != null && selectedPreviewLine.lineIndex != null;
  const selectedLineText = selectedPreviewLine?.text || '';
  const selectedLineHasRealText = selectedLineText.trim() !== '';
  const selectedLineNumberLabel =
    selectedPreviewLine?.lineIndex != null
      ? `Line ${selectedPreviewLine.lineIndex + 1}`
      : 'Line';
  const selectedLineReference = selectedLineHasRealText
    ? truncateLineReference(selectedLineText)
    : selectedLineNumberLabel;
  const selectedLineFontName = selectedPreviewLine?.fontName || '';
  const selectedFontOption =
    hasAnyRealText && selectedLineFontName
      ? getFontOptionByName(selectedLineFontName)
      : null;
  const selectedFontStyleKeys = selectedFontOption
    ? getSortedStyleKeys(selectedFontOption.styles)
    : [];
  const selectedStyleKey = selectedPreviewLine?.styleKey
    ? selectedPreviewLine.styleKey
    : selectedFontOption
    ? getDefaultStyleKey(selectedFontOption.name)
    : '';
  const selectedStyleLabel = formatStyleLabel(selectedStyleKey);

  const statusTitle = !hasAnyRealText
    ? 'Start typing to preview your engraving'
    : !hasSelectableLine
    ? 'Select a line to start styling'
    : selectedLineHasRealText
    ? `Active line: ${selectedLineReference}`
    : `${selectedLineNumberLabel} is ready for text`;

  const statusDescription = !hasAnyRealText
    ? 'Placeholder text stays as an example until you enter your own wording.'
    : !hasSelectableLine
    ? 'Click inside the text box or preview to choose which line you want to edit.'
    : selectedLineHasRealText
    ? 'Click a different line in the text box or preview to change its font and style.'
    : 'Type on this line to preview it, or click another line to style different text.';

  const fontHeading = !hasAnyRealText
    ? 'Choose a font'
    : selectedLineHasRealText
    ? `Choose a font for "${selectedLineReference}"`
    : `Choose a font for ${selectedLineNumberLabel}`;

  const fontSupportCopy = !hasAnyRealText
    ? 'Enter text to unlock line-based font styling.'
    : selectedLineHasRealText
    ? 'Fonts and styles apply only to the active engraving line.'
    : `${selectedLineNumberLabel} is empty until you type into it.`;

  const notesPreviewText = customerNotes.trim()
    ? `${customerNotes.trim().slice(0, 120)}${
        customerNotes.trim().length > 120 ? '...' : ''
      }`
    : 'Share any special requests, font preferences, or placement notes.';

  return (
    <div className="min-h-screen bg-[#f6f1e7] font-sans text-[#17324d] xl:h-screen xl:overflow-hidden">
      {isSubmissionComplete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#f6f1e7]/95">
          <div className="rounded-[28px] border border-[#ded5c6] bg-[#fcfaf4] px-10 py-12 text-center shadow-[0_28px_80px_-48px_rgba(20,39,58,0.45)]">
            <h2
              className="text-4xl font-bold text-[#18395a]"
              style={{ fontFamily: 'Alumni Sans Regular' }}
            >
              Submission Complete
            </h2>
            <p className="mt-4 text-lg text-[#5d6774]">
              Thank you for your submission. You may now close this window.
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-4 py-3 lg:px-6 xl:h-screen xl:min-h-0 xl:overflow-hidden">
        <header className="shrink-0 rounded-[28px] border border-[#dfd6c7] bg-[rgba(251,248,241,0.92)] px-4 py-4 shadow-[0_18px_44px_-34px_rgba(20,39,58,0.35)] backdrop-blur lg:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <img
                src="/images/Arch Vector Logo.svg"
                alt="Arch Engraving Logo"
                className="h-12 w-auto md:h-14"
              />
              <div className="hidden h-12 w-px bg-[#d8d0c1] md:block" />
              <div>
                <h1
                  className="text-[1.85rem] leading-none text-[#18395a] sm:text-[2.25rem]"
                  style={{ fontFamily: 'Alumni Sans Regular' }}
                >
                  Arch Engraving Font Selection
                </h1>
                <p className="mt-1.5 max-w-3xl text-[0.95rem] text-[#5f6875]">
                  Preview your fonts, fine-tune your layout, and submit your
                  selection.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 xl:items-end">
              <button
                onClick={handleSubmitClick}
                type="button"
                disabled={isSubmitting || !hasReadySubmission}
                className="inline-flex items-center gap-3 rounded-[16px] bg-[#6c7343] px-5 py-3 text-[0.98rem] font-semibold text-white shadow-[0_18px_28px_-20px_rgba(108,115,67,0.8)] transition-all hover:bg-[#5f673b] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M21 3L10 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 3L14 21L10 14L3 10L21 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {isSubmitting ? 'Submitting...' : 'Review & Submit'}
                </span>
              </button>
              <p className="text-sm text-[#6b7480]">
                We&apos;ll email a proof soon.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-3 grid flex-1 gap-3 xl:min-h-0 xl:grid-cols-[minmax(450px,540px)_minmax(0,1fr)] xl:overflow-hidden">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#dfd6c7] bg-[rgba(251,248,241,0.94)] p-4 shadow-[0_20px_52px_-36px_rgba(20,39,58,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5e7085]">
                  Custom Text
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#66707d]">
                  Add one engraving line per row, then choose a font and style
                  for the active line below.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <ToolShortcutButton
                icon="אב"
                label="Hebrew"
                onClick={() => setShowHebrewPalette(true)}
              />
              <ToolShortcutButton
                icon="á"
                label="Accented"
                onClick={() => setShowAccentPalette(true)}
              />
              <ToolShortcutButton
                icon="○"
                label="Symbols"
                onClick={() => setShowGlyphPalette(true)}
              />
              <ToolShortcutButton
                icon="⌘"
                label="Monogram Maker"
                onClick={() => setShowMonogramMaker(true)}
              />
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col">
              <div className="rounded-[22px] border border-[#d8cfbf] bg-white/84 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <textarea
                  ref={textInputRef}
                  className="min-h-[148px] w-full resize-none rounded-[18px] border border-[#c9bfad] bg-[#fffdf8] px-4 py-3 text-[1.02rem] leading-[2.2rem] text-[#17324d] shadow-[inset_0_1px_8px_rgba(24,57,90,0.05)] outline-none transition focus:border-[#6c7343] focus:ring-2 focus:ring-[#d8ddc0]"
                  value={customText}
                  onChange={handleTextChange}
                  onClick={handleTextInteraction}
                  onKeyUp={handleTextInteraction}
                  onSelect={handleTextInteraction}
                  onFocus={handleTextInteraction}
                  placeholder={DEFAULT_TEXT_PLACEHOLDER}
                  dir="auto"
                />
              </div>

              <div className="mt-2.5 px-1 text-[#6f7d89]">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-[0.42rem] h-2 w-2 flex-shrink-0 rounded-full ${
                      hasAnyRealText ? 'bg-[#798350]' : 'bg-[#b8b39d]'
                    }`}
                  />
                  <div>
                    <p className="text-[0.88rem] font-semibold text-[#476072]">
                      {statusTitle}
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-[#788591]">
                      {statusDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-[#e4dccd] pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[1.08rem] font-semibold text-[#18395a]">
                      {fontHeading}
                    </h2>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7b8794]">
                      {fontSupportCopy}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef1df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6c7343]">
                    {fontCategoryFilter}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map((filterLabel) => (
                    <button
                      key={filterLabel}
                      type="button"
                      onClick={() => setFontCategoryFilter(filterLabel)}
                      className={`rounded-[13px] border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        fontCategoryFilter === filterLabel
                          ? 'border-[#6c7343] bg-[#6c7343] text-white'
                          : 'border-[#ddd5c7] bg-white/78 text-[#315171] hover:border-[#a69a82] hover:bg-white'
                      }`}
                    >
                      {filterLabel}
                    </button>
                  ))}
                </div>

                {selectedFontOption && (
                  <div className="mt-3 rounded-[16px] border border-[#ddd5c7] bg-white/58 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-[#18395a]">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                        Current Font
                      </span>
                      <span className="rounded-full bg-[#f3efdf] px-3 py-1 text-sm font-semibold">
                        {selectedFontOption.name}
                      </span>
                      {selectedStyleLabel && (
                        <span className="rounded-full border border-[#d9d1c1] bg-white px-3 py-1 text-sm font-medium text-[#5d6774]">
                          {selectedStyleLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {selectedFontStyleKeys.map((styleKey) => {
                        const isSelected = selectedStyleKey === styleKey;

                        return (
                          <button
                            key={`${selectedFontOption.name}-${styleKey}`}
                            type="button"
                            onClick={() => handleStyleSelect(styleKey)}
                            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'border-[#6c7343] bg-[#6c7343] text-white'
                                : 'border-[#d9d1c1] bg-white text-[#315171] hover:border-[#a69a82] hover:bg-[#faf8f1]'
                            }`}
                          >
                            {formatStyleLabel(styleKey)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-[22px] border border-[#ddd5c7] bg-white/65 p-2.5">
                  <div className="grid h-full grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden pr-1 sm:grid-cols-3">
                    {visibleFontOptions.map((font) => {
                      const previewStyleKey = getDefaultStyleKey(
                        font.name,
                        allFonts
                      );
                      const previewFontFamily =
                        font.name === 'Alumni Sans'
                          ? 'Alumni Sans Regular'
                          : font.styles[previewStyleKey] ||
                            font.styles[getSortedStyleKeys(font.styles)[0]];
                      const isSelected = selectedLineFontName === font.name;
                      const isScriptFont = scriptFontsToAdjust.includes(
                        font.name
                      );

                      return (
                        <button
                          key={`${font.category}-${font.name}`}
                          type="button"
                          onClick={() => handleFontChipSelect(font.name)}
                          disabled={
                            !hasAnyRealText || selectedPreviewLineIndex == null
                          }
                          className={`rounded-[15px] border px-3 py-2.5 text-center shadow-[0_12px_26px_-24px_rgba(20,39,58,0.45)] transition-all ${
                            isSelected
                              ? 'border-[#6c7343] bg-[#eef1df] text-[#18395a]'
                              : 'border-[#ddd5c7] bg-white/82 text-[#23415d] hover:-translate-y-0.5 hover:border-[#9f957f] hover:bg-white'
                          } ${
                            !hasAnyRealText || selectedPreviewLineIndex == null
                              ? 'cursor-not-allowed opacity-60'
                              : ''
                          }`}
                        >
                          <span
                            className={`block leading-none ${
                              isScriptFont ? 'text-[1.45rem]' : 'text-[1.03rem]'
                            }`}
                            style={{ fontFamily: previewFontFamily }}
                          >
                            {font.name}
                          </span>
                          <span className="mt-1.5 block text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[#8190a0]">
                            {font.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-2.5 text-sm text-[#708090]">
                  {hasAnyRealText
                    ? 'Fonts and styles stay tied to the active line. Click a different line to restyle it.'
                    : 'Enter text first, then click a line to style it.'}
                </p>
              </div>
            </div>
          </section>

          <LivePreviewSection
            AlignIcon={AlignIcon}
            customText={customText}
            fontSize={fontSize}
            getDefaultStyleKey={getDefaultStyleKey}
            getFontOptionByName={getFontOptionByName}
            hebrewRegex={hebrewRegex}
            lineSpacing={lineSpacing}
            monogramInfo={monogramInfo}
            onFitToPreview={handleFitToPreview}
            onFontSizeChange={handleFontSizeChange}
            onLineSelect={handlePreviewLineSelect}
            onLineSpacingChange={handleLineSpacingChange}
            onResetLayout={handleResetLayout}
            onTextAlignChange={setTextAlign}
            previewLines={previewLines}
            selectedPreviewLineIndex={selectedPreviewLineIndex}
            textAlign={textAlign}
          />
        </div>

        <section className="mt-3 shrink-0 rounded-[24px] border border-[#dfd6c7] bg-[rgba(251,248,241,0.88)] px-4 py-3 shadow-[0_18px_40px_-34px_rgba(20,39,58,0.35)]">
          <button
            type="button"
            onClick={() => setIsNotesOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <div className="flex items-center gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="text-[#315171]"
                >
                  <path
                    d="M12 20H21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5 3.5C16.8978 3.10218 17.4374 2.87866 18 2.87866C18.5626 2.87866 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[1rem] font-semibold text-[#18395a]">
                  Notes for Designer
                </p>
                <span className="text-sm text-[#7c8794]">(Optional)</span>
              </div>
              <p className="mt-1.5 text-sm text-[#6f7a86]">
                {notesPreviewText}
              </p>
            </div>

            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`flex-shrink-0 text-[#315171] transition-transform ${
                isNotesOpen ? 'rotate-180' : ''
              }`}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isNotesOpen && (
            <textarea
              className="mt-3 min-h-[104px] w-full rounded-[20px] border border-[#d5cbbb] bg-white/82 px-4 py-3 text-[1rem] text-[#17324d] shadow-[inset_0_1px_8px_rgba(24,57,90,0.05)] outline-none transition focus:border-[#6c7343] focus:ring-2 focus:ring-[#d8ddc0]"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Share any special requests, font preferences, or placement notes."
            />
          )}
        </section>
      </main>

      {(showCustomerModal ||
        showMessageBox ||
        showGlyphPalette ||
        showAccentPalette ||
        showHebrewPalette ||
        showSuccessModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-75 p-4 transition-opacity animate-fade-in">
          <div className="w-full max-w-4xl animate-jump-in rounded-2xl bg-white p-8 shadow-2xl">
            {showSuccessModal && (
              <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                <img
                  src="/images/Arch Vector Logo.svg"
                  alt="Arch Engraving Logo"
                  className="mb-6 h-95 w-95"
                />
                <h3 className="mb-2 text-3xl font-bold text-slate-800">
                  Submission Successful!
                </h3>
                <p className="mb-8 text-lg text-slate-600">
                  We Appreciate Your Business!
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-xl bg-blue-600 px-12 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  type="button"
                >
                  Done
                </button>
              </div>
            )}

            {showHebrewPalette && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  Hebrew Keyboard
                </h3>
                <p className="pb-2 text-slate-600">
                  Please use the virtual keyboard below to compose your Hebrew
                  text. When finished, click the &apos;Insert Text&apos; button.
                  Your text will be added to the main input area, allowing you
                  to preview it in your chosen fonts.
                </p>

                <div className="pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Preview
                    </label>
                    <button
                      onClick={() => setHebrewPaletteText('')}
                      className="rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200"
                      type="button"
                    >
                      Clear
                    </button>
                  </div>

                  <textarea
                    readOnly
                    className="min-h-[100px] w-full cursor-default rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-2xl shadow-inner"
                    value={hebrewPaletteText}
                    dir="rtl"
                    style={{ fontFamily: 'Noto Rashi Hebrew Regular' }}
                  />
                </div>

                <div className="space-y-2 rounded-xl bg-slate-200 p-3 select-none">
                  {hebrewKeyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1.5">
                      {row.map((key, keyIndex) => {
                        const char =
                          typeof key === 'object'
                            ? isShifted
                              ? key.shifted
                              : key.unshifted
                            : key;

                        return (
                          <button
                            key={keyIndex}
                            onClick={() => {
                              setHebrewPaletteText((prev) => prev + char);
                              setIsShifted(false);
                            }}
                            className="flex h-12 flex-1 items-center justify-center rounded-lg bg-white text-xl font-semibold text-slate-800 shadow-sm transition-colors hover:bg-blue-100"
                            type="button"
                          >
                            {char}
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={() => setIsShifted((prev) => !prev)}
                      className={`flex h-12 w-24 items-center justify-center rounded-lg text-lg font-semibold text-slate-800 shadow-sm transition-colors ${
                        isShifted
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-blue-100'
                      }`}
                      type="button"
                    >
                      Shift
                    </button>
                    <button
                      onClick={() =>
                        setHebrewPaletteText((prev) => prev + ' ')
                      }
                      className="flex h-12 flex-1 items-center justify-center rounded-lg bg-white text-xl font-semibold text-slate-800 shadow-sm transition-colors hover:bg-blue-100"
                      type="button"
                    >
                      Space
                    </button>
                    <button
                      onClick={handleHebrewBackspace}
                      className="flex h-12 w-24 items-center justify-center rounded-lg bg-white text-lg font-semibold text-slate-800 shadow-sm transition-colors hover:bg-blue-100"
                      type="button"
                    >
                      Backspace
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    onClick={() => {
                      setShowHebrewPalette(false);
                      setIsShifted(false);
                      setHebrewPaletteText('');
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-xl bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                    onClick={handleInsertToMain}
                  >
                    Insert Text
                  </button>
                </div>
              </div>
            )}

            {showAccentPalette && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Accented Character Palette
                </h3>

                <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-lg bg-slate-50 p-4">
                  {Object.entries(accentedCharacters).map(
                    ([baseLetter, chars]) => (
                      <div key={baseLetter} className="flex items-start gap-4">
                        <div className="w-8 pt-2 text-center text-lg font-bold text-slate-600">
                          {baseLetter}
                        </div>
                        <div className="flex flex-1 flex-wrap gap-2">
                          {chars.map((char) => (
                            <button
                              key={char}
                              onClick={() => handleGlyphInsert(char)}
                              className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl text-slate-700 shadow-sm transition-colors hover:bg-blue-100 hover:text-blue-700"
                              title={`Insert ${char}`}
                              type="button"
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="pr-4 text-sm text-slate-600">
                    Note: Character support varies by font. Please confirm the
                    appearance in the live preview.
                  </p>
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    onClick={() => setShowAccentPalette(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {showGlyphPalette && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Symbol Palette
                </h3>

                <div className="grid grid-cols-6 gap-2 rounded-lg bg-slate-100 p-4 sm:grid-cols-8 md:grid-cols-12">
                  {glyphs.map((glyph) => (
                    <button
                      key={glyph}
                      onClick={() => handleGlyphInsert(glyph)}
                      className="flex h-12 w-full items-center justify-center rounded-lg bg-white text-2xl text-slate-700 shadow-sm transition-colors hover:bg-blue-100 hover:text-blue-700"
                      title={`Insert ${glyph}`}
                      type="button"
                    >
                      {glyph}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="pr-4 text-sm text-slate-600">
                    Note: Character support varies by font. Please confirm the
                    appearance in the live preview.
                  </p>
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    onClick={() => setShowGlyphPalette(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {showCustomerModal && (
              <form onSubmit={handleCustomerModalSubmit} className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">
                  Enter Customer Information to Save
                </h3>

                <FormInput
                  label="Order Number"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  disabled={isDataPrefilled || isSubmitting}
                />
                <FormInput
                  label="Customer Name"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={isDataPrefilled || isSubmitting}
                />
                <FormInput
                  label="Customer Company"
                  id="customerCompany"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  isOptional
                  disabled={isDataPrefilled || isSubmitting}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    className="rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    onClick={() => setShowCustomerModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-75"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit & Save'}
                  </button>
                </div>
              </form>
            )}

            {showMessageBox && (
              <div className="text-center">
                <p className="mb-8 text-lg text-slate-800">{message}</p>
                <button
                  onClick={() => setShowMessageBox(false)}
                  className="rounded-xl bg-blue-600 px-12 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  type="button"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMonogramMaker && (
        <MonogramMaker
          fontLibrary={fontLibrary}
          onClose={() => setShowMonogramMaker(false)}
          onInsert={(info) => {
            setMonogramInfo(info);
            setShowMonogramMaker(false);
          }}
        />
      )}
    </div>
  );
};

export default App;