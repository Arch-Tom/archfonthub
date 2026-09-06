# Arch Font Hub v3 — radical redesign

## Branch and scope

Branch: `astra/afh-v3-radical-redesign`, created from validated commit `5d0cfcde53c1175ec69287e06311aa3d351a3815`. The working tree was clean at the start. The original UX, visual-refinement, color-refinement, and main branches remain available. This pass changes presentation and workspace navigation; it retains the existing font library, submission serializer/contract, persistence keys, Worker, and deployment configuration.

## Design concept and interaction

A lettering workspace organized around the customer's engraving order. The Arch logo anchors a compact charcoal header. A single wording editor feeds two full-width views: Browse fonts and Compare choices. A persistent selection bar identifies saved preferences and supplies the next useful action: Enter wording, Choose a font, or Review my choices.

The previous hero, decorative sample poster, permanent stepper, right-hand shortlist, nested desktop catalog scroll, and poetic taglines are gone. The desktop catalog now occupies three columns across the page. Comparison replaces that workspace with one, two, or three wide specimens. Switching views preserves wording, notes, search, category, and selected styles. A persistent workspace switch provides direct access to wording while browsing far down the catalog.

Typography provides information and demonstrates the fonts. Graphik is the interface face; the existing Arch white logo, blue accent, and green success treatment connect the tool to the shop. Neutral surfaces, strong alignment, visible controls, modest corner radii, and restrained transitions supply the visual discipline. No new logo, textures, generated artwork, or decorative industrial imagery was introduced.

## Browsing and comparison

All 37 fonts remain accessible through category filtering and case-insensitive name search. First arrival shows each font's own name as a substantial specimen. Entering wording replaces those samples with the first line of actual text for scanning. Larger samples shows the complete multiline text. Selected specimens use the chosen font style, show a check, Selected label, and pressed state, and can be removed directly.

Compare displays complete wording, font name, numbered choice identity, style selector, Remove, and Replace. Choosing a fourth font brings the replacement prompt into view and moves keyboard focus to it. Explicit replacement returns to comparison. Removing a font preserves a useful focus target. A zero-favorite comparison provides concise guidance and, when wording exists, a clearly unselected Garamond sample; keeping it still requires an explicit action.

Desktop fits preview text up to 56px and responds to font loads as well as resizing. The minimum fitting size remains 16px, with wrapping for unusually long wording. A delayed-font regression verifies that a newly selected Graphik style does not leave ordinary lines incorrectly wrapped.

Mobile uses one catalog column, compact comparison specimens that allow two normal three-line choices to appear together, and a Larger previews option for closer inspection. The first font specimen is visible on arrival at 390 × 844. The word editor, tools, persistent navigation, and bottom action remain useful at phone sizes without a desktop sidebar. Normal document scrolling replaces internal catalog scrolling.

## Copy and supporting tools

Useful copy replaces “Your words. A style you love,” “Words worth keeping,” “Every word has a character,” and “A little inspiration.” The opening instruction is “Choose lettering for your order,” followed by the three-style/proof explanation. Designer Notes asks for concrete instructions. Empty-state actions match the next customer task. Result counts handle singular and plural.

Symbols, accented characters, Hebrew, and monograms retain their validated controls and behavior. Character palettes use consistent controls and 44px keys. The monogram dialog pairs setup/live preview with font specimens on desktop and uses a compact phone dialog. Mode-specific guidance explains display order, the larger center initial in classic mode, equal-size flat initials, circular initials, and split initial/name requirements. All classic, flat, circular, split, frame, insertion, and keyboard behavior remains available.

Font-specific character guidance is shared by comparison, review, and receipt. Great Vibes has an unusually large bullet glyph; the UI makes this visible and explains that the designer will check it. The actual font and source wording are preserved. Existing fallback notes for Collegiate and I Love Glitter remain.

## Review, send, and receipt

A separate review presents the exact request and customer details. Mobile places the request before the form. Sending retains the synchronous duplicate lock, disabled form, progress state, stable request snapshot, deterministic filename, and recoverable errors. Error recovery includes an explicit link to Arch's official contact page, verified at https://archengraving.com/contact. Opening it does not discard the local request.

Only successful mocked upload responses produce the tested success screen. Receipt persistence and the downloadable UTF-8 text receipt are unchanged. The serialized PUT body, backend URL, SVG contract, and Worker are unchanged. No production submission was made.

## Accessibility and validation

The design retains semantic buttons, labels, pressed states, visible checkmarks, live announcements, keyboard activation, native dialog containment and return focus, a skip link, high-contrast focus outlines, and reduced-motion handling. Workspace switches, replacement, removal, wording editing, and review transitions have explicit focus behavior. Nonfocused skip-link clipping prevents it from appearing over content in full-page captures.

All 21 existing browser tests remain; their navigation/heading/copy selectors were updated for the new presentation without dropping assertions. Six additional tests cover all catalog specimens, combined search/category recovery, mobile receipt/retry integrity, delayed font loading, complete keyboard workspace journeys, and readiness actions/mobile comparison enlargement.

| Check | Result |
| --- | --- |
| Browser tests | 27 passed |
| Submission tests | 14 passed |
| Isolated Worker tests | 7 passed |
| Full ESLint | Passed |
| Production build | Passed |
| Git whitespace check | Passed |

Checks use local Chrome and mocked upload responses. Unicode test wording: `Renée O'Connor`, `Director, R&D`, `St. Louis • 2026`, with actual line breaks. Coverage includes all monogram modes, notes, symbols/languages, selection/style persistence, filtering/search, direct and fourth-font replacement, keyboard/focus, 320px through desktop reflow, review/details, sending, network/server/duplicate errors, retry, duplicate prevention, success, and exact persisted/downloaded receipt contents.

Rendered desktop/mobile captures cover arrival, wording, search, zero/one/two/three favorites, replacement, notes, tools, monogram modes, review, customer details, sending, failure, retry, success, and receipt. Captures and local inspection scripts are under ignored `artifacts/`; no generated machine artifacts are committed. Browser-plugin startup and local image viewing were blocked by the environment's Windows sandbox helper error; the existing Chrome harness and read-only image fallback supplied visual verification.

## Fresh visual review and resulting changes

A separate reviewer inspected screenshots without the implementation or design rationale. The first review considered the direction professional and purpose-built but found too much introductory material, weak mobile comparison density, an inappropriate empty-state Review action, a captured skip-link overlap, conspicuous script punctuation, and unclear monogram entry guidance.

Those findings led to removing repeated headings/instructions, bringing six desktop specimens into the first viewport, bringing a specimen into mobile arrival, adding compact/enlarged mobile comparison, making the initial action follow readiness, clipping the hidden skip link, and adding character/mode guidance. The follow-up concluded: “The refreshed design would reinforce my confidence in the shop.” It called the experience professional and credible, with clean specimens and an explicit proof process that now feel purpose-built.

The reviewer still saw some conventional business-software vocabulary and requested character guidance in review/receipt, actionable contact recovery, tighter mobile spacing, and consistent first-step guidance. Those final concrete points were addressed. The design intentionally retains familiar controls rather than inventing unfamiliar interactions for stylistic novelty.

## Limits and candid assessment

This is a radical change in composition and interaction: full-width browsing/compare workspaces replace simultaneous narrow browsing and a permanent right shortlist. It is substantially more professional and more closely aligned with Arch's customer task than the previous decorative direction. I would choose it over the previous versions.

Native select controls, neutral panels, and blue action treatments remain familiar. The distinctive part is the lettering workflow, specimen scale, disciplined layout, and Arch identity, not novel controls. Long requests still require scrolling; font glyph coverage and unusual glyph proportions still need designer review. Font files are not modified, embedded in receipts, or converted to outlines.

Inherited nonfatal warnings remain: outdated Browserslist data, a PostCSS plugin missing its `from` option, and local Worker compatibility falling back from 2025-06-12 to 2025-06-04. Validation is Chrome-based; it is not native-device, Safari/Firefox, or screen-reader certification.
