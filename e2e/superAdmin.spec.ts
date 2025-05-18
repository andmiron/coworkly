import { test, expect } from "@playwright/test";

test.use({
  storageState: "./playwright/.auth/superAdmin.json",
});

test.describe("SuperAdmin flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator(".mantine-Avatar-root").click();
  });

  test("superAdmin can see appropriate header menu", async ({ page }) => {
    await expect(page.locator("text=Super Admin Panel")).toBeVisible();
    await expect(page.locator("text=Logout")).toBeVisible();
  });

  test("superAdmin can logout", async ({ page }) => {
    await expect(page.locator("text=Logout")).toBeVisible();
    await page.locator("text=Logout").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("clicks on superAdmin panel should navigate to superAdmin panel page", async ({
    page,
  }) => {
    await page.locator("text=Super Admin Panel").click();
    await expect(page).toHaveURL("/super-admin");
  });
});
