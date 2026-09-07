import { test, expect } from '@playwright/test';

const WORDING = "Ren\u00e9e O'Connor\nDirector, R&D\nSt. Louis \u2022 2026";
const PARTS = WORDING.split('\n');
const line = (page, number) => page.getByRole('button', { name: new RegExp(`^Edit line ${number}:`) });
const rail = page => page.locator('.catalog:visible');

// Keep this experiment entirely local. Any accidental real write fails the test.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      await route.abort();
      throw new Error(`Unexpected network write blocked: ${request.method()} ${request.url()}`);
    }
    if (!['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname)) return route.abort();
    return route.continue();
  });
  await page.goto('/');
});

test('the desktop right rail fills the working height and keeps its controls available while fonts scroll', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Your engraving wording', exact: true }).fill(WORDING);
  const catalog = rail(page);
  const preview = await page.locator('.preview-section').boundingBox();
  const bounds = await catalog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(preview.x + preview.width - 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(930);
  expect(bounds.height).toBeGreaterThanOrEqual(720);
  const search = catalog.getByRole('searchbox', { name: 'Search fonts', exact: true });
  const category = catalog.getByRole('button', { name: 'All', exact: true });
  const current = page.getByRole('combobox', { name: 'Current font style', exact: true });
  for (const control of [search, category, current, catalog.locator('.catalog-target')]) await expect(control).toBeInViewport({ ratio: 1 });
  const list = catalog.locator('.font-grid');
  await expect(list.locator('.font-option')).toHaveCount(37);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(list.locator('.font-option').last()).toBeInViewport();
  for (const control of [search, category, current, catalog.locator('.catalog-target')]) await expect(control).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  const layout = await list.evaluate(element => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, scrollTop: element.scrollTop }));
  expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);
  expect(layout.scrollTop).toBeGreaterThan(0);
  await search.fill('Optima');
  await expect(catalog.getByRole('button', { name: 'Apply Optima to line 1', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1365);
});

test('click line then click font works with zero comparison options and uses explicit secondary actions', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Your engraving wording', exact: true }).fill(WORDING);
  await expect(page.locator('.favorite-slot')).toHaveCount(0);
  await line(page, 2).click();
  await expect(rail(page).locator('.catalog-target')).toContainText(PARTS[1]);
  await rail(page).getByRole('searchbox', { name: 'Search fonts', exact: true }).fill('Arial');
  await rail(page).getByRole('button', { name: 'Apply Arial to line 2', exact: true }).click();
  await expect(line(page, 2).locator('.line-wording')).toHaveCSS('font-family', /Arial/);
  for (const number of [1, 3]) await expect(line(page, number).locator('.line-wording')).toHaveCSS('font-family', /EB Garamond Regular/);
  await expect(rail(page).getByRole('button', { name: 'Add Arial to comparison', exact: true })).toBeVisible();
  expect(await rail(page).textContent()).not.toMatch(/[\u2605\u2606]/u);
  await page.getByRole('button', { name: /^Compare options/ }).click();
  const comparison = page.getByRole('dialog', { name: /Compare/ });
  await expect(comparison.locator('.favorite-slot')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('.site-header').getByRole('button', { name: /^Review & send/ }).click();
  const review = page.getByRole('dialog', { name: 'Review your request', exact: true });
  await expect(review).toContainText('Alternative lettering styles');
  await expect(review.locator('.line-summary tbody tr')).toHaveCount(3);
  await expect(review.locator('.line-summary tbody tr').nth(1)).toContainText('Arial');
  await expect(review.getByRole('button', { name: 'Send my choices to Arch', exact: true })).toBeEnabled();
});

test('mobile line selection opens the same font picker and applying restores focus to its exact line', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('textbox', { name: 'Your engraving wording', exact: true }).fill(WORDING);
  await line(page, 1).click();
  let picker = page.getByRole('dialog', { name: /Choose lettering/ });
  await expect(picker).toBeVisible();
  await expect(picker.locator('.catalog-target')).toContainText(PARTS[0]);
  await picker.getByRole('combobox', { name: 'Line to edit', exact: true }).selectOption('1');
  await expect(picker.locator('.catalog-target')).toContainText(PARTS[1]);
  await picker.getByRole('searchbox', { name: 'Search fonts', exact: true }).fill('Arial');
  await picker.getByRole('button', { name: 'Apply Arial to line 2', exact: true }).click();
  await expect(picker).toHaveCount(0);
  await expect(line(page, 2)).toHaveAttribute('aria-pressed', 'true');
  await expect(line(page, 2)).toBeFocused();
  await expect(line(page, 2).locator('.line-wording')).toHaveCSS('font-family', /Arial/);
  await expect(line(page, 1).locator('.line-wording')).toHaveCSS('font-family', /EB Garamond Regular/);
  await line(page, 3).click();
  picker = page.getByRole('dialog', { name: /Choose lettering/ });
  await expect(picker.locator('.catalog-target')).toContainText(PARTS[2]);
  const bounds = await picker.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.height).toBeLessThanOrEqual(844);
  await page.keyboard.press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(line(page, 3)).toBeFocused();
  const choose = page.getByRole('button', { name: /^Choose lettering/ });
  await choose.click();
  await expect(picker).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(choose).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
