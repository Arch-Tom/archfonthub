export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Handle CORS preflight requests for the POST endpoint
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// Route requests based on the pathname
		switch (url.pathname) {
			case '/generate-proof':
				if (request.method === 'POST') {
					return handleGenerateProof(request, env);
				}
				return new Response('Method not allowed', { status: 405 });

			case '/list':
				if (request.method === 'GET') {
					return handleListFiles(request, env);
				}
				return new Response('Method not allowed', { status: 405 });

			default:
				// Assume any other GET request is for a file
				if (request.method === 'GET' && url.pathname.length > 1) {
					return handleGetFile(request, env);
				}
				return new Response('Endpoint not found', { status: 404 });
		}
	},
};

/**
 * Handles the main logic for generating an SVG proof with embedded fonts.
 */
async function handleGenerateProof(request, env) {
	try {
		const proofData = await request.json();
		const { customText, fontSize, selectedFonts, filename } = proofData;

		if (!selectedFonts || selectedFonts.length === 0 || !customText) {
			return new Response('Missing required data: selectedFonts and customText are required.', { status: 400 });
		}

		// Generate the SVG with embedded fonts
		const finalSvg = await createSvgWithEmbeddedFonts(proofData, env);

		// Save the generated SVG to R2
		await env.ARCH_FONT_UPLOADS.put(filename, finalSvg, {
			httpMetadata: { contentType: 'image/svg+xml' },
		});

		// Return the SVG as a downloadable file
		return new Response(finalSvg, {
			headers: {
				...corsHeaders,
				'Content-Type': 'image/svg+xml',
				'Content-Disposition': `attachment; filename="${filename}"`
			},
		});

	} catch (error) {
		console.error('Error generating proof:', error);
		return new Response(`Error generating proof: ${error.message}`, { status: 500, headers: corsHeaders });
	}
}

/**
 * Lists all files in the R2 bucket.
 */
async function handleListFiles(request, env) {
	const list = await env.ARCH_FONT_UPLOADS.list();
	const fileNames = list.objects.map(obj => obj.key);
	return new Response(JSON.stringify(fileNames, null, 2), {
		headers: { 'Content-Type': 'application/json', ...corsHeaders },
	});
}

/**
 * Retrieves a single file from the R2 bucket.
 */
async function handleGetFile(request, env) {
	const { pathname } = new URL(request.url);
	const key = pathname.slice(1); // remove leading slash

	const object = await env.ARCH_FONT_UPLOADS.get(key);
	if (!object) {
		return new Response('File not found', { status: 404 });
	}
	return new Response(object.body, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
			...corsHeaders
		},
	});
}


/**
 * Creates the SVG string with Base64-encoded fonts embedded in it.
 */
async function createSvgWithEmbeddedFonts(data, env) {
	const { customText, fontSize, selectedFonts } = data;

	const fontFaceDeclarations = [];
	const collectedFonts = new Map(); // Use a map to avoid duplicate font fetching

	// Collect all unique font styles that need to be fetched
	for (const font of selectedFonts) {
		const postscriptName = font.styles[font.activeStyle];
		if (postscriptName && !collectedFonts.has(postscriptName)) {
			const filename = FONT_MAP[postscriptName];
			if (filename) {
				collectedFonts.set(postscriptName, filename);
			}
		}
	}

	// Fetch and encode each unique font
	for (const [postscriptName, filename] of collectedFonts.entries()) {
		const fontObject = await env.ARCH_FONT_UPLOADS.get(`fonts/${filename}`);
		if (fontObject) {
			const fontBuffer = await fontObject.arrayBuffer();
			const base64Font = arrayBufferToBase64(fontBuffer);
			const format = filename.endsWith('.otf') ? 'opentype' : 'truetype';

			fontFaceDeclarations.push(`
                @font-face {
                    font-family: "${postscriptName}";
                    src: url(data:font/${format};base64,${base64Font});
                }
            `);
		}
	}

	// Build the SVG text elements
	let svgTextElements = '';
	const lines = customText.split('\n').filter(line => line.trim() !== '');
	const lineHeight = fontSize * 1.4;
	const labelFontSize = 16;
	const padding = 20;
	let y = padding;

	selectedFonts.forEach((font, fontIndex) => {
		const activeFontFamily = font.styles[font.activeStyle];
		const styleName = font.activeStyle.charAt(0).toUpperCase() + font.activeStyle.slice(1);

		y += labelFontSize + 10;
		svgTextElements += `<text x="${padding}" y="${y}" font-family="Arial" font-size="${labelFontSize}" fill="#6b7280" font-weight="600">${font.name} (${styleName})</text>\n`;
		y += lineHeight * 0.5;

		lines.forEach((line) => {
			const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			y += lineHeight;
			svgTextElements += `<text x="${padding}" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#181717">${sanitizedLine}</text>\n`;
		});

		if (fontIndex < selectedFonts.length - 1) {
			y += lineHeight * 0.75;
		}
	});

	const svgWidth = 800;
	const svgHeight = y + padding;

	// Assemble the final SVG string
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
        <defs>
            <style type="text/css">
                <![CDATA[
                    ${fontFaceDeclarations.join('\n')}
                ]]>
            </style>
        </defs>
        <rect width="100%" height="100%" fill="#FFF"/>
        ${svgTextElements}
    </svg>`;
}

// --- UTILITIES ---

function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions(request) {
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		// Handle CORS preflight requests.
		return new Response(null, { headers: corsHeaders });
	} else {
		// Handle standard OPTIONS requests.
		return new Response(null, {
			headers: { Allow: 'GET, POST, OPTIONS' },
		});
	}
}

// This map connects the PostScript name (used in SVGs) to the actual font filename in R2.
// This is the critical piece that solves the font name mismatch problem.
const FONT_MAP = {
	'ArialMT': 'arial.ttf',
	'Arial-BoldMT': 'arialbd.ttf',
	'Arial-ItalicMT': 'ariali.ttf',
	'Arial-BoldItalicMT': 'arialbi.ttf',
	'Calibri': 'CALIBRI.TTF',
	'Calibri-Bold': 'CALIBRIB_0.TTF',
	'Calibri-Italic': 'CALIBRII.TTF',
	'Calibri-BoldItalic': 'CALIBRIZ.TTF', // Assuming a filename for Bold Italic
	'CenturyGothic': 'CenturyGothicPaneuropeanRegular.ttf',
	'CenturyGothic-Bold': 'CenturyGothicPaneuropeanBold.ttf',
	'CenturyGothic-Italic': 'CenturyGothicPaneuropeanItalic.ttf', // Assuming filename
	'CenturyGothic-BoldItalic': 'CenturyGothicPaneuropeanBoldItalic.ttf',
	'BerlinSansFB': 'BRLNSR.TTF',
	'BerlinSansFB-Bold': 'BRLNSB.TTF',
	'BebasNeue': 'Bebas Neue Regular 400.ttf',
	'BebasNeue-Bold': 'BebasNeue-Bold.otf',
	'ZapfHumanist': 'ZHUM601D.TTF', // Note: your library has two Zapf, this one is likely the Demi
	'ZapfHumanist601BT-Demi': 'ZHUM601D.TTF',
	'TimesNewRomanPSMT': 'TIMES.TTF',
	'TimesNewRomanPS-BoldMT': 'timesbd.ttf',
	'TimesNewRomanPS-ItalicMT': 'timesi.ttf',
	'TimesNewRomanPS-BoldItalicMT': 'timesbi.ttf',
	'Garamond': 'GARA.TTF',
	'Benguiat': 'Benguiat.ttf',
	'BenguiatITCbyBT-Bold': 'BENGUIAB.TTF',
	'BenguiatITCbyBT-BookItalic': 'benguini.ttf',
	'CenturySchoolbook': 'CENSCBK.TTF',
	'SCHLBKB': 'SCHLBKB.TTF',
	'CopperplateGothicBT-Roman': 'Copperplate Gothic.ttf',
	'AmazoneBT-Regular': 'AmazonRg_0.ttf',
	'BlackChancery': 'BLACKCHA.TTF',
	'ChocolateBox': 'C_BOX.TTF',
	'CollegiateBlackFLF': 'CollegiateBlackFLF.ttf',
	'CollegiateOutlineFLF': 'CollegiateOutlineFLF.ttf',
	'GreatVibes-Regular': 'Great Vibes.ttf',
	'HoneyScript-Light': 'HONEYSCL.TTF',
	'HoneyScript-SemiBold': 'HONEYSSB.TTF',
	'ILoveGlitter': 'I Love Glitter.ttf',
	'ZapfChancery-Roman': 'Zapf Chancery Font.otf',
	'MurrayHill': 'Murray Hill Regular.ttf',
	'TinplateTitlingBlack': 'TinplateTitlingBlack.ttf'
};
