import { test, expect } from "@playwright/test";

test.use({
  storageState: "./playwright/.auth/admin.json",
});

test.describe("Admin flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator(".mantine-Avatar-root").click();
  });

  test("admin can see appropriate header menu", async ({ page }) => {
    await expect(page.locator("text=Admin Panel")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("admin can logout", async ({ page }) => {
    await expect(page.locator("text=Logout")).toBeVisible();
    await page.locator("text=Logout").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("clicks on admin panel should navigate to admin panel page", async ({
    page,
  }) => {
    await page.locator("text=Admin Panel").click();
    await expect(page).toHaveURL("/admin");
  });
});
