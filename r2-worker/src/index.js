export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);
		const key = pathname.slice(1);

		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		switch (request.method) {
			case 'PUT':
				if (!key) {
					return new Response('Missing filename', { status: 400, headers: corsHeaders });
				}

				// **NEW**: Check if the file already exists before writing
				const existing = await env.ARCH_FONT_UPLOADS.head(key);
				if (existing !== null) {
					// Object with this key already exists.
					return new Response('Duplicate filename. This order has likely already been submitted.', {
						status: 409, // 409 Conflict is the appropriate status code
						headers: corsHeaders
					});
				}

				// If it doesn't exist, proceed with the upload
				await env.ARCH_FONT_UPLOADS.put(key, request.body, {
					httpMetadata: { contentType: 'image/svg+xml' },
				});

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

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
			headers: { Allow: 'GET, POST, PUT, OPTIONS' },
		});
	}
}
