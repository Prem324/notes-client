import { test, expect } from "@playwright/test";

const FEATURE_FLAGS_URL = /\/config\/features(?:\?.*)?$/;
const NOTIFICATIONS_URL = /\/notifications(?:\?.*)?$/;
const UNREAD_COUNT_URL = /\/notifications\/unread-count(?:\?.*)?$/;
const MARK_ALL_READ_URL = /\/notifications\/read-all(?:\?.*)?$/;
const MARK_READ_URL = /\/notifications\/[^/?]+\/read(?:\?.*)?$/;

// Match a notification ID endpoint only, excluding named API endpoints.
const DELETE_NOTIFICATION_URL =
    /\/notifications\/(?!unread-count(?:\/|$)|read-all(?:\/|$))[^/?]+(?:\?.*)?$/;

const initialNotifications = [
    {
        _id: "notification-1",
        type: "NOTE_SHARED",
        title: "A note was shared with you",
        message: "Someone shared a note with you.",
        read: false,
        createdAt: "2026-10-10T08:00:00.000Z",
    },
    {
        _id: "notification-2",
        type: "COMMENT_ADDED",
        title: "New comment added",
        message: "A comment was added to your note.",
        read: true,
        createdAt: "2026-10-10T08:05:00.000Z",
    },
];

function apiResponse(message, data, success = true) {
    return { success, message, data };
}

async function mockFeatureFlags(page, notificationsEnabled = true) {
    await page.route(FEATURE_FLAGS_URL, async (route) => {
        if (route.request().method() !== "GET") {
            await route.continue();
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("Feature flags fetched successfully", {
                    notifications: notificationsEnabled,
                })
            ),
        });
    });
}

async function mockNotificationApi(page, initialData = initialNotifications) {
    let notifications = initialData.map((notification) => ({
        ...notification,
    }));

    // GET unread notification count.
    await page.route(UNREAD_COUNT_URL, async (route) => {
        if (route.request().method() !== "GET") {
            await route.continue();
            return;
        }

        const count = notifications.filter((item) => !item.read).length;

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("Unread count fetched successfully", { count })
            ),
        });
    });

    // PATCH mark all notifications as read.
    await page.route(MARK_ALL_READ_URL, async (route) => {
        if (route.request().method() !== "PATCH") {
            await route.continue();
            return;
        }

        const modifiedCount = notifications.filter(
            (item) => !item.read
        ).length;

        notifications = notifications.map((item) => ({
            ...item,
            read: true,
        }));

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("All notifications marked as read", {
                    modifiedCount,
                })
            ),
        });
    });

    // PATCH mark one notification as read.
    await page.route(MARK_READ_URL, async (route) => {
        if (route.request().method() !== "PATCH") {
            await route.continue();
            return;
        }

        const notificationId = new URL(route.request().url()).pathname.match(
            /\/notifications\/([^/]+)\/read$/
        )?.[1];

        const notification = notifications.find(
            (item) => item._id === notificationId
        );

        if (!notification) {
            await route.fulfill({
                status: 404,
                contentType: "application/json",
                body: JSON.stringify(
                    apiResponse("Notification not found", null, false)
                ),
            });
            return;
        }

        notification.read = true;

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("Notification marked as read", notification)
            ),
        });
    });

    // DELETE one notification.
    await page.route(DELETE_NOTIFICATION_URL, async (route) => {
        if (route.request().method() !== "DELETE") {
            await route.continue();
            return;
        }

        const notificationId = new URL(route.request().url()).pathname.match(
            /\/notifications\/([^/]+)$/
        )?.[1];

        const previousLength = notifications.length;

        notifications = notifications.filter(
            (item) => item._id !== notificationId
        );

        if (notifications.length === previousLength) {
            await route.fulfill({
                status: 404,
                contentType: "application/json",
                body: JSON.stringify(
                    apiResponse("Notification not found", null, false)
                ),
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("Notification deleted successfully", null)
            ),
        });
    });

    // GET notifications list.
    await page.route(NOTIFICATIONS_URL, async (route) => {
        if (route.request().method() !== "GET") {
            await route.continue();
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(
                apiResponse("Notifications fetched successfully", {
                    notifications,
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: notifications.length,
                        totalPages: notifications.length > 0 ? 1 : 0,
                    },
                })
            ),
        });
    });
}

async function openNotificationPanel(page) {
    const bell = page.getByRole("button", {
        name: /^Notifications(?:,.*)?$/,
    });

    await expect(bell).toBeVisible();
    await bell.click();

    await expect(
        page.getByRole("heading", {
            name: "Notifications",
            exact: true,
        })
    ).toBeVisible();
}

test.describe("Notifications E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockFeatureFlags(page, true);
        await mockNotificationApi(page);
    });

    test("notification bell is visible when notifications are enabled", async ({
        page,
    }) => {
        await page.goto("/notes");

        await expect(
            page.getByRole("button", {
                name: /^Notifications(?:,.*)?$/,
            })
        ).toBeVisible();
    });

    test("notification bell is absent when notifications are disabled", async ({
        page,
    }) => {
        await page.unroute(FEATURE_FLAGS_URL);
        await mockFeatureFlags(page, false);

        await page.goto("/notes");

        await expect(
            page.getByRole("button", {
                name: /^Notifications(?:,.*)?$/,
            })
        ).toHaveCount(0);
    });

    test("notification panel displays notifications from the API", async ({
        page,
    }) => {
        await page.goto("/notes");
        await openNotificationPanel(page);

        await expect(
            page.getByText("A note was shared with you", { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText("New comment added", { exact: true })
        ).toBeVisible();

        await expect(
            page.getByRole("button", {
                name: /^Notifications(?:,.*)?$/,
            })
        ).toBeVisible();
    });

    test("notification panel displays its empty state", async ({ page }) => {
        await page.unroute(NOTIFICATIONS_URL);
        await page.unroute(UNREAD_COUNT_URL);
        await page.unroute(MARK_ALL_READ_URL);
        await page.unroute(MARK_READ_URL);
        await page.unroute(DELETE_NOTIFICATION_URL);

        await mockNotificationApi(page, []);

        await page.goto("/notes");
        await openNotificationPanel(page);

        await expect(
            page.getByText("You have no notifications.", { exact: true })
        ).toBeVisible();

        await expect(
            page.getByRole("button", { name: "Mark all read" })
        ).toBeDisabled();
    });

    test("authenticated user can mark an unread notification as read", async ({
        page,
    }) => {
        await page.goto("/notes");
        await openNotificationPanel(page);

        await expect(
            page.getByRole("button", { name: "Mark all read" })
        ).toBeEnabled();

        await page
            .getByRole("button", {
                name: "Mark A note was shared with you as read",
            })
            .click();

        await expect(
            page.getByRole("button", {
                name: "A note was shared with you, already read",
            })
        ).toBeDisabled();
    });

    test("authenticated user can mark all notifications as read", async ({
        page,
    }) => {
        // Use a fresh fixture with unread notifications for this test.
        await page.unroute(NOTIFICATIONS_URL);
        await page.unroute(UNREAD_COUNT_URL);
        await page.unroute(MARK_ALL_READ_URL);
        await page.unroute(MARK_READ_URL);
        await page.unroute(DELETE_NOTIFICATION_URL);

        await mockNotificationApi(page, [
            {
                _id: "notification-mark-all-1",
                type: "NOTE_SHARED",
                title: "A note was shared with you",
                message: "Someone shared a note with you.",
                read: false,
                createdAt: "2026-10-10T08:00:00.000Z",
            },
            {
                _id: "notification-mark-all-2",
                type: "COMMENT_ADDED",
                title: "New comment added",
                message: "A comment was added to your note.",
                read: false,
                createdAt: "2026-10-10T08:05:00.000Z",
            },
        ]);

        await page.goto("/notes");
        await openNotificationPanel(page);

        await expect(
            page.getByRole("button", { name: "Mark all read" })
        ).toBeEnabled();

        await page
            .getByRole("button", { name: "Mark all read" })
            .click();

        await expect(
            page.getByRole("button", {
                name: "A note was shared with you, already read",
            })
        ).toBeDisabled();

        await expect(
            page.getByRole("button", {
                name: "New comment added, already read",
            })
        ).toBeDisabled();

        await expect(
            page.getByRole("button", { name: "Mark all read" })
        ).toBeDisabled();
    });

    test("authenticated user can delete a notification", async ({ page }) => {
        await page.goto("/notes");
        await openNotificationPanel(page);

        await expect(
            page.getByText("A note was shared with you", { exact: true })
        ).toBeVisible();

        await page
            .getByRole("button", {
                name: "Delete A note was shared with you",
            })
            .click();

        await expect(
            page.getByText("A note was shared with you", { exact: true })
        ).toHaveCount(0);
    });
});