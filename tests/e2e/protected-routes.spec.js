import { test, expect } from "@playwright/test";

test("unauthenticated user is redirected from notes to login", async ({
  page,
}) => {
  await page.goto("/notes");

  await expect(page).toHaveURL(/\/login/);

  await expect(
    page.getByRole("heading", { name: "Login" }).first()
  ).toBeVisible();
});