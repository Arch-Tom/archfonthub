export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/list') {
      const list = await env.arch-font-uploads.list();
      const fileNames = list.objects.map(obj => obj.key);
      return new Response(JSON.stringify(fileNames, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle file retrieval like /filename.svg
    const key = pathname.slice(1); // remove leading slash
    if (!key) {
      return new Response('Missing file key', { status: 400 });
    }

    const object = await env.arch-font-uploads.get(key);
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      },
    });
  }
};
