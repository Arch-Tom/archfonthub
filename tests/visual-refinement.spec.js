import { test, expect } from "@playwright/test";
const wording = "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026";
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()))
      throw new Error("Unexpected upload in visual regression test");
    return ["localhost", "127.0.0.1"].includes(new URL(request.url()).hostname)
      ? route.continue()
      : route.abort();
  });
  await page.goto("/");
});
test("comparison specimen remains unselected until explicitly kept and can be removed", async ({
  page,
}) => {
  await expect(page.locator(".count-badge")).toHaveText("0 of 3 selected");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await expect(
    page.locator(".inspiration-preview .wording-preview"),
  ).toHaveText(wording);
  await expect(
    page.getByText(
      "Nothing selected yet. Add a font to compare your wording.",
    ),
  ).toBeVisible();
  await expect(page.locator(".favorite-card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Keep Garamond +", exact: true })
    .click();
  await expect(page.locator(".count-badge")).toHaveText("1 of 3 selected");
  await expect(page.getByLabel("Garamond style")).toHaveValue("v2_regular");
  await page
    .getByRole("button", { name: "Remove Garamond", exact: true })
    .click();
  await expect(page.locator(".count-badge")).toHaveText("0 of 3 selected");
  await expect(
    page.locator(".inspiration-preview .wording-preview"),
  ).toHaveText(wording);
});
test("narrow, tablet and 200-percent-zoom-equivalent layouts keep controls within page width", async ({
  page,
}) => {
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await page
    .getByRole("button", { name: "Keep Garamond +", exact: true })
    .click();
  for (const [width, height] of [
    [320, 640],
    [390, 844],
    [683, 465],
    [768, 930],
    [1024, 768],
    [1365, 930],
  ]) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await expect(page.getByLabel("Garamond style")).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Review my choices" }).click();
  await expect(page.getByLabel("Order number")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
