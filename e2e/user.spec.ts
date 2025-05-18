import { test, expect } from "@playwright/test";

test.use({
  storageState: "./playwright/.auth/user.json",
});

test.describe("User flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator(".mantine-Avatar-root").click();
  });

  test("user can see appropriate header menu", async ({ page }) => {
    await expect(page.locator("text=My Bookings")).toBeVisible();
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("user can logout", async ({ page }) => {
    await expect(page.locator("text=Logout")).toBeVisible();
    await page.locator("text=Logout").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("clicks on my bookings should navigate to bookings page", async ({
    page,
  }) => {
    await page.locator("text=My Bookings").click();
    await expect(page).toHaveURL("/bookings");
  });

  test("clicks profile should navigate to profile page", async ({ page }) => {
    await page.locator("text=Profile").click();
    await expect(page).toHaveURL("/profile");
  });
});
