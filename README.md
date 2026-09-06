# Arch Font Hub

A one-screen tool for customers to choose lettering for an Arch Engraving proof. Enter exact wording, preview fonts on individual lines, save up to three independent favorites, add notes or a monogram, then review and send the preferences.

This branch evolves `color-refinement` from `245b383ad752a21759545f3208be5017b56e2165`; it selectively ports later v3 functionality without importing their layouts.

## Development

Requires Node.js 22 and npm. Install with `npm ci`, then run `npm run dev`. For a fixed browser-test address use `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort`.

- `npm run lint` — ESLint, no warnings allowed.
- `npm test` — submission and independent font-asset tests.
- `npm run test:e2e` — browser tests; Windows defaults to installed Edge. Set `PLAYWRIGHT_CHANNEL` to choose another installed Chromium channel.
- `npm run build` — production static assets in `dist`.
- `npm --prefix r2-worker test -- --run` — isolated Worker tests after installing that directory's dependencies.

All browser submission tests block real writes and intercept the Worker request. Do not send a real production request while developing. The deployed Worker contract is preserved and the Worker source is not modified by this branch.

## Behavior and maintenance

Draft and receipt storage is local to the browser, scoped by the optional `orderId` query parameter. Links can also supply `name` and `company`. Browser storage failures leave an on-screen recovery notice.

The font audit can be regenerated with `python scripts/audit-fonts.py`; maintenance requires FontTools and Brotli (`fonttools[woff]`). Use `--check` to verify generated data without changing it. The normal Node regression suite does not require Python or these packages.

The original Optima assets contain corrupt non-ASCII mappings. Their verified ASCII glyphs are retained; affected characters use explicitly disclosed supporting fonts. Do not replace the repaired assets with the historical files. SVG specimens also carry explicit supporting-font spans and glyph warnings.

See [the implementation and validation report](docs/COLOR-REFINEMENT-DEFINITIVE.md), [Unicode audit](docs/FONT-UNICODE-AUDIT.md), and [submission contract](docs/SUBMISSION-CONTRACT.md).

## Deployment

The existing Cloudflare Pages integration builds the branch preview from GitHub using `npm run build` and `dist`. Push only the new development branch. Do not deploy the Worker, update production, or change the source/historical branches as part of this preview work.
