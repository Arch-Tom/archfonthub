# Font rail experiment

This experiment descends from `astra/color-refinement-definitive` at `c539a8a02030e36d4e380884d44de7951ab44bcf`. Its branch is `astra/afh-font-rail-experiment`. It preserves the source request contract and font safeguards while changing the main editing interaction.

## Recovery record

The continuation audit found the repository at `C:/Users/Tom/Desktop/VSCodeGit/archfonthub`, on the intended experiment branch, still at the exact source commit. The worktree was dirty, with eight modified tracked files and ten new files. Nothing was staged. The experiment branch did not exist remotely. No merge, rebase, cherry-pick, revert, bisect, or index-lock state existed. No work appeared lost; all known implementation areas and helper files were present. Uncommitted work cannot prove the absence of an unsaved editor buffer, so the conclusion is limited to the recovered filesystem and Git evidence.

Recovered tracked modifications:

- `src/CharacterTools.css`
- `src/CharacterTools.jsx`
- `src/Dialog.jsx`
- `src/EngravingPreview.jsx`
- `src/FontHub.jsx`
- `src/FontSpecimen.jsx`
- `tests/characters.spec.js`
- `tests/definitive.spec.js`

Recovered new files:

- `docs/PREVIEW-GEOMETRY.md`
- `src/FontRail.jsx`
- `src/RailWorkspace.jsx`
- `src/previewGeometry.css`
- `src/previewGeometry.js`
- `src/rail.css`
- `src/requestDialogs.css`
- `tests/font-rail.spec.js`
- `tests/preview-geometry.spec.js`
- `tests/preview-geometry.test.js`

The tracked diff at recovery contained 564 insertions and 678 deletions across eight files; the ten untracked files were additional. Before further editing, exact copies of all 18 files, SHA-256 inventory, tracked binary patch, staged patch, status, and diff summary were saved under ignored `artifacts/recovery-font-rail/`.

The right rail, mobile picker, explicit baseline geometry, visible utilities, comparison dialog, review styling, and adapted tests were already implemented but uncommitted. Logo contrast, final focus behavior, complete fresh validation, independent rendered review, documentation, commit, and deployment were unfinished. Development servers did not survive cleanly. They were restarted without discarding any files.

`artifacts/baseline.cjs`, `wire-rail.cjs`, `inspect-rail.cjs`, and `deployed-smoke.cjs` are local development/inspection aids, with the last one targeting the earlier definitive preview. They are retained as ignored evidence, not shipped project tooling. Build output, test traces, screenshots, dependency helpers, editor state, and logs remain ignored. Vite now ignores generated test/artifact HTML so trace capture cannot reload the application during concurrent browser checks.

## Interaction

At 1365 × 930, wording, preview, active font/style, optional comparison, and the right rail share one working screen. The right position preserves the relationship between the customer's work and available lettering. Testing did not establish a reason to move it left.

Clicking a preview line selects that exact line. Every font specimen immediately uses its wording. Clicking a font applies it directly, with no alternatives required. Each line retains its own family and style. The selected line is identified by an ink-fitted outline, line number, applied font name/style, and rail context. The active font's row also carries a textual Applied state.

The rail contains all 37 families. Search, categories, and current wording stay available while its list scrolls independently. A wider-rail toggle gives long specimens more space. Specimens scale down to 16px before allowing horizontal text scrolling for exceptional wording. The full wording remains intact. Remembered styles are shown in the specimen before direct application, so the previewed rail face matches the face the click applies.

“Use this font on all lines” applies the current family and style throughout. It does not alter alternatives. “Compare” beside a font retains an optional alternative; the comparison dialog renders the full wording in each of up to three independent styles. Each alternative can change style, apply to the current line, be removed, or be explicitly replaced. Adding a fourth opens a replacement decision. No star controls remain in the workspace. The internal `favorites` submission field remains for compatibility.

Draft storage is isolated under `arch-font-hub:font-rail:` and scoped by `orderId`. Exact text, assignments, active line, styles, alternatives, notes, monogram, customer details, filters, rail width, and preview controls survive reloads. The experiment does not import another branch's old 140% preview default.

## Preview geometry

Every SVG line has an explicit alphabetic baseline:

`baseline(i) = originY + i × renderedFontSize × spacing`

The default is `spacing = 1`: **100% means exactly one rendered font-size between baselines**. A 64px font size gives a 64px advance; 125% gives 80px. Mixed font ascenders and descenders do not silently increase that spacing. Large script outlines can naturally overlap at tight spacing, which is visible rather than hidden by added gaps.

Canvas measures actual ink extents using the same audited font stack as SVG. Fit scales the whole composition proportionally, including letter spacing and baseline distances, accounting for script/italic overhang and authored blank lines. Exact Unicode and authored spaces are preserved.

Visible active bounds are a separate absolute span around actual ink with 3–7px breathing room. Native button hit rows span the available width; short wording such as III stays easy to target. Hover, selection, and focus change overlay paint only. They cannot add text padding, margins, borders, line gaps, or displacement. Font loading, wording, family/style, size, letter spacing, fit, and container resize trigger new measurements. See [the detailed geometry model](PREVIEW-GEOMETRY.md).

This is a faithful interactive lettering preview, not a promise of the physical dimensions of a manufactured engraving. Size, spacing, and alignment remain preview-only; review states this explicitly, and layout requests belong in Designer Notes. Arch still prepares the final proof.

## Tools and mobile

Accented Characters, Symbols, Hebrew, Monogram Maker, and Designer Notes are visible icon-and-text controls beside the wording editor. Native dialogs preserve keyboard focus and restore the opener on close. Character insertion returns to the wording cursor; Hebrew retains niqqud, Unicode-aware deletion, and its existing editing behavior. All four monogram modes remain available, with replacement/removal and review data preserved.

At 390 × 844, tapping a line opens a full-screen native font picker. It shows the exact line, a line selector, search, categories, current style, and scrolling specimens. Applying a font closes the picker and focuses the affected line. Escape returns to the selected line or the explicit Choose lettering opener, as appropriate. Arrow-key line navigation remains available without unexpectedly opening the picker. Dense authored multiline text may have hit rows shorter than 44px; the conventional line selector inside the picker remains available through the visible chooser button.

Review shows exact wording, line-by-line styles, optional alternatives, notes, monogram data, and order/customer details. Submission retains its lock, deterministic retry identity, uncertainty/error messaging, duplicate handling, success, persistent receipt, and receipt download. Tests intercept every submission; no live production request is sent.

## Visual system

Deep ink anchors the header, with a restrained teal rule, pale sage workspace, warm paper preview, and white lettering library. Quiet green and warm accents distinguish the tool glyphs without coloring font categories. The existing **white Arch logo asset** fixes the low contrast of the dark logo on the ink header. It is verified in desktop and mobile renderings.

Larger real-wording specimens, subtle separators, fitted selection, and clear applied states give the fonts the visual personality. Optional controls live in their appropriate dialogs or Preview controls disclosure. No inspirational copy, slogans, lifestyle content, or new brand mark was introduced.

## Validation

Fresh checks were run after recovery rather than trusting interrupted output:

- 45 Node unit tests: 24 submission-contract cases, 13 independent font/Unicode cases, and 8 geometry cases.
- 7 isolated Worker tests, using local runtimes and no production writes.
- 41 browser tests pass in the final complete run. Coverage retains all 17 mature workflow cases and 12 character/monogram cases, plus 3 rail cases, 7 geometry cases, and 2 style/filter/persistence cases.
- Zero automated WCAG A/AA violations across empty/filled workspace, Optima fallback, comparison, all five tools, desktop review, mobile workspace/picker/review. Two additional mocked mobile error/receipt audits also report zero violations, with manual contrast review retained where automated analysis is inconclusive.
- Font audit checks 102 browser faces against the checked-in generated coverage and assets. The same eight faces need the already disclosed fallback for some of the standard fixture. Optima unsafe mappings and explicit SVG fallback remain unchanged.
- ESLint and production build. The existing build emits Browserslist age and PostCSS `from` warnings; the existing Worker runtime reports its compatibility-date fallback. These are recorded tooling limitations, not failed checks.

Browser geometry assertions compare actual screen-transformed baselines, actual ink outlines, font/style changes, short/long wording, resize, late font load, blank lines, exact Unicode, and zero movement across selection/hover/focus. Integrated screenshots cover mixed Latin, Hebrew, and Arabic lines on both target viewport sizes.

## Fresh rendered review and resulting refinements

A fresh agent used only the rendered application at both target viewport sizes, without reading implementation files. It independently applied Great Vibes Regular, Arial Bold, and Garamond Italic, used Apply to All, all tools, optional alternatives, short and long lines, and review. It found no blocking customer-flow issue and measured identical glyph positions when only selection changed. The reviewer described the visual system as calm and professional, with sufficient personality from ivory, teal, and actual lettering specimens.

The review led to a clearer “Add monogram preference” action and simpler customer-facing monogram details, removing raw mode names and redundant “none frame” text. The rail-width button now has a visible Wider/Standard label alongside its icon. A separate code-and-browser audit found that a remembered Bold specimen could save Regular as an alternative; this was fixed for both comparison addition and replacement, and the regression test now verifies the same remembered style across specimen, application, and comparison.

The main remaining tradeoff is mobile audition speed: the picker header consumes about 335px and roughly three specimens are visible at a time; choosing a font returns to the preview, so repeated auditions require reopening. Comparison renders the full wording but its Apply action explicitly targets the active line. These are useful questions for the next blind customer test. Mobile Hebrew insertion controls need a small vertical scroll but remain accessible and unclipped.

The final deployed verification is recorded with the delivery report. This branch is a candidate for a blind customer UX test; automated and agent review cannot substitute for observed customer behavior.
