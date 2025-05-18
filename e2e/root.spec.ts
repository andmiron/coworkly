import { expect, test } from "@playwright/test";

test.describe("Root", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("home page should have a title", async ({ page }) => {
    await expect(page).toHaveTitle("Coworkly");
  });

  test("header should have a logo link", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Coworkly" })).toBeVisible();
  });

  test("logo button should navigate to home page", async ({ page }) => {
    await page.getByRole("link", { name: "Coworkly" }).click();
    await expect(page).toHaveURL("/");
  });

  test("header should have login and register buttons", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  });

  test("login button should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Login" }).click();
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });

  test("register button should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: "Register" }).click();
    await page.waitForURL("/register");
    await expect(page).toHaveURL("/register");
  });

  test("main section should have a list of workspaces", async ({ page }) => {
    const cards = await page.getByTestId("workspace-card");
    await expect(cards.first()).toBeVisible();
  });
});
