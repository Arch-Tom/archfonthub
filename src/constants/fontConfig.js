const scriptFontsToAdjust = [
    'Alumni Sans', 'Amazone', 'BlackChancery', 'Clicker Script',
    'Collegiate', 'Concerto Pro', 'Courgette', 'Cowboy Rodeo',
    'Cutive Mono', 'Freebooter Script', 'French Script', 'Great Vibes',
    'Honey Script', 'I Love Glitter', 'Machine BT', 'Monotype Corsiva', 'Murray Hill',
    'Old English', 'Planscribe', 'Rajdhani', 'ITC Zapf Chancery'
];

const fontLibrary = {
    'Sans-serif': [
        {
            name: 'Alumni Sans', styles: {
                black: 'Alumni Sans Black', bold: 'Alumni Sans Bold', extrabold: 'Alumni Sans ExtraBold',
                italic: 'Alumni Sans Italic', light: 'Alumni Sans Light', lightItalic: 'Alumni Sans Light Italic',
                medium: 'Alumni Sans Medium', mediumItalic: 'Alumni Sans Medium Italic', regular: 'Alumni Sans Regular',
                semibold: 'Alumni Sans SemiBold', semiboldItalic: 'Alumni Sans SemiBold Italic'
            }
        },
        { name: 'Arial', styles: { regular: 'Arial', bold: 'Arial Bold', italic: 'Arial Italic', boldItalic: 'Arial Bold Italic' } },
        { name: 'Bebas Neue', styles: { regular: 'Bebas Neue Regular', bold: 'Bebas Neue Bold' } },
        { name: 'Berlin Sans', styles: { regular: 'Berlin Sans FB', bold: 'Berlin Sans FB Bold' } },
        { name: 'Calibri', styles: { regular: 'Calibri', bold: 'Calibri Bold', italic: 'Calibri Italic' } },
        { name: 'Century Gothic', styles: { regular: 'Century Gothic Paneuropean', bold: 'Century Gothic Paneuropean Bold', boldItalic: 'Century Gothic Paneuropean Bold Italic' } },
        { name: 'Graphik', styles: { regular: 'Graphik', medium: 'Graphik Medium', semibold: 'Graphik Semibold', thin: 'Graphik Thin', regularItalic: 'Graphik Regular Italic', mediumItalic: 'Graphik Medium Italic', thinItalic: 'Graphik Thin Italic' } },
        { name: 'Montserrat', styles: { regular: 'Montserrat Regular', bold: 'Montserrat Bold', italic: 'Montserrat Italic', boldItalic: 'Montserrat Bold Italic' } },
        { name: 'Optima', styles: { regular: 'Optima', bold: 'Optima Bold' } },
        { name: 'Rajdhani', styles: { regular: 'Rajdhani Regular', light: 'Rajdhani Light', medium: 'Rajdhani Medium', semibold: 'Rajdhani SemiBold', bold: 'Rajdhani Bold' } },
    ],
    'Serif': [
        { name: 'Benguiat', styles: { regular: 'Benguiat', bold: 'Benguiat Bold BT', bookItalic: 'Benguiat Book Italic BT' } },
        { name: 'Bookman Old Style', styles: { bold: 'Bookman Old Style Bold', italic: 'Bookman Old Style Italic', boldItalic: 'Bookman Old Style Bold Italic' } },
        { name: 'Century Schoolbook', styles: { regular: 'Century Schoolbook', bold: 'Century Schoolbook Bold', boldItalic: 'Century Schoolbook Bold Italic' } },
        { name: 'Copperplate', styles: { regular: 'CopprplGoth BT Roman' } },
        { name: 'Cutive Mono', styles: { regular: 'Cutive Mono Regular' } },
        { name: 'DejaVu Serif', styles: { regular: 'DejaVu Serif', bold: 'DejaVu Serif Bold', italic: 'DejaVu Serif Italic', boldItalic: 'DejaVu Serif Bold Italic', condensed: 'DejaVu Serif Condensed', condensedBold: 'DejaVu Serif Condensed Bold', condensedItalic: 'DejaVu Serif Condensed Italic', condensedBoldItalic: 'DejaVu Serif Condensed Bold Italic' } },
        { name: 'Garamond', styles: { regular: 'EB Garamond Regular', bold: 'EB Garamond Bold', italic: 'EB Garamond Italic', boldItalic: 'EB Garamond Bold Italic' } },
        { name: 'Noto Rashi Hebrew', styles: { regular: 'Noto Rashi Hebrew Regular', thin: 'Noto Rashi Hebrew Thin', extralight: 'Noto Rashi Hebrew ExtraLight', light: 'Noto Rashi Hebrew Light', medium: 'Noto Rashi Hebrew Medium', semibold: 'Noto Rashi Hebrew SemiBold', bold: 'Noto Rashi Hebrew Bold', extrabold: 'Noto Rashi Hebrew ExtraBold', black: 'Noto Rashi Hebrew Black' } },
        { name: 'Times New Roman', styles: { regular: 'Times New Roman', bold: 'Times New Roman Bold', italic: 'Times New Roman Italic', boldItalic: 'Times New Roman Bold Italic' } },
    ],
    'Script': [
        { name: 'Amazone', styles: { regular: 'Amazone BT' } },
        { name: 'BlackChancery', styles: { regular: 'BlackChancery' } },
        { name: 'Clicker Script', styles: { regular: 'Clicker Script' } },
        { name: 'Concerto Pro', styles: { regular: 'ConcertoPro-Regular' } },
        { name: 'Courgette', styles: { regular: 'Courgette Regular' } },
        { name: 'Freebooter Script', styles: { regular: 'Freebooter Script' } },
        { name: 'French Script', styles: { regular: 'French Script MT' } },
        { name: 'Great Vibes', styles: { regular: 'Great Vibes' } },
        { name: 'Honey Script', styles: { light: 'Honey Script Light', semiBold: 'Honey Script SemiBold' } },
        { name: 'I Love Glitter', styles: { regular: 'I Love Glitter' } },
        { name: 'ITC Zapf Chancery', styles: { regular: 'ITC Zapf Chancery Roman' } },
        { name: 'Murray Hill', styles: { regular: 'Murray Hill Regular' } },
        { name: 'Monotype Corsiva', styles: { regular: 'Monotype Corsiva' } },
    ],
    'Display': [
        { name: 'Collegiate', styles: { black: 'CollegiateBlackFLF', outline: 'CollegiateOutlineFLF' } },
        { name: 'Cowboy Rodeo', styles: { regular: 'Cowboy Rodeo W01 Regular' } },
        { name: 'Machine BT', styles: { regular: 'Machine BT' } },
        { name: 'Old English', styles: { regular: 'Old English Text MT' } },
        { name: 'Planscribe', styles: { regular: 'Planscribe NF W01 Regular' } },
    ],
};

const styleSortOrder = [
    'thin', 'thinItalic',
    'extralight', 'extralightItalic',
    'light', 'lightItalic',
    'regular', 'italic', 'book', 'bookItalic', 'roman',
    'medium', 'mediumItalic',
    'semibold', 'demi', 'semiboldItalic',
    'bold', 'boldItalic',
    'extrabold', 'extraboldItalic',
    'black', 'blackItalic',
    'outline', 'condensed', 'condensedBold', 'condensedItalic', 'condensedBoldItalic'
];

const exportFontFamilyMap = {
    'Arial': 'ArialMT',
    'Arial Bold': 'Arial-BoldMT',
    'Arial Italic': 'Arial-ItalicMT',
    'Arial Bold Italic': 'Arial-BoldItalicMT',
    'Berlin Sans FB': 'BerlinSansFB-Reg',
    'Berlin Sans FB Bold': 'BerlinSansFB-Bold',
    'CopprplGoth BT Roman': 'CopperplateGothicBT-Roman',
    'Cowboy Rodeo W01 Regular': 'CowboyRodeoW01-Regular',
    'Graphik Medium Italic': 'Graphik-MediumItalic',
    'Graphik Thin Italic': 'Graphik-ThinItalic',
    'ITC Zapf Chancery Roman': 'ZapfChancery-Roman',
    'Machine BT': 'MachineITCbyBT-Regular',
    'Noto Rashi Hebrew Black': 'NotoRashiHebrew-Black',
    'Noto Rashi Hebrew ExtraBold': 'NotoRashiHebrew-ExtraBold',
    'Planscribe NF W01 Regular': 'PlanscribeNFW01-Regular',
    'Times New Roman': 'TimesNewRomanPSMT',
    'Times New Roman Bold': 'TimesNewRomanPS-BoldMT',
    'Times New Roman Italic': 'TimesNewRomanPS-ItalicMT',
    'Times New Roman Bold Italic': 'TimesNewRomanPS-BoldItalicMT',
};

export {
    scriptFontsToAdjust,
    fontLibrary,
    styleSortOrder,
    exportFontFamilyMap,
};
