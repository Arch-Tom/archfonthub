# Preview geometry

The font rail experiment treats engraving layout as typography, with its selection controls on a separate absolute layer.

## Baseline model

Every line uses the same preview font size. Its alphabetic baseline is positioned explicitly in SVG:

`baseline(i) = originY + i × renderedFontSize × spacing`

Consequently **100% spacing means exactly one em between adjacent baselines**. The default component values are 64px and `spacing = 1`. The line's font or style cannot change this relationship. For example, with a rendered size of 64px, 100% yields 64px baseline advance and 125% yields 80px. Font ascent, descent, selection, padding, borders, and browser line-height do not determine baseline positions.

Mixed script fonts can naturally overlap at tight spacing. That is an honest consequence of their actual outlines and the requested baseline spacing. The preview does not secretly expand gaps to compensate.

## Measuring and fitting

Canvas measures each entire authored line at a 1000px reference size using the same audited `familyFor()` font stack as SVG. The normalized metrics include logical advance, actual ink left/right bounds, and actual ink ascent/descent. This retains italic overhang and Unicode fallback metrics. Horizontal fitting includes the logical advance as well as actual ink, so intentional leading/trailing spaces remain part of the line's geometry.

Fit to Preview scales the shared font size, letter spacing, baseline advance, and all ink coordinates together. It fits the union of every line's ink bounds rather than multiplying a browser line-height by the number of lines. It has no arbitrary 10px minimum that would clip exceptionally long wording. A small outer canvas inset leaves room for the selection overlay; it does not add spacing between lines.

Intentional blank lines retain their baseline and an invisible em extent, including leading/trailing blank lines. Each SVG text node keeps exact customer text with `xml:space="preserve"` and `white-space: pre`; no trimming, wrapping, substitutions, or nonbreaking-space replacement occur. Hebrew/Arabic direction follows the first strong letter, while physical alignment still applies consistently to every line. Existing safe font stacks and Optima Unicode protections remain in use.

## Selection and interaction

Each line has a full-width native button hit target. Adjacent target regions meet at intermediate positions between baselines; the first and last extend to the canvas edges. A short line such as III can be clicked anywhere across its row. Narrow mobile preview rows may be shorter than 44px because the authored typography is preserved; the visible Choose lettering button opens a picker with a conventional line selector.

Inside each button, its text is drawn in SVG using the explicit baseline. A separate `.line-selection-outline` span is absolutely positioned around the measured ink, with 3–7px breathing room. The outline size changes with wording, family, style, font size, letter spacing, spacing-driven fitting, or container size. Hover, active state, and keyboard focus change only the overlay's paint. The buttons always have zero border, padding, and margin, and no transform in any state. Overlay borders use `border-box` sizing.

Keyboard Arrow Up/Down, Home, and End select and focus another line without scrolling. Activation reports `{ source: "pointer" }` for a pointer click and `{ source: "keyboard" }` for keyboard activation/navigation, allowing mobile to open its font picker only for the intended interaction. Native labels remain `Edit line N: wording` and pressed state exposes selection to assistive technology. A dashed focus outline is visible separately from the active border.

## Font and viewport updates

A layout effect measures whenever line text/assignment, size, spacing, letter spacing, alignment, fit, or sample mode changes. It explicitly requests required font faces and glyphs through `document.fonts.load()`, waits for those loads and FontFaceSet readiness, and responds to later `loadingdone` events. ResizeObserver schedules fresh geometry after a canvas resize. Animation-frame batching prevents repeated reads during resize or multiple font events; cleanup removes every observer/event callback.

## Validation

`tests/preview-geometry.test.js` covers the mathematical model: shared em baselines for mixed metrics, reduced/increased spacing, italic and mixed-font ink fitting, independent short/long ink bounds, contiguous broad hit rows, very long lines, blanks, physical alignment with overhang, RTL direction, and exact-text measurement including letter spacing.

`tests/preview-geometry.spec.js` mounts the actual React preview in the project's Vite browser environment. It checks both declared SVG baseline coordinates and screen-transformed baseline positions, actual overlay bounds, font-family application, resize fitting, style and letter-spacing changes, late font replacement, exact Unicode/spaces/blanks, and broad selection of III. It compares the entire measured geometry before and after hover, selection, keyboard focus, and arrow navigation so any unintended movement fails the test.

Eight unit tests and seven browser tests passed on Windows Microsoft Edge during implementation. The seventh browser check exercises the finished desktop and mobile app with three mixed fonts plus mixed Hebrew/Latin and Arabic/Latin lines. It verifies contained bounds, exact 100% baselines, unchanged geometry after mobile keyboard selection, and captures both rendered layouts. These screenshots were visually inspected: all five mobile lines remain visible and the focused outline follows the Arabic line. The broader integration suite separately validates Unicode fallback behavior.
