# Arch Font Hub

Arch Font Hub helps engraving customers choose up to three lettering favorites, preview their own wording, add notes, and send a reviewed request to Arch. The designer uses these preferences to prepare the actual proof.

The v3 interface keeps the wording, searchable font collection, and favorite previews together. Customers can remove or replace favorites, compare styles, use special characters, and optionally create a monogram. A separate review step includes customer details and the complete request; successful submission produces a downloadable receipt.

## Local development

Development was validated with Node.js 22.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production frontend in `dist/`. |
| `npm run preview` | Serve the built frontend locally. |
| `npm run lint` | Run ESLint with zero warnings allowed. |
| `npm test` | Run the 14 dependency-free submission tests with Node's test runner. |
| `npm run test:e2e` | Run local Playwright customer-flow and character-tool tests. |

No root type-check script is configured; the application uses JavaScript and JSX.

Playwright uses installed Google Chrome through `channel: "chrome"`. If Chrome is absent, install it before running browser tests:

```sh
npx playwright install chrome
npm run test:e2e
```

The Playwright configuration starts Vite at `http://127.0.0.1:5173`, or reuses an existing server there outside CI. Tests cover desktop and mobile interactions, keyboard use, Unicode, character tools, monograms, review, mocked submission outcomes, and persistence. Upload responses are intercepted locally, and other external requests are blocked.

The worker has a separate dependency tree and seven tests using isolated local R2 storage:

```sh
npm --prefix r2-worker ci
npm --prefix r2-worker test -- --run
```

These tests use the Workers test runtime, not the deployed bucket. The currently locked runtime reports a compatibility-date fallback from the worker's `2025-06-12` setting to `2025-06-04` during local tests.

## Code map

| File or directory | Responsibility |
| --- | --- |
| `src/App.jsx` | Favorite selection, previews, review, customer details, draft storage, submission lock, and receipt. |
| `src/fontLibrary.js` | Font categories, available styles, and style-label helpers. |
| `src/v3.css` | Main v3 layout, responsive presentation, and focus treatment. |
| `src/index.css`, `public/fonts/` | Shared styles, font-face declarations, and local font assets. |
| `src/CharacterTools.jsx` and `.css` | Symbols, accented characters, and Hebrew insertion tools. |
| `src/MonogramMaker.jsx` and `.css` | Classic, same-size, circular, and split-letter monogram editor. |
| `src/CircularMonogram.jsx`, `src/SplitLetterMonogram.jsx` | Monogram previews. |
| `src/submission.js` | Deterministic filenames, escaped SVG serialization, timeout, upload, and customer-facing errors. |
| `tests/*.test.js`, `tests/*.spec.js` | Submission unit tests and Playwright interaction tests. |
| `r2-worker/` | Existing Cloudflare Worker and its local storage tests. |

## Submission and persistence

The production backend is preserved: the frontend sends a raw SVG using `PUT` and `Content-Type: image/svg+xml` to the existing worker. Filenames use the established sanitized order, customer, and optional company fields. An existing filename returns `409`; retries retain the same filename. The frontend also locks submission synchronously and disables the form while sending. Failed requests keep the customer's information and show explicit recovery guidance.

**Local development and branch previews share the production worker. Do not make live test submissions from either.** Use the injected `fetchImpl` in submission tests or the Playwright request mocks. Do not run the worker's deployment command or change its deployment configuration just to test this frontend.

Drafts and receipts use `sessionStorage`, scoped to the current browser tab and origin:

- `arch-font-hub:v3:draft` retains wording, favorites, notes, monogram, and customer details through a refresh.
- `arch-font-hub:v3:receipt` is written only after a successful upload; the draft is then removed.
- `orderId`, `name`, and `company` query parameters can prefill the request. An order-specific link avoids restoring another order's draft or receipt and still requires review.
- A receipt survives refresh in that tab. Closing the tab normally ends this storage session; use **Save receipt** for a lasting text copy. If browser storage is unavailable, the interface explains that the page or downloaded copy must be retained.

The backend's duplicate check is based on the complete filename, not an order-wide transaction identifier. Changing customer or company details changes that key. A `409` therefore asks the customer to contact Arch; it does not pretend the current edited request was newly received.

## Preview and font considerations

Previews communicate preferences, not production engraving layout. Multiline wording, blank lines, punctuation, and Unicode remain in the request. SVG metadata also retains the exact source wording and customer identity. Accompanying wording and favorite names are visibly exported even when the request includes a monogram.

Font coverage varies. Browser fallbacks can render a character in a different font when the selected asset lacks that glyph; check accents, Hebrew, and symbols in the final proof. Circular monograms use dedicated Latin-letter font assets. The exported SVG references font-family names rather than embedding font files or converting lettering to paths, so the designer's application needs the corresponding fonts. Monogram size and placement in previews are illustrative and remain subject to the designer's proof.
