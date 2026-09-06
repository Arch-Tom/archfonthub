import { env, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

// SELF and env use the local Workers runtime and isolated R2 storage.
// No test contacts the deployed worker or production bucket.
const filename = '900526_Astra_UX_Test_Arch_UX_Test.svg';
const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Renée O&apos;Connor • R&amp;D</text></svg>';
const upload = () => SELF.fetch(`https://example.com/${filename}`, {
  method: 'PUT', headers: { 'Content-Type': 'image/svg+xml' }, body: svg,
});

describe('font request storage', () => {
  it('saves a Unicode SVG with the established filename and content type', async () => {
    const response = await upload();
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    const saved = await env.ARCH_FONT_UPLOADS.get(filename);
    expect(await saved.text()).toBe(svg);
    expect(saved.httpMetadata.contentType).toBe('image/svg+xml');
  });

  it('rejects an existing filename without replacing the original', async () => {
    await env.ARCH_FONT_UPLOADS.put(filename, 'original request');
    expect((await upload()).status).toBe(409);
    expect(await (await env.ARCH_FONT_UPLOADS.get(filename)).text()).toBe('original request');
  });

  it('reads the saved request', async () => {
    await upload();
    const response = await SELF.fetch(`https://example.com/${filename}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await response.text()).toBe(svg);
  });

  it('rejects an upload without a filename', async () => {
    const response = await SELF.fetch('https://example.com/', { method: 'PUT', body: svg });
    expect(response.status).toBe(400);
  });

  it('returns a clear status for a missing request', async () => {
    expect((await SELF.fetch('https://example.com/missing.svg')).status).toBe(404);
  });

  it('allows the existing cross-origin PUT preflight', async () => {
    const response = await SELF.fetch(`https://example.com/${filename}`, {
      method: 'OPTIONS', headers: {
        Origin: 'https://preview.example.com',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });

  it('rejects unsupported methods', async () => {
    expect((await SELF.fetch('https://example.com/', { method: 'DELETE' })).status).toBe(405);
  });
});
