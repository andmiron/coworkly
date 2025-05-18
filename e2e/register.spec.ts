import { test, expect } from "@playwright/test";

// test.describe.configure({ mode: "serial" });

test.describe("Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("register page should have a title", async ({ page }) => {
    await expect(page.getByText("Create an account")).toBeVisible();
  });

  test("register page should have username, password, and confirm password inputs", async ({
    page,
  }) => {
    await expect(page.getByPlaceholder("Your username")).toBeVisible();
    await expect(
      page.getByPlaceholder("Your password", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Confirm your password", { exact: true })
    ).toBeVisible();
  });

  test("register page should have a submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("user should be able to register with valid credentials", async ({
    page,
  }) => {
    await page.fill("input[placeholder='Your username']", "test1");
    await page.fill("input[placeholder='Your password']", "test1");
    await page.fill("input[placeholder='Confirm your password']", "test1");
    await page.click("button[type='submit']");
    // await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });

  test("should show error for duplicate username", async ({ page }) => {
    await page.goto("/register");
    await page.fill("input[placeholder='Your username']", "test");
    await page.fill("input[placeholder='Your password']", "test");
    await page.fill("input[placeholder='Confirm your password']", "test");
    await page.click("button[type='submit']");
    await expect(
      page.locator(
        ".mantine-Notifications-root >> text=User with this username already exists"
      )
    ).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.fill("input[placeholder='Your username']", "shortpassuser");
    await page.fill("input[placeholder='Your password']", "123");
    await page.fill("input[placeholder='Confirm your password']", "123");
    await page.click("button[type='submit']");
    await expect(
      page.getByText("Password must be at least 4 characters long")
    ).toBeVisible();
  });

  test("should show error if passwords do not match", async ({ page }) => {
    await page.fill("input[placeholder='Your username']", "mismatchuser");
    await page.fill("input[placeholder='Your password']", "password1");
    await page.fill("input[placeholder='Confirm your password']", "password2");
    await page.click("button[type='submit']");
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});
