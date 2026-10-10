import dotenv from "dotenv";
dotenv.config({ path: ".env.e2e" });

import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const authFile = path.resolve(
    process.cwd(),
    ".auth",
    "notifications-user.json"
);

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",

    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },

    projects: [
        {
            name: "notifications-setup",
            testMatch: "**/notifications.setup.js",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "chromium",
            testIgnore: [
                "**/notifications.spec.js",
                "**/notifications.setup.js",
                "**/notes.spec.js",
            ],
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "notes",
            testMatch: "**/notes.spec.js",
            dependencies: ["notifications-setup"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: authFile,
            },
        },
        {
            name: "notifications",
            testMatch: "**/notifications.spec.js",
            dependencies: ["notifications-setup"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: authFile,
            },
        },
    ],
});