# Font Unicode audit and Optima safeguard

## Root cause

The defect exists inside this repository's original Optima font files. It is reproducible without React, CSS or customer text encoding. Both original TTFs and their WOFF/WOFF2 conversions map U+00E9 (`é`) to a glyph named `eacute` whose outline is a Cyrillic short-i (`й`), not a Latin e with an acute accent. U+00E8 similarly has the corresponding unaccented Cyrillic shape. This is consistent with legacy Windows-1251 outlines labeled with Latin-1 character mappings: byte E9 is Cyrillic `й` in Windows-1251. The original conversion history cannot be established from the assets alone.

The same files also map U+2022 (`•`) to an empty outline. Merely checking that a cmap entry exists would incorrectly report both characters as supported. A browser's ordinary missing-glyph fallback cannot correct either case because the font claims the code points exist. The defect occurs in regular and bold, in source TTF and both webfont formats. The later v3 branches removed Optima from their catalog; they did not fix these assets.

## Correction

All six Optima assets now expose only the verified printable ASCII range U+0020–U+007E. Unsafe legacy entries were removed from every cmap subtable, including the legacy Macintosh table. The existing outlines were not relabeled, substituted or redesigned. Optima remains a selectable font with its original Latin letters, numbers and ASCII punctuation.

An independent before/after audit verified identical outlines and advance/side-bearing metrics for every printable ASCII character in both source TTFs. SHA-256 digests of the canonical per-character outline/metrics audit were unchanged:

| Source | ASCII outline and metrics digest |
| --- | --- |
| OPTIMA.TTF | `6b20da3ffcfca3810d63556ee1096fa8f14de04ae5b522262c230a8f1e2950ef` |
| OPTIMA_0.TTF | `e35bfbd2b3e53c903e198e6eeb145509f9cafa978f8ea6bfac065cf16e9b7898` |

This is a deliberate partial-font safeguard. It does not claim that an authentic Optima `é` has been recovered. The browser uses an explicit bundled fallback stack, and the interface reports the affected characters. The customer's wording is never rewritten. Arch receives the exact wording and chosen font preference for proof preparation.

## Coverage results

The audit reads the actual first available `@font-face` source, checks Unicode cmap entries and decomposed visible outlines, and generates `src/fontCoverageData.js`. For example, Montserrat's browser WOFF2 is a Latin subset; the audit does not accidentally claim the larger coverage of its source TTF. Each entry includes a SHA-256 asset fingerprint, compact coverage ranges, mapped-but-empty glyphs and representative missing characters.

There are 102 browser faces: 99 lettering styles and three circular monogram faces. Of those, 94 cover the complete development wording without fallback:

```text
Renée O'Connor
Director, R&D
St. Louis • 2026
```

| Lettering style | Characters requiring fallback in this wording |
| --- | --- |
| Optima | é, • |
| Optima Bold | é, • |
| Collegiate Black | é |
| Collegiate Outline | é |
| I Love Glitter | • |

Circular monogram faces are used for initials; their punctuation gaps are expected and are not treated as general lettering coverage. The other 94 lettering faces contain visible outlines for every non-whitespace character in the development wording.

Representative probes additionally include `éèêëàáâäçñöøüßœ`, curly quotation marks, en/em dashes, bullet, heart, infinity, star, and Hebrew with niqqud (`שָׁלוֹם`). Arial supplies the representative Latin accents; Noto Rashi Hebrew supplies the Hebrew letters and marks; Arial and DejaVu Serif supply useful punctuation and symbol fallback.

No currently bundled face contains U+2605 `★` or U+2606 `☆`. These and other unverified characters receive an explicit notice: the platform may render them, but the preview cannot verify their shape. The wording remains unchanged for Arch to check. Font coverage also cannot guarantee the quality of every possible script's shaping or the appearance of every glyph; this is an outline-coverage audit plus a targeted Optima mapping repair, not a claim of universal Unicode support.

## Runtime interface

- `getPreviewFontFamily(family)` keeps the chosen face first, followed by bundled Arial, Noto Rashi Hebrew and DejaVu Serif, then the platform sans-serif fallback.
- `getFontCoverage(family, text)` returns `known`, `missingCharacters`, `unsupportedCharacters`, `hasFallback` and a customer-facing `message`.
- Missing letters with known bundled fallback are explained separately from unverified characters. Duplicate characters, blank lines, whitespace and text-direction controls do not produce repeated or false notices.
- These helpers inspect code points without modifying, normalizing or transliterating the stored wording.

## Reproducible validation

The normal Node suite requires no Python font tools:

```sh
node --test tests/font-coverage.test.js
```

Its 13 tests independently decompress the actual WOFF/WOFF2 files, parse their cmap tables and verify that all six Optima assets map exactly the 95 printable ASCII characters. They also check every audited asset fingerprint, all lettering styles against the exact sample, correct fallback notices, Hebrew niqqud, Latin accents, unsupported supplementary-plane characters, whitespace handling and fallback stacks.

To regenerate or verify coverage after a font or font-source change, install `fonttools[woff]` in a Python environment and run:

```sh
python scripts/audit-fonts.py
python scripts/audit-fonts.py --check
```

The repair is reproducible and idempotent:

```sh
python scripts/audit-fonts.py --repair-optima
```

The generator requires FontTools and Brotli only for maintenance. The app and regular tests do not acquire a Python runtime dependency. Rendered-browser regression tests should also verify that Optima `é` and `•` match the bundled fallback font's canvas pixels and that the customer-facing notice appears beside the relevant preview.
