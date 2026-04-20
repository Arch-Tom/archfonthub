import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import MonogramMaker from './MonogramMaker';
import LivePreviewSection from './components/LivePreviewSection';
import {
  fontLibrary,
  scriptFontsToAdjust,
  styleSortOrder,
} from './constants/fontConfig';

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

const hebrewCharacters = [
  'א',
  'ב',
  'ג',
  'ד',
  'ה',
  'ו',
  'ז',
  'ח',
  'ט',
  'י',
  'כ',
  'ך',
  'ל',
  'מ',
  'ם',
  'נ',
  'ן',
  'ס',
  'ע',
  'פ',
  'ף',
  'צ',
  'ץ',
  'ק',
  'ר',
  'ש',
  'ת',
];

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
  ['ש', 'д', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ','],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ', '.'],
];

const hebrewRegex = /[\u0590-\u05FF]/;

const App = () => {
  const WORKER_URL =
    'https://customerfontselection-worker.tom-4a9.workers.dev';
  const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

  const [selectedFonts, setSelectedFonts] = useState([]);
  const [customText, setCustomText] = useState('');
  const [lineSettings, setLineSettings] = useState([]);
  const [selectedPreviewLineIndex, setSelectedPreviewLineIndex] =
    useState(null);
  const [fontSize, setFontSize] = useState(36);
  const [lineSpacing, setLineSpacing] = useState(1.4);
  const [textAlign, setTextAlign] = useState('left');

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

  const getSortedStyleKeys = useCallback(
    (styles) =>
      Object.keys(styles || {}).sort((a, b) => {
        const indexA = styleSortOrder.indexOf(a.toLowerCase());
        const indexB = styleSortOrder.indexOf(b.toLowerCase());

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      }),
    []
  );

  const getFontOptionByName = useCallback(
    (fontName, fonts = selectedFonts) =>
      fonts.find((font) => font.name === fontName),
    [selectedFonts]
  );

  const getDefaultStyleKey = useCallback(
    (fontName, fonts = selectedFonts) => {
      const font = fonts.find((fontOption) => fontOption.name === fontName);
      if (!font) return '';

      const sortedStyleKeys = getSortedStyleKeys(font.styles);
      if (font.activeStyle && sortedStyleKeys.includes(font.activeStyle)) {
        return font.activeStyle;
      }

      return sortedStyleKeys[0] || '';
    },
    [getSortedStyleKeys, selectedFonts]
  );

  const normalizeFontSizeOverride = (value) => {
    if (value == null || value === '') return null;

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) return null;

    return Math.max(12, Math.round(parsedValue));
  };

  const normalizeLineSelection = useCallback(
    (line, fonts = selectedFonts) => {
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
    [getDefaultStyleKey, getFontOptionByName, selectedFonts]
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
        ...normalizeLineSelection(
          lineSettings[index] || {
            fontName: '',
            styleKey: '',
            fontSizeOverride: null,
          }
        ),
      })),
    [derivedTextLines, lineSettings, normalizeLineSelection]
  );

  const populatedPreviewLines = useMemo(
    () => previewLines.filter((line) => line.text.trim() !== ''),
    [previewLines]
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
        normalizeLineSelection(
          prevSettings[index] || {
            fontName: '',
            styleKey: '',
            fontSizeOverride: null,
          },
          selectedFonts
        )
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
  }, [derivedTextLines, normalizeLineSelection, selectedFonts]);

  useEffect(() => {
    if (previewLines.length === 0) {
      if (selectedPreviewLineIndex !== null) {
        setSelectedPreviewLineIndex(null);
      }
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

  const handleFontSelect = (font) => {
    const isSelected = selectedFonts.some((f) => f.name === font.name);

    if (isSelected) {
      setSelectedFonts((prev) => prev.filter((f) => f.name !== font.name));
      return;
    }

    if (selectedFonts.length < 3) {
      const defaultStyleKey = getDefaultStyleKey(font.name, [
        ...selectedFonts,
        font,
      ]);
      setSelectedFonts((prev) => [
        ...prev,
        { ...font, activeStyle: defaultStyleKey || Object.keys(font.styles)[0] },
      ]);
      return;
    }

    showMessage(
      'You may select a maximum of 3 fonts. Please deselect a font to choose a new one.'
    );
  };

  const handleTextChange = (e) => setCustomText(e.target.value);
  const handleFontSizeChange = (e) => setFontSize(Number(e.target.value));
  const handleLineSpacingChange = (e) => setLineSpacing(Number(e.target.value));

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

  const generateSvgContent = () => {
    const hasStandardSelection =
      selectedFonts.length > 0 && populatedPreviewLines.length > 0;

    if (!monogramInfo && !hasStandardSelection) {
      showMessage(
        'Please create a monogram, or select at least one font and enter some text to submit.'
      );
      return null;
    }

    let svgElements = '';
    const labelFontSize = 16;
    const padding = 20;
    const svgWidth = 800;
    let y = padding;

    const aligned =
      textAlign === 'center'
        ? { x: svgWidth / 2, anchor: 'middle' }
        : textAlign === 'right'
        ? { x: svgWidth - padding, anchor: 'end' }
        : { x: padding, anchor: 'start' };

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
        const [first, middle, last] = data.text.map(escapeXml);
        const frameStyle = data.frameStyle;
        const textColor =
          frameStyle === 'solid' || frameStyle === 'double' ? 'white' : 'black';
        const baseFontSize = (data.fontSize || 100) * 1.5;
        const finalFontSize = baseFontSize * 0.9875;

        let frameSvg = '';
        if (frameStyle === 'solid') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />`;
        } else if (frameStyle === 'double') {
          frameSvg = `<g>
            <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="black" />
            <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="59" fill="none" stroke="white" stroke-width="3" />
          </g>`;
        } else if (frameStyle === 'dotted') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="4" stroke-dasharray="10 10" />`;
        } else if (frameStyle === 'outline') {
          frameSvg = `<circle cx="${svgCenterX}" cy="${monogramBlockY}" r="64" fill="none" stroke="black" stroke-width="2" />`;
        } else if (frameStyle === 'thick-thin') {
          frameSvg = `<g>
            <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="65" fill="none" stroke="black" stroke-width="5" />
            <circle cx="${svgCenterX}" cy="${monogramBlockY}" r="57" fill="none" stroke="black" stroke-width="2" />
          </g>`;
        }

        const textSvg = `<text x="${svgCenterX}" y="${monogramBlockY}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" style="font-size: ${finalFontSize}px;">
          <tspan font-family="LeftCircleMonogram">${first}</tspan>
          <tspan font-family="MiddleCircleMonogram" dy="-0.02em">${middle}</tspan>
          <tspan font-family="RightCircleMonogram">${last}</tspan>
        </text>`;

        svgElements += frameSvg + textSvg;
        y = monogramBlockY + 100;
      } else {
        const [first, middle, last] = data.text.map(escapeXml);
        const monogramFontFamily = data.font.styles[data.style];
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

        svgElements += `<g dominant-baseline="middle" text-anchor="middle" font-family="${monogramFontFamily}" fill="#181717">
          <text x="${leftX}" y="${monogramBlockY}" font-size="${sideSize}px">${first}</text>
          <text x="${middleX}" y="${monogramBlockY}" font-size="${middleSize}px">${middle}</text>
          <text x="${rightX}" y="${monogramBlockY}" font-size="${sideSize}px">${last}</text>
        </g>`;

        y = monogramBlockY + middleSize / 2;
      }
    }

    let contentY = y + 40;

    if (hasStandardSelection) {
      populatedPreviewLines.forEach((line) => {
        const font = getFontOptionByName(line.fontName);
        const fallbackStyleKey = getDefaultStyleKey(line.fontName);
        const activeFontFamily =
          font?.styles?.[line.styleKey] ||
          font?.styles?.[fallbackStyleKey] ||
          'inherit';
        const effectiveFontSize = line.fontSizeOverride ?? fontSize;

        contentY += effectiveFontSize * lineSpacing;
        svgElements += `<text x="${aligned.x}" y="${contentY}" text-anchor="${
          aligned.anchor
        }" font-family="${activeFontFamily}" font-size="${effectiveFontSize}" fill="#181717">${escapeXml(
          line.text
        )}</text>\n`;
      });
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

    const svgHeight = contentY + padding;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" style="background-color: #FFF;">\n${svgElements}</svg>`;
  };

  const handleSubmitClick = () => {
    const svgContent = generateSvgContent();
    if (!svgContent) return;

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

    const filename =
      [
        formatForFilename(orderNumber),
        formatForFilename(customerName),
        customerCompany.trim() ? formatForFilename(customerCompany) : '',
      ]
        .filter(Boolean)
        .join('_') + '.svg';

    try {
      const response = await fetch(`${WORKER_URL}/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/svg+xml' },
        body: svgContent,
      });

      if (response.status === 409) {
        throw new Error('A submission for this order already exists.');
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

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

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans lg:flex-row">
      <aside className="flex w-full flex-shrink-0 flex-col bg-[rgb(50,75,106)] p-4 text-white shadow-xl lg:w-[400px] lg:justify-start lg:rounded-r-3xl">
        <div className="flex-shrink-0 pt-4 lg:pt-8">
          <img
            src="/images/Arch Vector Logo White.svg"
            alt="Arch Font Hub Logo"
            className="mx-auto h-48 w-48 object-contain drop-shadow-lg lg:h-auto lg:w-[350px]"
          />
        </div>
        <div className="flex flex-grow items-center justify-center lg:mt-4 lg:flex-grow-0 lg:items-start">
          <p className="px-2 text-center text-xs text-slate-200 lg:max-w-sm lg:text-left lg:text-base">
            Let&apos;s find your perfect font! Select a few options, preview them
            with your text, and submit your favorites. Our designers will use
            your selection to craft your proof. If you have another font in
            mind, let us know in the notes section below!
          </p>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 lg:p-12">
        {isSubmissionComplete && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-100 bg-opacity-95">
            <div className="p-8 text-center">
              <h2
                className="text-4xl font-bold text-slate-700"
                style={{ fontFamily: 'Alumni Sans Regular' }}
              >
                Submission Complete
              </h2>
              <p className="mt-4 text-xl text-slate-600">
                Thank you for your submission! You may now close this window.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl">
          <div className="space-y-10">
            <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
              <h2
                className="mb-2 text-3xl font-bold tracking-normal text-slate-900"
                style={{ fontFamily: 'Alumni Sans Regular' }}
              >
                Font Selection
              </h2>
              <p className="mb-6 text-slate-500">
                Select up to 3 fonts you would like to preview. You may change
                your selected fonts here at any time. Try as many as you&apos;d
                like before submitting your selection!
                <br />
                <br />
                Looking for Bold, Italic or other versions of a selected font?
                Check the live preview for available styles!
              </p>

              <div className="space-y-6">
                {Object.entries(fontLibrary).map(([category, fonts]) => (
                  <div key={category}>
                    <h3 className="mb-3 border-b-2 border-slate-200 pb-2 text-md font-semibold tracking-wide text-slate-700">
                      {category}
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {fonts.map((font) => {
                        const isScriptFont = scriptFontsToAdjust.includes(
                          font.name
                        );
                        let fontSizeClass = isScriptFont ? 'text-2xl' : 'text-lg';

                        if (font.name === 'Concerto Pro') {
                          fontSizeClass = 'text-4xl';
                        }

                        const isSelected = selectedFonts.some(
                          (f) => f.name === font.name
                        );

                        return (
                          <button
                            key={font.name}
                            onClick={() => handleFontSelect(font)}
                            className={`rounded-xl border-2 px-5 py-3 font-semibold transition-all duration-150 hover:scale-105 focus:outline-none ${fontSizeClass} ${
                              isSelected
                                ? 'border-[rgb(50,75,106)] bg-[rgb(50,75,106)] text-white shadow-md'
                                : 'border-[rgb(50,75,106)] bg-white text-[rgb(50,75,106)] hover:bg-[rgb(50,75,106)]/10'
                            }`}
                            style={{
                              fontFamily:
                                font.name === 'Alumni Sans'
                                  ? 'Alumni Sans Regular'
                                  : font.styles[getSortedStyleKeys(font.styles)[0]],
                            }}
                            type="button"
                          >
                            {font.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 flex justify-end">
              <button
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow hover:bg-blue-700"
                onClick={() => setShowMonogramMaker(true)}
                type="button"
              >
                Open Monogram Maker
              </button>
            </div>

            <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
              <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2
                    className="text-3xl font-bold tracking-normal text-slate-900"
                    style={{ fontFamily: 'Alumni Sans Regular' }}
                  >
                    Custom Text
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Type a sample of your order text to preview. You&apos;ll see
                    this displayed in your font choices below.
                    <br />
                    Be sure to test out any special characters your order may
                    have!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <button
                    onClick={() => setShowHebrewPalette(true)}
                    className="rounded-xl bg-slate-200 px-5 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    type="button"
                  >
                    Hebrew
                  </button>
                  <button
                    onClick={() => setShowAccentPalette(true)}
                    className="rounded-xl bg-slate-200 px-5 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    type="button"
                  >
                    Accented Characters
                  </button>
                  <button
                    onClick={() => setShowGlyphPalette(true)}
                    className="rounded-xl bg-slate-200 px-5 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-300"
                    type="button"
                  >
                    Symbols
                  </button>
                </div>
              </div>

              <textarea
                ref={textInputRef}
                className="min-h-[120px] w-full rounded-xl border-2 border-slate-200 p-5 text-xl shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={customText}
                onChange={handleTextChange}
                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                dir="auto"
              />
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
              onFontSizeChange={handleFontSizeChange}
              onLineSelect={setSelectedPreviewLineIndex}
              onLineSpacingChange={handleLineSpacingChange}
              onTextAlignChange={setTextAlign}
              previewLines={previewLines}
              selectedPreviewLineIndex={selectedPreviewLineIndex}
              textAlign={textAlign}
            />

            <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_10px_25px_-5px_rgba(50,75,106,0.2),_0_8px_10px_-6px_rgba(59,130,246,0.2)]">
              <h2
                className="mb-2 text-3xl font-bold tracking-normal text-slate-900"
                style={{ fontFamily: 'Alumni Sans Regular' }}
              >
                Notes for Designer
              </h2>
              <p className="mb-6 text-slate-500">
                Have a specific font in mind not listed above? Or any other
                special requests? Let us know here!
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-xl border-2 border-slate-200 p-5 text-xl shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g., Please use the font 'Gotham' if available. Also, make the first line larger than the second..."
              />
            </section>
          </div>

          <div className="mt-10">
            <button
              onClick={handleSubmitClick}
              className="w-full rounded-2xl bg-blue-600 px-10 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isSubmitting ||
                (!monogramInfo &&
                  (selectedFonts.length === 0 || customText.trim() === ''))
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Selection'}
            </button>
          </div>
        </div>
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