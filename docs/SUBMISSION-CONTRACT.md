# Request and receipt contract

The one-screen interface sends lettering preferences for an engraving proof. Its preview size, alignment, active line, browsing layout, filter, search, and favorite comparison state are working controls, not production dimensions or instructions.

## Existing transport

`src/submission.js` retains the established Worker endpoint and deterministic filename:

- `PUT https://customerfontselection-worker.tom-4a9.workers.dev/{order}_{customer}_{company}.svg`
- `Content-Type: image/svg+xml`
- Filename formatting trims each identity field, replaces whitespace with underscores, removes characters outside ASCII letters, digits, underscores, and hyphens, then joins nonempty fields with underscores.
- Order number and customer name are required. Original identity strings remain intact in the SVG artwork and metadata even where the transport filename is normalized.
- HTTP 409 means that filename already exists; the interface must not claim a new success or overwrite the existing request.
- A non-success response, network failure, or timeout produces recoverable uncertainty. Retry uses the same filename. The caller retains the customer draft until success is confirmed.
- The caller must disable duplicate sends while an upload is pending. The helper accepts cancellation and uses a 30-second timeout by default.

The Worker source keeps its established behavior. Worker tests use an isolated local runtime and local R2 storage. No test creates a real production submission.

## Snapshot

A snapshot contains exact `text`, `notes`, `orderNumber`, `customerName`, `customerCompany`, up to three `favorites`, optional `lines`, and optional `monogramInfo`.

Each favorite is `{ name, styles, activeStyle }`. Favorites are independent of the line assignments: the saved request includes every selected favorite, even if no line uses it.

Each line is `{ text, fontName, styleKey }`. When present, the complete line list must match the wording (normalizing CRLF/CR to LF only), including blank lines, whitespace, and trailing newlines. Font names and styles must resolve in the supported catalog. Stale, incomplete, or unknown assignments are rejected before fetching. Valid line assignments can communicate lettering preferences even without favorites.

Monograms preserve classic, same-size, circular (including frame), and split-letter data. Export uses structured data rather than saved HTML. Split-letter name fitting matches the onscreen preview.

## SVG contents

The document shows exact wording in a neutral font, then a readable line-assignment summary and line specimens, all favorite full-wording specimens, monogram, and notes where supplied. The exact source wording and identity, independent favorites, line assignments, and monogram are stored in XML-escaped JSON metadata. Text and attribute content are escaped. Intentional blank lines, accented names, punctuation, Hebrew, and combining marks remain in the source data.

`fontSize` and `textAlign` can affect receipt specimen presentation but are excluded from preference metadata. They do not specify engraving size or production placement.

## Validation

`npm test` covers deterministic filenames, Unicode/XML safety, exact source metadata, multiline and long text, four monogram modes, long split names, favorites, per-line assignments, validation, transport, duplicate response, service failure, network retry, and timeout.

`npm test -- --run` in `r2-worker` covers save/read, duplicate protection, missing paths, missing requests, CORS preflight, and unsupported methods in isolated storage. Browser tests intercept submission requests so their loading, failure, retry, duplicate, success, and receipt checks cannot upload a real order.
