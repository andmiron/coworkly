import { test as setup, expect } from "@playwright/test";
import path from "path";

const userFile = path.join(__dirname, "../playwright/.auth/user.json");
const adminFile = path.join(__dirname, "../playwright/.auth/admin.json");
const superAdminFile = path.join(
  __dirname,
  "../playwright/.auth/superadmin.json"
);

setup.describe("Authentication setup", () => {
  setup.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  setup("authenticate as user", async ({ page }) => {
    await page.fill("input[placeholder='Your username']", "test");
    await page.fill("input[placeholder='Your username']", "test");
    await page.fill("input[placeholder='Your password']", "test");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
    await page.context().storageState({ path: userFile });
  });

  setup("authenticate as admin", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[placeholder='Your username']", "admin");
    await page.fill("input[placeholder='Your password']", "admin");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
    await page.context().storageState({ path: adminFile });
  });

  setup("authenticate as superadmin", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[placeholder='Your username']", "superadmin");
    await page.fill("input[placeholder='Your password']", "superadmin");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
    await page.context().storageState({ path: superAdminFile });
  });
});
