import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js/dist/html2pdf.min';

// Define a constant for the default text
const DEFAULT_TEXT_PLACEHOLDER = 'Type your text here...';

// Main App Component
const App = () => {
    // Pre-defined list of fonts, now including Benguiat, Copperplate Gothic, and I Love Glitter
    const categorizedFonts = {
        'Sans-serif': [
            'Arial',
            'Calibri',
            'Century Gothic',
        ],
        'Serif': [
            'Benguiat',
            'Copperplate Gothic',
            'Garamond',
            'Times New Roman'
        ],
        'Script': [
            'I Love Glitter'
        ],
        'Display': [
            'Tinplate Titling Black'
        ],
        'Monospace': [
            'Zapf Humanist'
        ]
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState(DEFAULT_TEXT_PLACEHOLDER);
    const [savedOutput, setSavedOutput] = useState([]);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const previewSectionRef = useRef(null);

    const customFontsCssContent = `
    @font-face {
      font-family: 'Benguiat';
      src: url('/fonts/Benguiat.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Copperplate Gothic';
      src: url('/fonts/Copperplate%20Gothic.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'I Love Glitter';
      src: url('/fonts/I%20Love%20Glitter.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Arial';
      src: url('/fonts/arial.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Calibri';
      src: url('/fonts/CALIBRI.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Century Gothic';
      src: url('/fonts/CenturyGothicPaneuropeanRegular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Garamond';
      src: url('/fonts/GARA.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Times New Roman';
      src: url('/fonts/TIMES.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Tinplate Titling Black';
      src: url('/fonts/Tinplate%20Titling%20Black.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Zapf Humanist';
      src: url('/fonts/ZHUM601D.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = customFontsCssContent;
        document.head.appendChild(styleElement);
    }, []);

    const handleFontSelect = (font) => {
        if (selectedFonts.includes(font)) {
            setSelectedFonts(selectedFonts.filter((f) => f !== font));
        } else {
            if (selectedFonts.length < 3) {
                setSelectedFonts([...selectedFonts, font]);
            } else {
                showMessage('You can select a maximum of 3 fonts.');
            }
        }
    };

    const handleTextChange = (e) => {
        setCustomText(e.target.value);
    };

    const handleFocus = () => {
        if (customText === DEFAULT_TEXT_PLACEHOLDER) {
            setCustomText('');
        }
    };

    const handleBlur = () => {
        if (customText.trim() === '') {
            setCustomText(DEFAULT_TEXT_PLACEHOLDER);
        }
    };

    const handleSavePdf = () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select fonts and enter text to generate PDF.');
            return;
        }

        const previewElement = previewSectionRef.current;
        if (!previewElement) {
            showMessage('Could not find preview section to save.');
            return;
        }

        const headingElement = previewElement.querySelector('.section-title');
        if (headingElement) {
            headingElement.style.display = 'none';
        }

        const options = {
            margin: 10,
            filename: 'ArchFontHub_Preview.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(previewElement).save().finally(() => {
            if (headingElement) {
                headingElement.style.display = '';
            }
        });

        showMessage('Generating PDF...');
    };

    // SVG Export Handler
    const handleSaveSvg = async () => {
        if (selectedFonts.length === 0 || customText.trim() === '' || customText === DEFAULT_TEXT_PLACEHOLDER) {
            showMessage('Please select fonts and enter text to generate SVG.');
            return;
        }

        // Split text into lines if needed
        const lines = customText.split('\n');
        const lineHeight = 40; // px, adjust as needed
        const fontSize = 32; // px, adjust as needed
        const padding = 20;
        const svgWidth = 800;
        const svgHeight = selectedFonts.length * lines.length * lineHeight + padding * 2;

        // Build SVG content
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">\n`;

        let y = padding + fontSize;
        selectedFonts.forEach((font) => {
            lines.forEach((line, idx) => {
                if (line.trim() !== '') {
                    svgContent += `<text x="${padding}" y="${y}" font-family="${font}" font-size="${fontSize}" fill="#181717">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
                    y += lineHeight;
                }
            });
            y += lineHeight / 2; // Extra space between font groups
        });

        svgContent += '</svg>';

        // Save locally
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ArchFontHub_Preview.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Upload to Cloudflare Worker
        try {
            const response = await fetch('arch-worker.tom-4a9.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'image/svg+xml'
                    // Add authentication headers here if needed
                },
                body: svgContent
            });

            if (response.ok) {
                showMessage('SVG file generated and uploaded!');
            } else {
                showMessage('SVG saved, but upload failed.');
            }
        } catch (error) {
            showMessage('SVG saved, but upload failed.');
        }
    }; // <--- Make sure this closes the function

    // ... rest of your component

    export default App; // <--- Make sure this is at the end