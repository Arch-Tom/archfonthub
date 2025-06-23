export default {
	async fetch(request, env, ctx) {
		const { pathname } = new URL(request.url);
		const key = pathname.slice(1); // remove leading slash

		switch (request.method) {
			case 'PUT':
				// This is the new block to handle uploads from the frontend
				if (!key) {
					return new Response('Missing filename', { status: 400 });
				}
				await env.ARCH_FONT_UPLOADS.put(key, request.body, {
					httpMetadata: { contentType: 'image/svg+xml' },
				});
				return new Response(`Successfully uploaded ${key}`);

			case 'GET':
				// This block handles your original GET logic
				if (pathname === '/list') {
					const list = await env.ARCH_FONT_UPLOADS.list();
					const fileNames = list.objects.map(obj => obj.key);
					return new Response(JSON.stringify(fileNames, null, 2), {
						headers: { 'Content-Type': 'application/json' },
					});
				}

				if (!key) {
					return new Response('Missing file key', { status: 400 });
				}

				const object = await env.ARCH_FONT_UPLOADS.get(key);
				if (!object) {
					return new Response('File not found', { status: 404 });
				}

				return new Response(object.body, {
					headers: {
						'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
					},
				});

			default:
				return new Response('Method not allowed', { status: 405 });
		}
	}
};
