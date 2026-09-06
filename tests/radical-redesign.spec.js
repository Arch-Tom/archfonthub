import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { allFonts } from "../src/fontLibrary.js";

const wording = "Ren\u00e9e O'Connor\nDirector, R&D\nSt. Louis \u2022 2026";
const compare = (page) =>
  page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
const browse = (page) =>
  page.getByRole("button", { name: "Browse fonts", exact: true }).click();

// All writes are blocked unless a test explicitly installs a mocked response.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      await route.abort();
      throw new Error(`Unexpected upload blocked: ${request.url()}`);
    }
    return ["localhost", "127.0.0.1"].includes(new URL(request.url()).hostname)
      ? route.continue()
      : route.abort();
  });
  await page.goto("/");
});

test("the complete catalog previews actual wording while workspace changes preserve selections", async ({ page }) => {
  const catalog = page.locator(".font-catalog");
  await expect(catalog.getByRole("button")).toHaveCount(allFonts.length);
  expect(allFonts.length).toBeGreaterThanOrEqual(37);
  await expect(page.locator(".count-badge")).toHaveText("0 of 3 selected");
  await page.getByLabel("Your engraving wording", { exact: true }).fill(wording);
  await expect(catalog.locator(".font-sample")).toHaveCount(allFonts.length);
  for (const preview of await catalog.locator(".font-sample").all())
    await expect(preview).toHaveText(wording.split("\n")[0]);
  await page.getByRole("button", { name: "Larger samples" }).click();
  for (const preview of await catalog.locator(".font-sample").all())
    await expect(preview).toHaveText(wording);
  await page.getByRole("button", { name: "Compact samples" }).click();
  await page.getByRole("button", { name: "Add Arial to favorites", exact: true }).click();
  await expect(catalog).toBeVisible();
  await compare(page);
  await expect(catalog).toBeHidden();
  await page.getByLabel("Arial style").selectOption("boldItalic");
  await page.locator(".notes-disclosure summary").click();
  await page.getByLabel("Designer Notes").fill("Keep the punctuation and line breaks.");
  await browse(page);
  await expect(page.getByRole("button", { name: "Remove Arial from favorites", exact: true }))
    .toHaveAttribute("aria-pressed", "true");
  await compare(page);
  await expect(page.getByLabel("Arial style")).toHaveValue("boldItalic");
  await expect(page.getByLabel("Designer Notes")).toHaveValue("Keep the punctuation and line breaks.");
  await expect(page.getByRole("article", { name: "Favorite 1: Arial" }).locator(".wording-preview"))
    .toHaveText(wording);
  await expect(page.getByRole("button", { name: "Compare choices", exact: true }).first())
    .toHaveAttribute("aria-pressed", "true");
});

test("search and category combine without losing favorites and no-result recovery restores the catalog", async ({ page }) => {
  await page.getByLabel("Your engraving wording", { exact: true }).fill(wording);
  await page.getByRole("button", { name: "Add Arial to favorites", exact: true }).click();
  await compare(page);
  await page.getByLabel("Arial style").selectOption("bold");
  await browse(page);
  const search = page.getByRole("searchbox", { name: "Search fonts" });
  await search.fill("gArAmOnD");
  await expect(page.locator(".font-catalog .font-option")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Add Garamond to favorites", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Script", exact: true }).click();
  await expect(page.locator(".font-catalog .font-option")).toHaveCount(0);
  await expect(page.locator(".empty-search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Script", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator(".empty-search").getByRole("button").click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".font-catalog .font-option")).toHaveCount(allFonts.length);
  await compare(page);
  await expect(page.getByLabel("Arial style")).toHaveValue("bold");
  await expect(page.locator(".count-badge")).toHaveText("1 of 3 selected");
});

test("390px review recovers from failure and downloads the exact persisted receipt", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const payloads = [];
  await page.route("**/*.workers.dev/**", (route) => {
    payloads.push({ url: route.request().url(), body: route.request().postData() });
    return route.fulfill({
      status: payloads.length === 1 ? 503 : 200,
      body: payloads.length === 1 ? "Test failure" : "Saved locally by test",
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await page.getByLabel("Your engraving wording", { exact: true }).fill(wording);
  await page.getByRole("button", { name: "Add Arial to favorites", exact: true }).click();
  await compare(page);
  await page.getByLabel("Arial style").selectOption("bold");
  await page.locator(".notes-disclosure summary").click();
  const notes = "UX TEST ONLY \u2014 NOT A REAL PRODUCTION ORDER\nKeep \u2022 and \u00e9.";
  await page.getByLabel("Designer Notes").fill(notes);
  await page.getByRole("button", { name: "Review my choices" }).click();
  await page.getByLabel("Order number").fill("900526");
  await page.getByLabel("Your name").fill("Astra UX Test");
  await page.getByLabel("Company").fill("Arch UX Test");
  await page.getByRole("button", { name: "Send my choices to Arch" }).click();
  await expect(page.getByRole("alert")).toContainText("couldn\u2019t confirm");
  await expect(page.locator(".exact-wording")).toHaveText(wording);
  await expect(page.locator(".exact-notes")).toHaveText(notes);
  await expect(page.getByLabel("Your name")).toHaveValue("Astra UX Test");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Try sending again" }).click();
  await expect(page.getByRole("heading", { name: "Your choices are in." })).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(payloads[0]).toEqual(payloads[1]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your choices are in." })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save receipt" }).click();
  const download = await downloadPromise;
  const receipt = await readFile(await download.path(), "utf8");
  expect(receipt).toContain(wording);
  expect(receipt).toContain(notes);
  expect(receipt).toContain("Order: 900526");
  expect(receipt).toContain("Customer: Astra UX Test");
  expect(receipt).toContain("Arial \u2014 Bold");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(payloads).toHaveLength(2);
});


test("comparison fits complete Graphik lines after a selected font style loads late", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let releaseFont;
  let fontRequested = false;
  const fontGate = new Promise((resolve) => { releaseFont = resolve; });
  await page.route("**/fonts/Graphik-Semibold.otf", async (route) => {
    fontRequested = true;
    await fontGate;
    await route.continue();
  });
  await page.getByLabel("Your engraving wording", { exact: true }).fill(wording);
  for (const name of ["Graphik", "Garamond", "Arial"])
    await page.getByRole("button", { name: `Add ${name} to favorites`, exact: true }).click();
  await compare(page);
  const preview = page.getByRole("article", { name: "Favorite 1: Graphik" }).locator(".wording-preview");
  await expect(preview).toHaveText(wording);
  // This style is requested only after the initial document fonts have loaded.
  await page.evaluate(() => document.fonts.ready);
  await page.getByLabel("Graphik style").selectOption("semibold");
  await expect.poll(() => fontRequested).toBe(true);
  expect(await page.evaluate(() => [...document.fonts].find((face) => face.family.includes("Graphik Semibold"))?.status)).toBe("loading");
  releaseFont();
  await expect.poll(() => page.evaluate(() => [...document.fonts].find((face) => face.family.includes("Graphik Semibold"))?.status)).toBe("loaded");
  await expect.poll(() => preview.evaluate((element) => {
    const textNode = element.firstChild;
    let start = 0;
    return element.textContent.split("\n").map((line) => {
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, start + line.length);
      start += line.length + 1;
      return [...range.getClientRects()].filter((rect) => rect.width > 0).length;
    });
  })).toEqual([1, 1, 1]);
  expect(await preview.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(24);
  // Returning from the hidden browse view must retain the fitted font and size.
  await browse(page);
  await compare(page);
  await expect(preview).toHaveText(wording);
  expect(await preview.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("390px workspace, replacement and wording editing keep keyboard focus at the task", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const wordingField = page.getByLabel("Your engraving wording", { exact: true });
  await wordingField.fill(wording);
  for (const name of ["Arial", "Garamond", "Great Vibes"]) {
    const option = page.getByRole("button", { name: `Add ${name} to favorites`, exact: true });
    await option.focus();
    await page.keyboard.press("Space");
  }
  const compareButton = page.getByRole("button", { name: "Compare choices", exact: true });
  await compareButton.focus();
  await page.keyboard.press("Enter");
  const comparison = page.locator(".favorites-panel");
  await expect(comparison).toBeFocused();
  await expect(page.getByRole("heading", { name: "Your lettering choices" })).toBeInViewport();
  await page.getByRole("button", { name: "Edit wording" }).focus();
  await page.keyboard.press("Enter");
  await expect(wordingField).toBeFocused();
  await expect(wordingField).toBeInViewport();
  await page.getByRole("button", { name: "Browse fonts", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".font-section")).toBeFocused();
  await page.getByRole("button", { name: "Add Calibri to favorites", exact: true }).focus();
  await page.keyboard.press("Space");
  const limit = page.getByRole("alert");
  await expect(limit).toBeFocused();
  await expect(limit).toBeInViewport();
  await page.keyboard.press("Tab");
  await expect(limit.getByRole("button", { name: "Arial", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(comparison).toBeFocused();
  await expect(page.getByRole("article", { name: "Favorite 1: Calibri" })).toBeVisible();
  await page.getByRole("button", { name: "Remove Calibri", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(comparison).toBeFocused();
  await expect(page.locator(".count-badge")).toHaveText("2 of 3 selected");
});


test("390px guided action follows readiness and larger comparison preserves all wording", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Enter wording", exact: true }).click();
  const wordingField = page.getByLabel("Your engraving wording", { exact: true });
  await expect(wordingField).toBeFocused();
  await wordingField.fill(wording);
  await page.getByRole("button", { name: "Choose a font", exact: true }).click();
  await expect(page.locator(".font-section")).toBeFocused();
  for (const name of ["Arial", "Garamond", "Graphik"])
    await page.getByRole("button", { name: `Add ${name} to favorites`, exact: true }).click();
  await expect(page.getByRole("button", { name: "Review my choices", exact: true })).toBeVisible();
  await compare(page);
  const previews = page.locator(".favorite-card .wording-preview");
  await expect(previews).toHaveCount(3);
  const compactHeight = (await previews.first().boundingBox()).height;
  await page.getByRole("button", { name: "Larger previews", exact: true }).click();
  await expect.poll(async () => (await previews.first().boundingBox()).height).toBeGreaterThan(compactHeight);
  for (const preview of await previews.all()) await expect(preview).toHaveText(wording);
  await page.getByRole("button", { name: "Compact previews", exact: true }).click();
  await expect.poll(async () => (await previews.first().boundingBox()).height).toBe(compactHeight);
  for (const preview of await previews.all()) await expect(preview).toHaveText(wording);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
