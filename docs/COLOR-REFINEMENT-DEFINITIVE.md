# Arch Font Hub: definitive one-screen evolution

## Git provenance

- Source branch: `color-refinement`.
- Source SHA: `245b383ad752a21759545f3208be5017b56e2165` (local and fetched origin agreed).
- New branch: `astra/color-refinement-definitive`.
- Initial checkout: `astra/afh-v3-radical-redesign`, clean, HEAD `fd76479e86f1c12cdee5e71db79733014ceba60c`.
- Learning sources inspected: ux-synthesis `f921a50656b0139d6a104781799890d51cf0387a`; visual-refinement `5d0cfcde53c1175ec69287e06311aa3d351a3815`; radical-redesign `fd76479e86f1c12cdee5e71db79733014ceba60c`.
- Production/main reference at start: `5163e4ea39b75cbf1b6ecb711ff56e578134f95d`.
- Only the new branch is eligible for this task's commit/push. No production Worker deployment or production request is part of validation.

## Product and visual decisions

The original live color-refinement and production interfaces were inspected before implementation. The two-pane working relationship remains: wording and a compact/expanded font browser beside a large, immediately editable engraving preview. This remains a customer lettering-preference tool, with optional mixing and layout controls, rather than a production-layout editor.

The composition is rebuilt around a quieter neutral surface, Arch blue actions, dark ink, and restrained green favorite indicators. The existing Arch logo and 37-font catalog are retained. Blue identifies work in progress; green identifies saved preferences and confirmation. A pale blue page wash and numerous nested rounded containers were reduced to clearer pane boundaries, more deliberate alignment, stronger headings, and a more legible preview.

| Role | Color | Purpose |
| --- | --- | --- |
| Main ink | `#172d3c` | Clear lettering and interface contrast |
| Arch action blue | `#05699f` | Primary action and active-line context |
| Blue emphasis | `#075079` | Readable secondary actions |
| Page neutral | `#eef2f4` | Comfortable long-session background |
| Preview | `#fbfcfc` | Neutral comparison surface |
| Saved preferences | `#22684c` | Favorite and receipt distinction |

At 1365 × 930, the wording, active target, catalog, preview, three favorite slots, controls and notes are available together. Compact browsing uses three columns and an independently scrolling collection; expanded browsing widens that collection to four columns while retaining the same wording, preview, and active-line state. Specimens use the active line's wording and fit within each tile; complete names appear separately.

At 390 × 844, the working order is wording, live preview, browsing, favorites, and notes. A local line selector lets customers keep changing the active line while browsing; jump links connect browsing and the mixed preview. A brief explanation of Arch's proof process remains visible on mobile. There are no permanent sticky workspace overlays.

## Behavior

- Every preview line is a native button with an exact accessible name, line number, arrow, border, and pressed state. Visible catalog and preview labels identify the same target. Arrow keys, Home and End activate and focus the intended line.
- One shared active-line state serves compact, expanded, and mobile modes. Clicking a preview line never depends on focusing a hidden or stale textarea selection. Wording edits and blank lines preserve or reconcile assignments without changing favorites.
- Fonts applied to lines and saved favorites are independent. A star saves/removes a favorite; font specimens apply lettering to the active line. Three compact favorite slots offer independent styles, direct apply/remove/replace, and full-wording comparison. A fourth favorite requires an explicit replacement choice.
- Font style choices are remembered when revisiting a font. Draft wording, assignments, active line, favorite styles, notes, monogram, customer details and preview preferences survive reload. Browser storage is scoped by linked order ID. A storage failure produces a visible recovery notice.
- Fit measures loaded fonts and available width/height, refits after font loading or resizing, and preserves literal line breaks. Size, spacing and alignment are preview-only; use-on-every-line changes assignments explicitly.
- Symbols, accents, Hebrew, niqqud and cursor insertion are retained. Character tools use accessible tabs and a contextual palette. Classic, same-size, circular (all frames), and split-letter monograms remain available, including styles and missing-character notices.
- Designer Notes open in a contextual dialog and save as typed. Native dialogs include explicit keyboard containment, Escape handling and restoration of the opener's focus.
- Review includes exact wording, independent favorites/styles, line-by-line lettering/styles, notes, monogram/frame, customer details, company, and order number. “To be sent to Arch” is separated from preview-only settings. Customers can return to correct choices.
- The established deterministic filename and SVG `PUT` contract are retained. Submission locks synchronously, disables duplicate actions, explains loading, preserves data on errors and allows recoverable retry. A 409 conflict is not presented as a new success.
- A confirmed success creates a persistent receipt with exact request data, a downloadable text copy, clear next steps, and an on-page receipt link after closing the confirmation.

## Known defects resolved

**Wrong active line:** The old implementation coupled preview activation to textarea focus/selection. The new interface uses an explicit shared target, including the same preview buttons in both browsing modes and a mobile catalog selector. Compact/expanded, keyboard and blank-line regressions verify that only the visible target changes.

**Optima corruption:** The original fonts themselves map `é` to a Cyrillic-shaped outline and the bullet to an empty glyph, in regular and bold. All six assets now expose only verified ASCII mappings, retaining original ASCII outlines and metrics. Missing characters use audited supporting fonts with an explicit notice. This is a safe partial-font correction, not a claim to have recovered authentic Optima accented outlines. Generated SVG additionally uses explicit supporting-font spans, so an old font installed downstream cannot reclaim the corrupt mappings. See [font audit](FONT-UNICODE-AUDIT.md).

**Favorites versus assignments:** Different controls, state and review sections represent each concept. Removing/replacing/changing a favorite does not change a line assignment. Applying a favorite to a line is explicit.

**Submission ambiguity:** Review is real, failures retain the entire draft, retry preserves the deterministic target, duplicate conflicts are distinct, and confirmed success yields a persistent downloadable receipt. See [submission contract](SUBMISSION-CONTRACT.md).

## Validation

- 27 browser tests: 17 one-screen workflow tests and 10 character/monogram tests, using Edge/Chromium at desktop and mobile sizes.
- 37 Node tests: 24 submission/serialization tests and 13 independent font-coverage/asset tests.
- 7 isolated Worker tests, using local test bindings; deployed Worker code is unchanged.
- ESLint passes with zero warnings; production Vite build passes. Existing non-blocking Browserslist/PostCSS maintenance warnings remain.
- Automated axe-core 4.10.3 checks reported zero WCAG 2/2.1/2.2 A/AA violations in desktop arrival, filled workspace, comparison, review and mobile filled workspace. This supplements keyboard/focus/reflow checks; it is not a full screen-reader certification.
- Unicode checks preserve the supplied accent, apostrophe, comma, ampersand, bullet, line breaks and intentional blank lines. Browser pixel tests prove corrected Optima regular/bold fall back for `é` and `•` while retaining their distinct ASCII shapes.
- The audit checks 102 browser faces (99 lettering styles plus three circular faces). 94 lettering faces fully cover the supplied sample; known gaps and unverified symbols receive explicit notices. Coverage does not claim universal shaping support.
- Browser tests block external writes and mock delayed send, failure, retry, conflict, success and download. No live customer request was sent.

## Fresh reviewer

A separate reviewer received only the rendered interface and the customer's task, without implementation or prior rationale. They completed the exact wording, three favorites, mixed lettering, compact/expanded activation, replacement, wording edit/restore, notes, comparison, customer details and review at both sizes. They verified reload persistence and did not send a request.

Their feedback led to these changes:

1. Font tiles now sample the active line, rather than always line 1.
2. Review changed from premature “Sent to Arch” to “To be sent to Arch.”
3. Mobile browsing moved before favorites, and gained a line selector beside the catalog.
4. Mobile gained the proof-process explanation and direct preview/browse jump links.
5. Their initial expanded-fit concern was checked in a fresh settled session and a new regression test; no stable wrapping or clipping defect was reproduced.

The reviewer described the final tool as professional, practical and appropriate for an engraving company, with clear purpose, first action, active line, favorites separation and review. No blocking workflow defects remained. The receptionist answer was yes for getting started and choosing, with the practical recommendation to include the order number in Arch's invitation. Actual delivery was deliberately untested; mocked submission/receipt validation is separate evidence.

## Candid assessment

1. **Still one-screen Font Hub?** Yes: the original working relationship and direct mixing remain recognizable.
2. **Substantial upgrade rather than unrelated product?** Yes: state clarity, browsing, favorites, review, resilience and typography quality changed together.
3. **Safe and intuitive mixing?** The tested interactions are unambiguous and correct, including keyboard, expanded and mobile targeting.
4. **Independent favorites?** Yes, in state, controls, persistence, comparison and transmission.
5. **Substantial visual improvement?** Yes, particularly hierarchy, preview emphasis, density and state clarity; visual preference remains subjective.
6. **Color change beneficial?** The restrained Arch blue/neutral system improves focus and contrast without inventing a new brand.
7. **Better represents Arch quality?** The tested coherence, accuracy and confirmation flow support that judgment.
8. **Realistic 9/10+ chance?** Credible, especially where the original failed. No numeric score is claimed. Mobile still requires movement between the full mixed preview and catalog, now reduced by local targeting and jump links. An independent blind test remains the judge.
9. **Choose over the original and later experiments?** Yes for this requested product direction: it retains the preferred one-screen interaction and adds the mature capabilities.
