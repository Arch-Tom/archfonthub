export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);
		const key = pathname.slice(1);

		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		switch (request.method) {
			case 'PUT':
				if (!key) {
					return new Response('Missing filename', { status: 400, headers: corsHeaders });
				}
				await env.ARCH_FONT_UPLOADS.put(key, request.body, {
					httpMetadata: { contentType: 'image/svg+xml' },
				});
				// *** FIX: Added the required CORS headers to the response ***
				return new Response(`Successfully uploaded ${key}`, { headers: corsHeaders });

			case 'GET':
				if (pathname === '/list') {
					const list = await env.ARCH_FONT_UPLOADS.list();
					const fileNames = list.objects.map(obj => obj.key);
					return new Response(JSON.stringify(fileNames, null, 2), {
						headers: { 'Content-Type': 'application/json', ...corsHeaders },
					});
				}

				if (!key) {
					return new Response('Missing file key', { status: 400, headers: corsHeaders });
				}

				const object = await env.ARCH_FONT_UPLOADS.get(key);
				if (!object) {
					return new Response('File not found', { status: 404, headers: corsHeaders });
				}

				return new Response(object.body, {
					headers: {
						'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
						...corsHeaders
					},
				});

			default:
				return new Response('Method not allowed', { status: 405, headers: corsHeaders });
		}
	}
};

// --- UTILITIES ---

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS', // Added PUT
	'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions(request) {
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		return new Response(null, { headers: corsHeaders });
	} else {
		return new Response(null, {
			headers: { Allow: 'GET, POST, PUT, OPTIONS' }, // Added PUT
		});
	}
}
