# Arch Font Hub v3 — visual refinement

## Scope and branch safety

This second pass starts at the unchanged first-v3 commit `f921a50656b0139d6a104781799890d51cf0387a` on `astra/afh-v3-ux-synthesis`. The checkout was clean; remote state was fetched before creating `astra/afh-v3-visual-refinement` from that exact commit. No local work was discarded and no stash was needed.

Only the new branch is intended for the normal Cloudflare Pages branch preview. Main, production, the original v3 branch, the Worker, and deployment configuration are unchanged. No live submission was made. Submission-state inspection and browser tests intercepted requests with local mock responses.

Comparison baseline: https://astra-afh-v3-ux-synthesis.archfonthub.pages.dev/

## Visual concept

A lettering gallery and engraving proofboard: cool paper, Arch-derived blues, confident real type specimens, and white lettering sheets against deep navy. The existing Arch logo is retained and enlarged within a compact header. A serif shop caption and a script headline bring actual collection typefaces into the page's identity.

The live original v3 and production were inspected before implementation at 1365 × 930. The original v3's cream background, pale green empty shortlist, smaller specimens, nested cards, and repeated hierarchy made it feel like a careful form. This pass changes the composition substantially while keeping its successful choose → review → send flow.

## What changed

- Wider desktop composition, stronger header, cooler paper palette and a high-contrast navy comparison area.
- Outer cards removed from the wording and collection sections. Specimen rows use spacing and horizontal rules; only the lettering candidates have white proof-sheet surfaces.
- Redundant numbered sections and the extra YOUR SHORTLIST label removed. One journey indicator remains.
- Font names now render in their own typeface at up to 42px, compared with 23px before. The longest word is fitted to prevent awkward midword breaks.
- Customer wording becomes the main gallery sample as soon as it is entered, at 35–36px in compact browsing. Larger samples retain the full multiline wording at 37–43px depending on viewport.
- The All collection opens with Garamond, Great Vibes, Graphik, Copperplate, and Old English to demonstrate range immediately. All 37 fonts remain available. Individual category order, filtering, search, and selection mechanics are unchanged.
- Secondary labels and controls are larger and darker. Selected fonts retain a checkmark, Selected text, count, and pressed state in addition to color.
- Review, customer details, progress, errors, success, and receipt use the same restrained blue-and-paper design. The final request still shows actual chosen typefaces and exact wording.

## Zero, one, two, and three favorites

With no wording or favorites, an expressive typographic composition makes the empty space useful as inspiration. Entering wording changes it into a live Garamond preview of the complete text. It explicitly says nothing is selected; only the customer's Keep Garamond action saves it. Removing that favorite restores the unselected live preview.

One favorite gets a larger proof sheet, with text fitted up to 46px. Two favorites become a pair of white sheets; three become a compact stack of distinct lettering candidates. Two- and three-choice text fits up to 32px instead of 26px. Full multiline wording remains visible, with a 16px fitting floor and wrapping for unusually long content. Font names, styles, Remove, and Replace stay visible without hover. A remaining-space message makes clear that one favorite is sufficient.

## Preserved behavior

The existing state and submission architecture is intact: three-choice limit, explicit replacement and removal, favorites/styles through wording edits, filtering and reloads, multiline previews, expanded samples, Designer Notes, symbols, accents, Hebrew with niqqud, all four monogram modes, review, customer details, progress, recoverable errors and retry, duplicate prevention, success, downloadable receipt, and receipt persistence. No active-line assignment or extra design controls were added.

`src/submission.js`, the font library, character and monogram components, Worker code, dependencies, existing test assertions, and deployment settings are unchanged. The small presentation additions use the existing selection handler and default-style logic.

## Desktop, mobile, and accessibility

Desktop gives the specimens and proofboard more width and stronger visual scale. The shortlist stays beside browsing; its contents can scroll when needed. Three multiline favorites can require modest page scrolling to reveal the entire board and review action rather than shrinking all lettering to fit the initial viewport.

Mobile keeps normal page scrolling, sticky category/search controls, and the existing persistent favorites/review shortcut. Single-column specimens retain large type. Rows were tightened after review, reducing typical selected-wording rows from roughly 165px to 139px while keeping the samples large. The complete 37-font catalog is still long; search, category filters, and the favorites jump provide direct navigation. The first phone viewport prioritizes the wording field; the collection begins below it.

Semantic buttons, accessible names, keyboard selection, native dialog focus containment/return, visible orange focus outlines, non-color selection indicators, reduced-motion rules, and mobile touch targets are retained. Reflow was checked at 320, 390, 683, 768, 1024, and 1365 CSS pixels with no horizontal document overflow. The 683 × 465 check approximates 200% zoom reflow for a 1365 × 930 viewport; it is not a native browser-zoom or screen-reader certification.

## Independent rendered review

A fresh reviewer inspected the baseline and candidate in Chrome without reading the implementation. Their verdict was a substantial visual leap and a premium lettering experience without overdesign. They found the first action and three-choice model clear, and no blocking visual defect in zero/one/two/three favorite or review states.

Their concrete feedback produced three changes: mix typeface categories at the start of All, shorten mobile specimen rows without reducing type size, and enlarge the visible Arch logo. Their rendered follow-up confirmed improved range and scanability, clean logo fit at 390px and 320px, and no new visual issue or horizontal overflow. Their remaining nonblocking observations were the long mobile collection and the desktop three-choice board extending beyond the first viewport.

## Validation

Final local checks on 2026-09-06:

| Check                            | Result                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| Submission / serialization tests | 14 passed                                                           |
| Browser suite                    | 21 passed: all 19 existing plus 2 focused visual-state/reflow tests |
| Isolated Worker tests            | 7 passed                                                            |
| ESLint                           | Passed                                                              |
| Production build                 | Passed                                                              |
| Git whitespace check             | Passed                                                              |

Browser coverage includes Unicode, style/favorite/text persistence, filtering, direct replacement, every monogram mode, character tools, keyboard behavior, review/customer details, loading, duplicate prevention, service/network/duplicate errors, retry, and persistent receipt. New coverage checks that inspiration is not silently selected and that narrow/tablet/zoom-equivalent layouts remain within the page width.

Rendered captures cover fresh arrival, wording with zero favorites, one/two/three favorites, Designer Notes, symbols, accents, Hebrew, monogram, review and customer details, submitting, error/retry, success, and receipt on desktop and mobile. The standard three-line Renée O'Connor / Director, R&D / St. Louis • 2026 wording was used, with Garamond, Great Vibes, and Copperplate for contrasting favorites. Local screenshots and the independent review are retained under ignored `artifacts/visual-pass/`; no machine artifacts are committed.

Nonfatal inherited tooling warnings remain: old Browserslist data, a PostCSS plugin's missing `from` option, and the local Worker runtime falling back from compatibility date 2025-06-12 to 2025-06-04. These did not fail checks. Existing font-specific glyph/fallback limitations remain; this pass does not change font files. Real production writes and broad cross-browser/device certification are outside this verification.

## Assessment

This now reads as a true visual v3: typography supplies the personality and visual texture, the comparison is a designed lettering presentation, and the Arch identity is stronger. It is a substantial change in composition and hierarchy rather than a subtle recoloring. Desktop delivers the strongest first impression. Mobile deliberately gives the wording task priority and uses scrolling for large specimens; it is polished and readable, with the long collection remaining the clearest tradeoff.
