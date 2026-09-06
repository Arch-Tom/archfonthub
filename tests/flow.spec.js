import { test, expect } from "@playwright/test";
const wording = "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026";
let writes;
test.beforeEach(async ({ page }) => {
  writes = [];
  await page.route("**/*", (route) => {
    const req = route.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method())) {
      writes.push(req);
      return route.abort();
    }
    if (!["localhost", "127.0.0.1"].includes(new URL(req.url()).hostname))
      return route.abort();
    return route.continue();
  });
});
async function choose(page) {
  await page.goto("/");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  for (const font of ["Arial", "Garamond", "Great Vibes"])
    await page
      .getByRole("button", { name: `Add ${font} to favorites`, exact: true })
      .click();
}
async function review(page) {
  await choose(page);
  await page.locator(".notes-disclosure summary").click();
  await page
    .getByLabel("Designer Notes")
    .fill("UX TEST ONLY — NOT A REAL PRODUCTION ORDER");
  await page.getByRole("button", { name: "Review my choices" }).click();
  await page.getByLabel("Order number").fill("900526");
  await page.getByLabel("Your name").fill("Astra UX Test");
  await page.getByLabel("Company").fill("Arch UX Test");
}

test("desktop comparison retains Unicode, styles and favorites through edits, filtering and reload", async ({
  page,
}) => {
  await choose(page);
  await expect(page.locator(".count-badge")).toHaveText("3 of 3 selected");
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await expect(page.locator(".favorite-card .wording-preview")).toHaveCount(3);
  for (const preview of await page
    .locator(".favorite-card .wording-preview")
    .all())
    await expect(preview).toHaveText(wording);
  await page.getByLabel("Arial style").selectOption("bold");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording + "\nThank you!");
  await page.getByRole("button", { name: "Browse fonts", exact: true }).click();
  await page.getByRole("button", { name: "Script", exact: true }).click();
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await expect(page.getByLabel("Arial style")).toHaveValue("bold");
  await expect(
    page.getByRole("article", { name: "Favorite 1: Arial" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("Your engraving wording", { exact: true }),
  ).toHaveValue(wording + "\nThank you!");
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await expect(page.getByLabel("Arial style")).toHaveValue("bold");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "artifacts/v3-desktop.png", fullPage: true });
  expect(writes).toHaveLength(0);
});

test("three-font limit offers immediate replacement, and favorites remove/replace directly", async ({
  page,
}) => {
  await choose(page);
  await page
    .getByRole("button", { name: "Add Calibri to favorites", exact: true })
    .click();
  const limit = page.getByRole("alert");
  await expect(limit).toContainText("You have 3 favorites.");
  await limit.getByRole("button", { name: "Arial", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Favorite 1: Calibri" }),
  ).toBeVisible();
  await page
    .getByRole("article", { name: "Favorite 2: Garamond" })
    .getByRole("button", { name: "Replace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Times New Roman to favorites" })
    .click();
  await expect(
    page.getByRole("article", { name: "Favorite 2: Times New Roman" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Calibri", exact: true })
    .click();
  await expect(page.locator(".count-badge")).toHaveText("2 of 3 selected");
  await page.getByRole("button", { name: "Browse fonts", exact: true }).click();
  await page.getByRole("button", { name: "Larger samples" }).click();
  await expect(page.locator(".font-catalog")).toHaveClass(/expanded/);
  expect(writes).toHaveLength(0);
});

test("review, slow submission, double click prevention and persistent receipt", async ({
  page,
}) => {
  let resolveUpload;
  let attempts = 0;
  let payload;
  await page.route("**/*.workers.dev/**", async (route) => {
    attempts++;
    payload = route.request().postData();
    await new Promise((resolve) => {
      resolveUpload = resolve;
    });
    await route.fulfill({
      status: 200,
      body: "File uploaded successfully",
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await review(page);
  await expect(page.locator(".exact-wording")).toHaveText(wording);
  await expect(page.locator(".exact-notes")).toHaveText(
    "UX TEST ONLY — NOT A REAL PRODUCTION ORDER",
  );
  await page.screenshot({ path: "artifacts/v3-review.png", fullPage: true });
  const send = page.getByRole("button", { name: "Send my choices to Arch" });
  await send.dblclick();
  await expect(
    page.getByRole("button", { name: "Sending…", exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("Order number")).toBeDisabled();
  await expect.poll(() => attempts).toBe(1);
  expect(payload).toContain("Renée O&apos;Connor");
  expect(payload).toContain("Director, R&amp;D");
  expect(payload).toContain("St. Louis • 2026");
  resolveUpload();
  await expect(
    page.getByRole("heading", { name: "Your choices are in." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Order 900526" }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/v3-receipt.png", fullPage: true });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your choices are in." }),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save receipt" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Arch-lettering-receipt.txt");
  expect(attempts).toBe(1);
});

for (const failure of ["server", "network", "duplicate"])
  test(`${failure} failure stays in review with data and explicit feedback`, async ({
    page,
  }) => {
    let attempts = 0;
    await page.route("**/*.workers.dev/**", async (route) => {
      attempts++;
      if (failure === "network") return route.abort("failed");
      return route.fulfill({
        status: failure === "duplicate" ? 409 : 500,
        body: "Test error",
        headers: { "access-control-allow-origin": "*" },
      });
    });
    await review(page);
    await page.getByRole("button", { name: "Send my choices to Arch" }).click();
    await expect(page.getByRole("alert")).toContainText(
      failure === "duplicate" ? "already saved" : "couldn’t confirm",
    );
    await expect(page.getByLabel("Your name")).toHaveValue("Astra UX Test");
    await expect(page.getByLabel("Order number")).toHaveValue("900526");
    await expect(page.locator(".exact-wording")).toHaveText(wording);
    await expect(
      page.getByRole("heading", { name: "Your choices are in." }),
    ).toHaveCount(0);
    expect(attempts).toBe(1);
    await page.screenshot({
      path: `artifacts/v3-${failure}.png`,
      fullPage: true,
    });
  });

test("prefilled orders always review first; empty or whitespace identity cannot submit", async ({
  page,
}) => {
  await page.goto(
    "/?orderId=900526&name=Astra%20UX%20Test&company=Arch%20UX%20Test",
  );
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  await page.getByRole("button", { name: "Add Garamond to favorites" }).click();
  await page.getByRole("button", { name: "Review my choices" }).click();
  await expect(page.getByLabel("Your name")).toHaveValue("Astra UX Test");
  expect(writes).toHaveLength(0);
  await page.getByLabel("Your name").fill("   ");
  await page.getByRole("button", { name: "Send my choices to Arch" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Please enter your order number and name.",
  );
  expect(writes).toHaveLength(0);
});

test("390px layout and keyboard offer clear focus and readable favorites", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  await page.getByRole("button", { name: "Add Garamond to favorites" }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Remove Garamond from favorites" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Remove Garamond from favorites" }),
  ).toContainText("Selected");
  const focus = await page
    .getByRole("button", { name: "Remove Garamond from favorites" })
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(focus).not.toBe("none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "artifacts/v3-mobile.png", fullPage: true });
  await page.locator(".mobile-shortlist a").click();
  await expect(
    page.getByRole("heading", { name: "Your lettering choices" }),
  ).toBeInViewport();
  await page.screenshot({ path: "artifacts/v3-mobile-favorites.png" });
  expect(writes).toHaveLength(0);
});

test("corrected linked identity survives reload, and a newer order draft takes precedence over an old receipt", async ({
  page,
}) => {
  await page.route("**/*.workers.dev/**", (route) =>
    route.fulfill({
      status: 200,
      body: "Saved",
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page.goto("/?orderId=900526&name=Original");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill(wording);
  await page.getByRole("button", { name: "Add Garamond to favorites" }).click();
  await page.getByRole("button", { name: "Review my choices" }).click();
  await page.getByLabel("Order number").fill("900526-corrected");
  await page.getByLabel("Your name").fill("Astra UX Test");
  await page.reload();
  await page.getByRole("button", { name: "Review my choices" }).click();
  await expect(page.getByLabel("Order number")).toHaveValue("900526-corrected");
  await expect(page.getByLabel("Your name")).toHaveValue("Astra UX Test");
  await page.getByRole("button", { name: "Send my choices to Arch" }).click();
  await expect(
    page.getByRole("heading", { name: "Your choices are in." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your choices are in." }),
  ).toBeVisible();
  await page.goto("/?orderId=900527&name=Astra%20UX%20Test");
  await page
    .getByLabel("Your engraving wording", { exact: true })
    .fill("Second test draft");
  await page.goto("/");
  await expect(
    page.getByLabel("Your engraving wording", { exact: true }),
  ).toHaveValue("Second test draft");
});

test("failed submission can retry safely and returning to choices restores keyboard focus", async ({
  page,
}) => {
  let calls = 0;
  const payloads = [];
  await page.route("**/*.workers.dev/**", (route) => {
    calls++;
    payloads.push({
      url: route.request().url(),
      body: route.request().postData(),
    });
    return route.fulfill({
      status: calls === 1 ? 503 : 200,
      body: calls === 1 ? "Unavailable" : "Saved",
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await review(page);
  await page.getByRole("button", { name: "Back to my choices" }).click();
  await expect(
    page.getByRole("heading", { name: "Choose lettering for your order" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Review my choices" }).click();
  await page.getByRole("button", { name: "Send my choices to Arch" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Try sending again" }).click();
  await expect(
    page.getByRole("heading", { name: "Your choices are in." }),
  ).toBeVisible();
  expect(calls).toBe(2);
  expect(payloads[0]).toEqual(payloads[1]);
});
