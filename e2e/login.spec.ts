import { test, expect } from "@playwright/test";

// test.describe.configure({ mode: "serial" });

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should render login page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Welcome back!" })
    ).toBeVisible();
    await expect(
      page.locator("input[placeholder='Your username']")
    ).toBeVisible();
    await expect(
      page.locator("input[placeholder='Your password']")
    ).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("should throw error if credentials are not correct", async ({
    page,
  }) => {
    await page.fill("input[placeholder='Your username']", "wronguser");
    await page.fill("input[placeholder='Your password']", "wrongpass");
    await page.click("button[type='submit']");
    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });

  test("should login and redirect on valid credentials", async ({ page }) => {
    await page.fill("input[placeholder='Your username']", "test");
    await page.fill("input[placeholder='Your password']", "test");
    await page.click("button[type='submit']");
    // await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.fill("input[placeholder='Your username']", "shortpassuser");
    await page.fill("input[placeholder='Your password']", "123");
    await page.click("button[type='submit']");
    await expect(
      page.getByText("Password must be at least 4 characters long")
    ).toBeVisible();
  });
});
