import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const request = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()))
      throw new Error(`Unexpected write: ${request.method()}`);
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname))
      return route.abort();
    return route.continue();
  });
  await page.goto("/");
});

test("rail specimens, direct application and comparison use the same remembered style", async ({
  page,
}) => {
  await page
    .getByLabel("Your engraving wording")
    .fill("CEO\nInternational Development Department");
  await page
    .getByRole("button", { name: "Apply Arial to line 1", exact: true })
    .click();
  await page.getByLabel("Current font style").selectOption("bold");
  await page.getByRole("button", { name: /^Edit line 2:/ }).click();
  const apply = page.getByRole("button", {
    name: "Apply Arial to line 2",
    exact: true,
  });
  await expect(apply.locator(".font-specimen")).toHaveCSS(
    "font-family",
    /Arial Bold/,
  );
  await apply.click();
  await expect(page.getByLabel("Current font style")).toHaveValue("bold");
  await expect(
    page.locator('.engraving-line[data-line="1"] .line-wording'),
  ).toHaveCSS("font-family", /Arial Bold/);
  await page
    .getByRole("button", { name: "Apply Graphik to line 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Arial to comparison", exact: true })
    .click();
  await page.getByRole("button", { name: /^Compare options/ }).click();
  await expect(page.getByLabel("Alternative 1 style")).toHaveValue("bold");
  await expect(
    page.locator(".comparison-item .line-wording").first(),
  ).toHaveCSS("font-family", /Arial Bold/);
});

test("active line, filters, rail width and preview controls persist together without changing authored wording", async ({
  page,
}) => {
  const wording = "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026";
  await page.getByLabel("Your engraving wording").fill(wording);
  await page.getByRole("button", { name: /^Edit line 3:/ }).click();
  await page
    .getByRole("button", { name: "Wider font rail", exact: true })
    .click();
  await page.getByRole("button", { name: "Serif", exact: true }).click();
  await page.getByLabel("Search fonts").fill("Garamond");
  await page.locator(".preview-adjustments summary").click();
  await page
    .getByRole("slider", { name: "Line spacing", exact: true })
    .fill("1.25");
  await page
    .getByRole("slider", { name: "Letter spacing", exact: true })
    .fill("0.05");
  await page.getByRole("button", { name: "Align right", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Your engraving wording")).toHaveValue(wording);
  await expect(page.locator('.engraving-line[data-line="2"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("button", { name: "Standard font rail", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Serif", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Search fonts")).toHaveValue("Garamond");
  await expect(page.locator(".font-option")).toHaveCount(1);
  await expect(
    page.locator(".preview-section .engraving-canvas"),
  ).toHaveAttribute("data-preview-spacing", "1.25");
  await expect(
    page.locator(".preview-section .engraving-canvas"),
  ).toHaveAttribute("data-preview-letter-spacing", "0.05");
  await page.locator(".preview-adjustments summary").click();
  await expect(
    page.getByRole("button", { name: "Align right", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    page.locator(".preview-section .engraving-canvas"),
  ).toHaveAttribute("data-preview-spacing", "1");
  await expect(
    page.locator(".preview-section .engraving-canvas"),
  ).toHaveAttribute("data-preview-letter-spacing", "0");
});
