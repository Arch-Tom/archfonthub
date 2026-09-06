import { test, expect } from "@playwright/test";

// These tests exercise only local UI. An accidental write is both blocked and a failure.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const method = request.method();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      await route.abort();
      throw new Error(
        `Unexpected network write blocked: ${method} ${request.url()}`,
      );
    }
    const host = new URL(request.url()).hostname;
    if (!["127.0.0.1", "localhost"].includes(host)) return route.abort();
    return route.continue();
  });
  await page.goto("/");
});

async function openTools(page, tab) {
  const tools = page.locator(".character-tools");
  if (!(await tools.evaluate((element) => element.open)))
    await tools.locator("summary").click();
  if (tab) await tools.getByRole("tab", { name: tab, exact: true }).click();
  return tools;
}

test("accents replace selected wording and symbols insert at the preserved cursor", async ({
  page,
}) => {
  const wording = page.getByRole("textbox", {
    name: "Your engraving wording",
    exact: true,
  });
  await wording.fill("Renee O'Connor\nDirector, R&D\nSt. Louis  2026");
  await wording.press("Control+Home");
  for (let i = 0; i < 3; i++) await wording.press("ArrowRight");
  await wording.press("Shift+ArrowRight");
  const tools = await openTools(page, "Accents");
  await tools.getByRole("button", { name: "Insert é", exact: true }).click();
  await expect(wording).toHaveValue(
    "Renée O'Connor\nDirector, R&D\nSt. Louis  2026",
  );
  await expect(wording).toBeFocused();
  await wording.press("Control+End");
  for (let i = 0; i < 5; i++) await wording.press("ArrowLeft");
  await tools.getByRole("tab", { name: "Symbols", exact: true }).click();
  await tools.getByRole("button", { name: "Insert •", exact: true }).click();
  await expect(wording).toHaveValue(
    "Renée O'Connor\nDirector, R&D\nSt. Louis • 2026",
  );
  await page
    .getByRole("button", { name: "Add Garamond to favorites", exact: true })
    .click();
  await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
  await expect(
    page
      .getByRole("article", { name: "Favorite 1: Garamond" })
      .locator(".wording-preview"),
  ).toHaveText("Renée O'Connor\nDirector, R&D\nSt. Louis • 2026");
});

test("character tabs use arrow keys and Escape restores the disclosure focus", async ({
  page,
}) => {
  const tools = await openTools(page, "Symbols");
  await tools
    .getByRole("tab", { name: "Symbols", exact: true })
    .press("ArrowRight");
  await expect(
    tools.getByRole("tab", { name: "Accents", exact: true }),
  ).toBeFocused();
  await expect(
    tools.getByRole("tab", { name: "Accents", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(
    tools.getByRole("tab", { name: "Hebrew", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(tools).not.toHaveAttribute("open");
  await expect(tools.locator("summary")).toBeFocused();
});

test("Hebrew keyboard preserves niqqud, removes whole graphemes and inserts at the wording cursor", async ({
  page,
}) => {
  const wording = page.getByRole("textbox", {
    name: "Your engraving wording",
    exact: true,
  });
  await wording.fill("Name: ");
  const tools = await openTools(page, "Hebrew");
  const composer = tools.getByRole("textbox", { name: "Compose Hebrew text" });
  await tools.getByRole("button", { name: "Dalet", exact: true }).click();
  await tools.getByRole("button", { name: "Qamats", exact: true }).click();
  await expect(composer).toHaveValue("דָ");
  await tools.getByRole("button", { name: "Bet", exact: true }).click();
  await tools.getByRole("button", { name: "Hiriq", exact: true }).click();
  await expect(composer).toHaveValue("דָבִ");
  await tools.getByRole("button", { name: "Backspace", exact: true }).click();
  await expect(composer).toHaveValue("דָ");
  await tools.getByRole("button", { name: "Space", exact: true }).click();
  await tools.getByRole("button", { name: "Alef", exact: true }).click();
  await tools
    .getByRole("button", { name: "Insert Hebrew text", exact: true })
    .click();
  await expect(wording).toHaveValue("Name: דָ א");
  await expect(wording).toBeFocused();
  await expect(tools).not.toHaveAttribute("open");
  await openTools(page, "Hebrew");
  await composer.fill("שָׁלוֹם");
  await tools.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(composer).toHaveValue("");
  await expect(
    tools.getByRole("button", { name: "Insert Hebrew text", exact: true }),
  ).toBeDisabled();
});

for (const mode of ["classic", "flat", "circular", "split"]) {
  test(`${mode} monogram inserts and remains in the final review`, async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Monogram Maker", exact: false })
      .click();
    const dialog = page.getByRole("dialog", { name: "Monogram Maker" });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", {
        name: new RegExp(
          `^${mode === "split" ? "Split Letter" : mode}(?: \u2713)?$`,
          "i",
        ),
      })
      .click();
    if (mode === "split") {
      await dialog
        .getByRole("textbox", { name: "Split monogram initial", exact: true })
        .fill("S");
      await dialog
        .getByRole("textbox", { name: "Split monogram name", exact: true })
        .fill("Smith");
      await expect(
        dialog.getByRole("img", {
          name: "Split monogram: S, SMITH",
          exact: true,
        }),
      ).toBeVisible();
    } else {
      await dialog
        .getByRole("textbox", { name: "Left initial", exact: true })
        .fill("A");
      await dialog
        .getByRole("textbox", {
          name: "Center initial (larger in classic style)",
          exact: true,
        })
        .fill("B");
      await dialog
        .getByRole("textbox", { name: "Right initial", exact: true })
        .fill("C");
      if (mode === "circular") {
        await dialog
          .getByRole("button", { name: "outline", exact: true })
          .click();
        await expect(
          dialog.getByRole("img", {
            name: "Circular monogram: A, B, C, outline frame",
            exact: true,
          }),
        ).toBeVisible();
        const resources = await page.evaluate(async () => {
          await document.fonts.load("80px LeftCircleMonogram");
          await document.fonts.load("80px MiddleCircleMonogram");
          await document.fonts.load("80px RightCircleMonogram");
          return performance
            .getEntriesByType("resource")
            .map((entry) => entry.name)
            .filter((name) => name.includes("CircleMonogram"));
        });
        expect(
          resources.filter((name) => name.endsWith("Regular.woff2")),
        ).toHaveLength(3);
      }
    }
    await dialog
      .getByRole("button", { name: "Insert Monogram", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "Compare choices", exact: true }).first().click();
    await expect(
      page.getByRole("heading", { name: "Your monogram", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".monogram-sample").getByRole("img"),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Review my choices", exact: false })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Ready to send to Arch?",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Monogram only", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".request-summary .monogram-sample").getByRole("img"),
    ).toBeVisible();
  });
}

test("monogram dialog contains keyboard focus and returns it on Escape at 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const opener = page.getByRole("button", {
    name: "Monogram Maker",
    exact: false,
  });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Monogram Maker" });
  await expect(
    dialog.getByRole("textbox", { name: "Left initial", exact: true }),
  ).toBeFocused();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close Monogram Maker", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  const box = await dialog.locator(".monogram-dialog-content").boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeLessThanOrEqual(844);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("character palettes remain usable without horizontal overflow at 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const tab of ["Symbols", "Accents", "Hebrew"]) {
    const tools = await openTools(page, tab);
    const panel = tools.getByRole("tabpanel", { name: tab, exact: true });
    await expect(panel).toBeVisible();
    const overflowing = await panel.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(overflowing, `${tab} tools must fit the mobile panel`).toBe(false);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  }
});
