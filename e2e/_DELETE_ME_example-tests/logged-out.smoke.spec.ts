import { expect, test } from "@playwright/test";

const NON_LOCAL_HTTP_URL = /^https?:\/\/(?!(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$))/;

test.beforeEach(async ({ context }) => {
  // Keep the starter smoke test isolated from third-party services.
  await context.route(NON_LOCAL_HTTP_URL, (route) => route.abort("blockedbyclient"));
});

test("a logged-out visitor can reach the login form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /minimal starter stack/i })).toBeVisible();
  await expect(page.getByText("You are not signed in.")).toBeVisible();

  await page.getByText("Just created a project from this stack?").click();
  await expect(page.getByText(/The Playwright config needs no change/)).toBeVisible();

  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});
