
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const AUTH_FILE = path.resolve(
    process.cwd(),
    ".auth",
    "notifications-user.json"
);

setup("authenticate notification test user", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "Set E2E_USER_EMAIL and E2E_USER_PASSWORD in notes-client/.env.e2e"
        );
    }

    await page.goto("/login");

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);

    const loginResponsePromise = page.waitForResponse(
        (response) =>
            response.request().method() === "POST" &&
            /\/auth\/login(?:\?.*)?$/.test(
                new URL(response.url()).pathname
            ),
        { timeout: 15000 }
    );

    await page.getByRole("button", { name: "Login" }).click();

    const loginResponse = await loginResponsePromise;

    if (!loginResponse.ok()) {
        throw new Error(
            `Authentication setup failed (${loginResponse.status()}): ` +
                (await loginResponse.text())
        );
    }

    await expect(page).toHaveURL(/\/notes(?:\/|$|\?)/, {
        timeout: 15000,
    });

    const authDirectory = path.dirname(AUTH_FILE);
    fs.mkdirSync(authDirectory, { recursive: true });

    await page.context().storageState({
        path: AUTH_FILE,
    });
});
