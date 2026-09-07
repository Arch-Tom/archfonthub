import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const WORDING = "Ren\u00e9e O'Connor\nDirector, R&D\nSt. Louis \u2022 2026";
const PARTS = WORDING.split('\n');
const NOTES = 'Keep the accent and punctuation. Please send a proof before engraving.';
const WORKER = '**/*.workers.dev/**';
const line = (page, number) => page.getByRole('button', { name: new RegExp(`^Edit line ${number}:`) });
const wording = page => page.getByRole('textbox', { name: 'Your engraving wording', exact: true });
const favorite = (page, index) => page.locator('.favorite-slot').nth(index - 1);
const catalogApply = (page, font, number) => page.locator('.catalog').getByRole('button', { name: `Apply ${font} to line ${number}`, exact: true });

async function capture(page, name, fullPage = false) {
  const path = test.info().outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage });
  await test.info().attach(name, { path, contentType: 'image/png' });
}
async function expectFont(page, number, family) {
  await expect(line(page, number).locator('.line-wording')).toHaveCSS('font-family', new RegExp(family));
}
async function openComparison(page) {
  const dialog = page.getByRole('dialog', { name: 'Compare options', exact: true });
  if (!(await dialog.isVisible())) await page.getByRole('button', { name: /^Compare options/ }).click();
  await expect(dialog).toBeVisible();
  return dialog;
}
async function chooseFont(page, font, number) {
  await line(page, number).click();
  await expect(line(page, number)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill(font);
  await catalogApply(page, font, number).click();
  if (page.viewportSize().width <= 760) {
    await expect(page.getByRole('dialog', { name: 'Choose lettering', exact: true })).toHaveCount(0);
  } else await page.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill('');
}
async function saveFavorite(page, font) {
  const mobile = page.viewportSize().width <= 760;
  if (mobile) await page.getByRole('button', { name: /^Choose lettering/ }).click();
  await page.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill(font);
  await page.getByRole('button', { name: `Add ${font} to comparison`, exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill('');
  if (mobile) await page.keyboard.press('Escape');
}
async function openReview(page) {
  await page.locator('.site-header').getByRole('button', { name: /^Review & send/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Review your request', exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function enterCustomer(dialog) {
  await dialog.getByRole('textbox', { name: /Order number/i }).fill('ARCH-2048');
  await dialog.getByRole('textbox', { name: /Your name/i }).fill("Ren\u00e9e O'Connor");
  await dialog.getByRole('textbox', { name: /Company/i }).fill('Arch & Co.');
}

// No development test may write to a real service. Specific submission tests
// register a later route that fulfills the Worker request entirely in memory.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      await route.abort();
      throw new Error(`Unexpected network write blocked: ${request.method()} ${request.url()}`);
    }
    const host = new URL(request.url()).hostname;
    if (!['127.0.0.1', 'localhost'].includes(host)) return route.abort();
    return route.continue();
  });
  await page.goto('/');
});

test('desktop keeps wording, live preview, comparison and font browsing in one working view', async ({ page }) => {
  await wording(page).fill(WORDING);
  const controls = [
    wording(page), line(page, 1), line(page, 3),
    page.getByRole('searchbox', { name: 'Search fonts', exact: true }),
    page.getByRole('button', { name: /^Compare options/ }),
    page.getByRole('button', { name: /^Review & send/ }),
  ];
  for (const control of controls) {
    await expect(control).toBeInViewport();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1365);
  for (let index = 0; index < PARTS.length; index++) {
    await expect(line(page, index + 1).locator('.line-wording')).toHaveText(PARTS[index]);
  }
  await capture(page, 'desktop-workspace');
});

test('standard and wider rail browsing apply lettering only to the visibly active line', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  await page.getByRole('combobox', { name: 'Current font style', exact: true }).selectOption('bold');
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial Bold');
  await expectFont(page, 3, 'EB Garamond Regular');
  await page.getByRole('button', { name: 'Wider font rail', exact: true }).click();
  await expect(line(page, 2)).toHaveAttribute('aria-pressed', 'true');
  await chooseFont(page, 'Optima', 3);
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial Bold');
  await expectFont(page, 3, 'Optima');
  await expect(line(page, 1)).toHaveAttribute('aria-pressed', 'false');
  await expect(line(page, 2)).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Standard font rail', exact: true }).click();
  await expect(line(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(line(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial Bold');
  await expectFont(page, 3, 'Optima');
  await expect(wording(page)).toHaveValue(WORDING);
});

test('alternatives retain their own styles and compare full wording without changing mixed lines', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  for (const font of ['Garamond', 'Arial', 'Optima']) await saveFavorite(page, font);
  const comparison = await openComparison(page);
  await comparison.getByRole('combobox', { name: 'Alternative 2 style', exact: true }).selectOption('italic');
  await expectFont(page, 2, 'Arial');
  await expect(line(page, 2).locator('.line-wording')).not.toHaveCSS('font-family', /Italic/);
  await expectFont(page, 1, 'Great Vibes');
  await expect(comparison.locator('.comparison-item')).toHaveCount(3);
  for (const sample of await comparison.locator('.comparison-item').all()) {
    await expect(sample.locator('.line-wording')).toHaveText(PARTS);
  }
  await capture(page, 'desktop-comparison');
  await page.keyboard.press('Escape');
  await line(page, 3).click();
  await openComparison(page);
  await favorite(page, 2).getByRole('button', { name: 'Apply Arial to line 3', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Compare options', exact: true })).toHaveCount(0);
  await expectFont(page, 3, 'Arial Italic');
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial');
  await page.getByRole('button', { name: 'Use this font on all lines', exact: true }).click();
  for (const number of [1, 2, 3]) await expectFont(page, number, 'Arial Italic');
  await page.reload();
  await openComparison(page);
  await expect(page.getByRole('combobox', { name: 'Alternative 2 style', exact: true })).toHaveValue('italic');
  await expect(favorite(page, 1)).toContainText('Garamond');
  await expect(favorite(page, 3)).toContainText('Optima');
});

test('alternative replacement, filtering, search and wording edits preserve lettering preferences', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  for (const name of ['Garamond', 'Arial', 'Optima']) await saveFavorite(page, name);
  await openComparison(page);
  await favorite(page, 2).getByRole('button', { name: 'Replace Arial', exact: true }).click();
  await saveFavorite(page, 'Montserrat');
  await openComparison(page);
  await expect(favorite(page, 2)).toContainText('Montserrat');
  await expect(favorite(page, 1)).toContainText('Garamond');
  await expect(favorite(page, 3)).toContainText('Optima');
  await page.keyboard.press('Escape');
  await expectFont(page, 2, 'Arial');
  await page.getByRole('button', { name: 'Script', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Script', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(catalogApply(page, 'Great Vibes', 2)).toBeVisible();
  await expect(catalogApply(page, 'Arial', 2)).toHaveCount(0);
  const search = page.getByRole('searchbox', { name: 'Search fonts', exact: true });
  await search.fill('NoSuchFontQXYZ');
  await expect(page.getByText(/No (?:matching )?fonts/i)).toBeVisible();
  await search.fill('');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await search.fill('Montserrat');
  await expect(catalogApply(page, 'Montserrat', 2)).toBeVisible();
  await expect(catalogApply(page, 'Great Vibes', 2)).toHaveCount(0);
  await wording(page).fill(WORDING.replace('Director, R&D', 'Senior Director, R&D'));
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial');
  await wording(page).fill('Temporary wording');
  await wording(page).fill(WORDING);
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial');
  await openComparison(page);
  await favorite(page, 3).getByRole('button', { name: 'Remove Optima from comparison', exact: true }).click();
  await expect(page.locator('.favorite-slot')).toHaveCount(2);
  for (const slot of await page.locator('.favorite-slot').all()) await expect(slot).not.toContainText('Optima');
  await page.keyboard.press('Escape');
  await expectFont(page, 2, 'Arial');
  await page.reload();
  await expect(wording(page)).toHaveValue(WORDING);
  await openComparison(page);
  await expect(favorite(page, 2)).toContainText('Montserrat');
  await expectFont(page, 2, 'Arial');
});

test('keyboard line selection and dialogs retain clear focus and active state', async ({ page }) => {
  await wording(page).fill(WORDING);
  await line(page, 1).focus();
  await page.keyboard.press('ArrowDown');
  await expect(line(page, 2)).toBeFocused();
  await expect(line(page, 2)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('End');
  await expect(line(page, 3)).toBeFocused();
  await expect(line(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Home');
  await expect(line(page, 1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const expand = page.getByRole('button', { name: 'Wider font rail', exact: true });
  await expand.focus();
  await page.keyboard.press('Enter');
  await line(page, 2).focus();
  await page.keyboard.press('ArrowDown');
  await expect(line(page, 3)).toBeFocused();
  await expect(line(page, 3)).toHaveAttribute('aria-pressed', 'true');
  const notesButton = page.getByRole('button', { name: /^Designer Notes/ });
  await notesButton.click();
  const notesDialog = page.getByRole('dialog', { name: /^Designer Notes/ });
  await notesDialog.getByRole('textbox', { name: 'Notes for your designer', exact: true }).fill(NOTES);
  const focusables = notesDialog.locator('button:enabled, textarea, input, select, a[href]');
  await focusables.last().focus();
  await page.keyboard.press('Tab');
  expect(await notesDialog.evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(notesDialog).toHaveCount(0);
  await expect(notesButton).toBeFocused();
  const review = await openReview(page);
  await expect(review).toContainText(NOTES);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Review & send/ })).toBeFocused();
});

test('review includes exact Unicode, alternative styles, mixed assignments, notes and customer fields', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  await page.getByRole('combobox', { name: 'Current font style', exact: true }).selectOption('bold');
  await saveFavorite(page, 'Optima');
  await openComparison(page);
  await page.getByRole('combobox', { name: 'Alternative 1 style', exact: true }).selectOption('bold');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Designer Notes/ }).click();
  await page.getByRole('textbox', { name: 'Notes for your designer', exact: true }).fill(NOTES);
  await page.keyboard.press('Escape');
  const review = await openReview(page);
  for (const text of [...PARTS, 'Great Vibes', 'Arial', 'Bold', 'Optima', NOTES]) await expect(review).toContainText(text);
  await expect(review).toContainText(/Sent to Arch/i);
  await expect(review).toContainText(/Preview.only/i);
  await enterCustomer(review);
  await capture(page, 'desktop-review');
  await page.keyboard.press('Escape');
  await expect(wording(page)).toHaveValue(WORDING);
  await page.reload();
  const restored = await openReview(page);
  await expect(restored.getByRole('textbox', { name: /Order number/i })).toHaveValue('ARCH-2048');
  await expect(restored.getByRole('textbox', { name: /Your name/i })).toHaveValue("Ren\u00e9e O'Connor");
  await expect(restored).toContainText(NOTES);
});

test('sending locks duplicate actions, preserves data on failure, retries and retains a downloadable receipt', async ({ page }) => {
  let releaseFirst;
  let attempts = 0;
  const uploads = [];
  const firstAttempt = new Promise(resolve => { releaseFirst = resolve; });
  await page.route(WORKER, async route => {
    expect(route.request().method()).toBe('PUT');
    attempts++;
    uploads.push(route.request().postData());
    if (attempts === 1) {
      await firstAttempt;
      await route.fulfill({ status: 503, body: 'Temporarily unavailable', headers: { 'Access-Control-Allow-Origin': '*' } });
    } else {
      await route.fulfill({ status: 200, body: 'Uploaded', headers: { 'Access-Control-Allow-Origin': '*' } });
    }
  });
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  await saveFavorite(page, 'Optima');
  const review = await openReview(page);
  await enterCustomer(review);
  const send = review.getByRole('button', { name: 'Send my choices to Arch', exact: true });
  await send.click();
  const sending = review.getByRole('button', { name: /Sending/i });
  await expect(sending).toBeDisabled();
  await expect(review.getByRole('textbox', { name: /Order number/i })).toBeDisabled();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(review).toBeVisible();
  await expect.poll(() => attempts).toBe(1);
  releaseFirst();
  await expect(review.getByRole('alert')).toContainText(/couldn.t confirm|could not confirm/i);
  await expect(review.getByRole('textbox', { name: /Order number/i })).toHaveValue('ARCH-2048');
  await expect(review).toContainText(PARTS[0]);
  await review.getByRole('button', { name: 'Try sending again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your choices were received', exact: true })).toBeVisible();
  expect(attempts).toBe(2);
  expect(uploads[1]).toBe(uploads[0]);
  const metadata = await page.evaluate(svg => JSON.parse(new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('metadata').textContent), uploads[1]);
  expect(metadata.text).toBe(WORDING);
  expect(metadata.lines.map(({ fontName }) => fontName)).toEqual(['Great Vibes', 'Arial', 'Garamond']);
  expect(metadata.favorites.map(({ name }) => name)).toEqual(['Optima']);
  expect(metadata.customerName).toBe("Ren\u00e9e O'Connor");
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /^Save receipt/ }).click();
  const download = await downloadPromise;
  const receipt = await readFile(await download.path(), 'utf8');
  expect(receipt).toContain("Ren\u00e9e O'Connor");
  expect(receipt).toContain('ARCH-2048');
  expect(receipt).toContain('Optima');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your choices were received', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Save receipt/ })).toBeVisible();
  expect(attempts).toBe(2);
});

test('a duplicate response explains the conflict and preserves the request for correction', async ({ page }) => {
  let attempts = 0;
  await page.route(WORKER, async route => {
    attempts++;
    await route.fulfill({ status: 409, body: 'Already exists', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await wording(page).fill(WORDING);
  const review = await openReview(page);
  await enterCustomer(review);
  await review.getByRole('button', { name: 'Send my choices to Arch', exact: true }).click();
  await expect(review.getByRole('alert')).toContainText(/already saved/i);
  await expect(review).toContainText(/contact Arch/i);
  expect(attempts).toBe(1);
  await expect(review.getByRole('textbox', { name: /Order number/i })).toHaveValue('ARCH-2048');
  await page.keyboard.press('Escape');
  await expect(wording(page)).toHaveValue(WORDING);
  await expect(page.getByRole('heading', { name: 'Your choices were received', exact: true })).toHaveCount(0);
});

test('mobile supports mixing, its font picker, alternatives and review without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  await saveFavorite(page, 'Garamond');
  await saveFavorite(page, 'Optima');
  await chooseFont(page, 'Optima', 3);
  await expect(line(page, 3)).toHaveAttribute('aria-pressed', 'true');
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial');
  await expectFont(page, 3, 'Optima');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const number of [1, 2, 3]) {
    const box = await line(page, number).boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
    expect(box.height).toBeGreaterThanOrEqual(40);
  }
  await line(page, 1).scrollIntoViewIfNeeded();
  await capture(page, 'mobile-mixed-preview');
  await capture(page, 'mobile-full-workspace', true);
  const comparison = await openComparison(page);
  await expect(comparison.locator('.favorite-slot')).toHaveCount(2);
  await expect(favorite(page, 1)).toContainText('Garamond');
  await expect(favorite(page, 2)).toContainText('Optima');
  await page.keyboard.press('Escape');
  const review = await openReview(page);
  const box = await review.boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeLessThanOrEqual(844);
  await enterCustomer(review);
  await expect(review).toContainText(PARTS[0]);
  await expect(review.getByRole('button', { name: 'Send my choices to Arch', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Optima keeps its ASCII lettering and renders accents and bullets through the verified fallback', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Optima', 1);
  await page.getByRole('button', { name: 'Use this font on all lines', exact: true }).click();
  await expect(page.locator('.preview-section').getByRole('note')).toContainText('\u00e9');
  await expect(page.locator('.preview-section').getByRole('note')).toContainText('\u2022');
  await expect(page.locator('.preview-section').getByRole('note')).toContainText('fallback lettering');
  for (const style of ['regular', 'bold']) {
    await page.getByRole('combobox', { name: 'Current font style', exact: true }).selectOption(style);
    const rendering = await line(page, 1).locator('.line-wording').evaluate(async element => {
      const actual = getComputedStyle(element).fontFamily;
      await document.fonts.load(`64px ${actual}`, 'W');
      await document.fonts.load('64px Arial', '\u00e9\u2022W');
      await document.fonts.ready;
      const render = (family, character) => {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.font = `64px ${family}`;
        context.fillStyle = '#000';
        context.fillText(character, 16, 90);
        return Array.from(context.getImageData(0, 0, 120, 120).data);
      };
      const ascii = render(actual, 'W');
      const fallbackAscii = render('Arial', 'W');
      return {
        actual,
        accents: ['\u00e9', '\u2022'].map(character => {
          const chosen = render(actual, character);
          const fallback = render('Arial', character);
          return { character, matchesFallback: chosen.every((value, index) => value === fallback[index]), hasInk: chosen.some((value, index) => index % 4 === 3 && value > 0) };
        }),
        asciiDistinct: ascii.some((value, index) => value !== fallbackAscii[index]),
      };
    });
    expect(rendering.actual).toContain(style === 'bold' ? 'Optima Bold' : 'Optima');
    expect(rendering.asciiDistinct, 'Optima must retain its own original ASCII letterforms').toBe(true);
    for (const glyph of rendering.accents) {
      expect(glyph.hasInk, `${style} ${glyph.character} must never be an invisible glyph`).toBe(true);
      expect(glyph.matchesFallback, `${style} ${glyph.character} must use the verified Arial fallback`).toBe(true);
    }
  }
  await expect(wording(page)).toHaveValue(WORDING);
});

test('a fourth alternative requires explicit replacement and cancel keeps all three choices', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  for (const name of ['Garamond', 'Arial', 'Optima']) await saveFavorite(page, name);
  const search = page.getByRole('searchbox', { name: 'Search fonts', exact: true });
  await search.fill('Montserrat');
  await page.getByRole('button', { name: 'Add Montserrat to comparison', exact: true }).click();
  let replacement = page.getByRole('dialog', { name: /Montserrat/ });
  await expect(replacement).toContainText(/three alternatives|three comparison options/i);
  await replacement.getByRole('button', { name: /Keep my/ }).click();
  await openComparison(page);
  for (const [index, font] of ['Garamond', 'Arial', 'Optima'].entries()) await expect(favorite(page, index + 1)).toContainText(font);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Add Montserrat to comparison', exact: true }).click();
  replacement = page.getByRole('dialog', { name: /Montserrat/ });
  await replacement.getByRole('button', { name: 'Replace Arial', exact: true }).click();
  await openComparison(page);
  await expect(page.locator('.favorite-slot')).toHaveCount(3);
  await expect(favorite(page, 2)).toContainText('Montserrat');
  await expectFont(page, 1, 'Great Vibes');
});

test('Fit to Preview restores a readable full-line view after increasing preview size', async ({ page }) => {
  await wording(page).fill("Ren\u00e9e O'Connor - Excellence in Research & Development\nDirector, R&D\nSt. Louis \u2022 2026");
  await page.locator('.preview-adjustments summary').click();
  const size = page.getByRole('slider', { name: 'Size', exact: true });
  await size.fill('100');
  await expect(page.getByRole('button', { name: /Fit to Preview$/ })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: /Fit to Preview$/ }).click();
  await expect(page.getByRole('button', { name: /Fit to Preview$/ })).toHaveAttribute('aria-pressed', 'true');
  const canvas = page.locator('.preview-section .engraving-canvas');
  const canvasBox = await canvas.boundingBox();
  for (const number of [1, 2, 3]) {
    const textBox = await line(page, number).locator('.line-wording').boundingBox();
    expect(textBox.x).toBeGreaterThanOrEqual(canvasBox.x);
    expect(textBox.x + textBox.width).toBeLessThanOrEqual(canvasBox.x + canvasBox.width);
    expect(textBox.y + textBox.height).toBeLessThanOrEqual(canvasBox.y + canvasBox.height);
  }
  await expect(line(page, 1).locator('.line-wording')).toHaveText("Ren\u00e9e O'Connor - Excellence in Research & Development");
});

test('inserting and removing an intentional blank line retains each existing line and its lettering', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Arial', 2);
  const withBlank = `${PARTS[0]}\n\n${PARTS[1]}\n${PARTS[2]}`;
  await wording(page).fill(withBlank);
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 3, 'Arial');
  await expectFont(page, 4, 'EB Garamond Regular');
  const blank = page.getByRole('button', { name: 'Edit line 2: Blank line', exact: true });
  await blank.click();
  await expect(blank).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.catalog-target')).toContainText('Editing line 2');
  await expect(page.locator('.active-line-toolbar')).toContainText('Line 2');
  await page.reload();
  await expect(wording(page)).toHaveValue(withBlank);
  await expect(blank).toHaveAttribute('aria-pressed', 'true');
  const review = await openReview(page);
  expect(await review.locator('.exact-wording').textContent()).toBe(withBlank);
  await expect(review.locator('.line-summary tbody tr')).toHaveCount(4);
  await page.keyboard.press('Escape');
  await wording(page).fill(WORDING);
  await expectFont(page, 1, 'Great Vibes');
  await expectFont(page, 2, 'Arial');
  await expectFont(page, 3, 'EB Garamond Regular');
  await expect(wording(page)).toHaveValue(WORDING);
});

test('returning to a font restores its chosen style before and after reload', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Arial', 2);
  await page.getByRole('combobox', { name: 'Current font style', exact: true }).selectOption('bold');
  await expectFont(page, 2, 'Arial Bold');
  await chooseFont(page, 'Graphik', 2);
  await expectFont(page, 2, 'Graphik');
  await chooseFont(page, 'Arial', 2);
  await expect(page.getByRole('combobox', { name: 'Current font style', exact: true })).toHaveValue('bold');
  await expectFont(page, 2, 'Arial Bold');
  await page.reload();
  await expectFont(page, 2, 'Arial Bold');
  await chooseFont(page, 'Graphik', 2);
  await chooseFont(page, 'Arial', 2);
  await expect(page.getByRole('combobox', { name: 'Current font style', exact: true })).toHaveValue('bold');
  await expectFont(page, 2, 'Arial Bold');
  await expectFont(page, 1, 'EB Garamond Regular');
});

test('font rows preview the exact active line in standard and wider modes', async ({ page }) => {
  await wording(page).fill(WORDING);
  for (const expanded of [false, true]) {
    if (expanded) await page.getByRole('button', { name: 'Wider font rail', exact: true }).click();
    for (const number of [1, 2, 3]) {
      await line(page, number).click();
      await expect(page.locator('.catalog-target')).toContainText(`Editing line ${number}`);
      await expect(page.locator('.catalog-target strong')).toHaveText(PARTS[number - 1]);
      await expect(page.locator('.catalog .font-specimen')).toHaveText(Array(37).fill(PARTS[number - 1]));
    }
  }
});

async function previewGeometry(page) {
  return page.locator('.preview-section .engraving-canvas').evaluate(canvas => {
    const bounds = canvas.getBoundingClientRect();
    const computed = getComputedStyle(canvas);
    const contentTop = bounds.top + parseFloat(computed.borderTopWidth) + parseFloat(computed.paddingTop);
    const contentBottom = bounds.bottom - parseFloat(computed.borderBottomWidth) - parseFloat(computed.paddingBottom);
    const rows = Array.from(canvas.querySelectorAll('.engraving-line')).map(button => {
      const text = button.querySelector('.line-wording');
      const box = text.getBoundingClientRect();
      const row = button.getBoundingClientRect();
      return { text: text.textContent, height: box.height, top: box.top, bottom: box.bottom, hitTop: row.top, hitBottom: row.bottom, wrapped: text.querySelectorAll('tspan').length > 0 || text.childNodes.length !== 1, baseline: Number(text.dataset.baseline) };
    });
    return { rows, contentTop, contentBottom, scrollHeight: canvas.scrollHeight, clientHeight: canvas.clientHeight, scrollWidth: canvas.scrollWidth, clientWidth: canvas.clientWidth, size: computed.getPropertyValue('--engraving-size') };
  });
}

test('first expansion automatically fits all mixed lines without wrapping or concealed overflow', async ({ page }) => {
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  await chooseFont(page, 'Copperplate', 2);
  await chooseFont(page, 'Garamond', 3);
  await expect(page.getByRole('button', { name: /Fit to Preview$/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Wider font rail', exact: true }).click();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const geometry = await previewGeometry(page);
  await test.info().attach('first-expansion-geometry', { body: JSON.stringify(geometry, null, 2), contentType: 'application/json' });
  await capture(page, 'desktop-expanded');
  expect(geometry.rows.map(row => row.text)).toEqual(PARTS);
  expect(geometry.rows.filter(row => row.wrapped), 'Each entered line must occupy exactly one visual line').toEqual([]);
  expect(geometry.scrollHeight, 'Automatic fit must not hide rows inside a vertically scrollable preview').toBeLessThanOrEqual(geometry.clientHeight + 1);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  for (const row of geometry.rows) {
    expect(row.top).toBeGreaterThanOrEqual(geometry.contentTop - 1);
    expect(row.bottom).toBeLessThanOrEqual(geometry.contentBottom + 1);
  }
});

test('mobile changes the exact active line inside the picker without returning to the preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await wording(page).fill(WORDING);
  await chooseFont(page, 'Great Vibes', 1);
  for (const { number, font } of [{ number: 2, font: 'Arial' }, { number: 3, font: 'Optima' }]) {
    await page.getByRole('button', { name: /^Choose lettering/ }).click();
    const picker = page.getByRole('dialog', { name: 'Choose lettering', exact: true });
    const catalog = picker.locator('.catalog');
    const target = catalog.getByRole('combobox', { name: 'Line to edit', exact: true });
    await expect(target).toBeInViewport();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await target.selectOption(String(number - 1));
    expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore), 'Changing the target must not leave the picker or scroll the underlying workspace').toBeLessThanOrEqual(1);
    await expect(target).toHaveValue(String(number - 1));
    await expect(catalog.locator('.catalog-target')).toContainText(`Editing line ${number}`);
    await expect(catalog.locator('.catalog-target strong')).toHaveText(PARTS[number - 1]);
    await catalog.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill(font);
    await catalog.getByRole('button', { name: `Apply ${font} to line ${number}`, exact: true }).click();
    await expect(picker).toHaveCount(0);
    await expect(line(page, number)).toHaveAttribute('aria-pressed', 'true');
    await expectFont(page, number, font);
    await expectFont(page, 1, 'Great Vibes');
  }
  await expectFont(page, 2, 'Arial');
  await page.getByRole('button', { name: /^Choose lettering/ }).click();
  await expect(page.getByRole('combobox', { name: 'Line to edit', exact: true })).toHaveValue('2');
  await capture(page, 'mobile-font-picker');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
