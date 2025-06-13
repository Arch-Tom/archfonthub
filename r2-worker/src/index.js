export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-Filename',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		switch (request.method) {
			case 'PUT': {
				if (!key) {
					return new Response('Missing filename in URL path.', { status: 400, headers: corsHeaders });
				}
				await env.ARCH_FONT_UPLOADS.put(key, request.body, {
					httpMetadata: { contentType: request.headers.get('Content-Type') },
				});
				return new Response(`Successfully uploaded ${key}!`, { headers: corsHeaders });
			}

			case 'GET': {
				if (url.pathname === '/list') {
					const list = await env.ARCH_FONT_UPLOADS.list();
					const fileNames = list.objects.map(obj => obj.key);

					// Add no-cache headers to ensure the list is always fresh
					const listHeaders = {
						...corsHeaders,
						'Content-Type': 'application/json',
						'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
						'Pragma': 'no-cache',
						'Expires': '0'
					};

					return new Response(JSON.stringify(fileNames), { headers: listHeaders });
				}

				if (!key) {
					return new Response('Missing file key.', { status: 400, headers: corsHeaders });
				}

				const object = await env.ARCH_FONT_UPLOADS.get(key);
				if (object === null) {
					return new Response('File not found.', { status: 404, headers: corsHeaders });
				}

				const headers = new Headers(corsHeaders);
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);

				return new Response(object.body, { headers });
			}

			default:
				return new Response('Method Not Allowed', {
					status: 405,
					headers: { ...corsHeaders, 'Allow': 'GET, PUT, OPTIONS' },
				});
		}
	}
};
