
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import NotificationBell from "./NotificationBell";
import { useAuth } from "../auth/AuthContext";
import { useFeatureFlags } from "../featureFlags/useFeatureFlags";
import { notificationService } from "./notificationService";

vi.mock("../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../featureFlags/useFeatureFlags", () => ({
    useFeatureFlags: vi.fn(),
}));

vi.mock("./notificationService", () => ({
    notificationService: {
        getNotifications: vi.fn(),
        getUnreadCount: vi.fn(),
        markNotificationAsRead: vi.fn(),
        markAllNotificationsAsRead: vi.fn(),
        deleteNotification: vi.fn(),
    },
}));

vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

function renderNotificationBell() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <NotificationBell />
        </QueryClientProvider>
    );
}

function openNotificationPanel() {
    fireEvent.click(
        screen.getByRole("button", {
            name: /notifications/i,
        })
    );
}

describe("NotificationBell", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            isLoggedIn: true,
        });

        useFeatureFlags.mockReturnValue({
            isEnabled: (featureName) =>
                featureName === "notifications",
        });

        notificationService.getUnreadCount.mockResolvedValue({
            success: true,
            data: {
                count: 2,
            },
        });

        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: {
                notifications: [
                    {
                        _id: "notification-1",
                        title: "Note shared with you",
                        message: "A note was shared with you.",
                        read: false,
                        createdAt: "2026-10-10T08:00:00.000Z",
                    },
                    {
                        _id: "notification-2",
                        title: "Permission updated",
                        message: "Your permission has changed.",
                        read: true,
                        createdAt: "2026-10-10T08:10:00.000Z",
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 2,
                },
            },
        });

        notificationService.markNotificationAsRead.mockResolvedValue({
            success: true,
        });

        notificationService.markAllNotificationsAsRead.mockResolvedValue({
            success: true,
        });

        notificationService.deleteNotification.mockResolvedValue({
            success: true,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it("does not render when the user is logged out", () => {
        useAuth.mockReturnValue({
            isLoggedIn: false,
        });

        renderNotificationBell();

        expect(
            screen.queryByRole("button", {
                name: /notifications/i,
            })
        ).not.toBeInTheDocument();

        expect(
            notificationService.getUnreadCount
        ).not.toHaveBeenCalled();

        expect(
            notificationService.getNotifications
        ).not.toHaveBeenCalled();
    });

    it("does not render when notifications are disabled", () => {
        useFeatureFlags.mockReturnValue({
            isEnabled: () => false,
        });

        renderNotificationBell();

        expect(
            screen.queryByRole("button", {
                name: /notifications/i,
            })
        ).not.toBeInTheDocument();

        expect(
            notificationService.getUnreadCount
        ).not.toHaveBeenCalled();

        expect(
            notificationService.getNotifications
        ).not.toHaveBeenCalled();
    });

    it("shows the unread notification count", async () => {
        renderNotificationBell();

        expect(
            await screen.findByRole("button", {
                name: "Notifications, 2 unread",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();
    });

    it("loads and displays notifications when the panel opens", async () => {
        renderNotificationBell();

        await screen.findByRole("button", {
            name: "Notifications, 2 unread",
        });

        openNotificationPanel();

        expect(
            await screen.findByText("Note shared with you")
        ).toBeInTheDocument();

        expect(
            screen.getByText("A note was shared with you.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Permission updated")
        ).toBeInTheDocument();

        expect(
            notificationService.getNotifications
        ).toHaveBeenCalledWith({
            page: 1,
            limit: 20,
        });
    });

    it("marks an unread notification as read", async () => {
        renderNotificationBell();

        await screen.findByRole("button", {
            name: "Notifications, 2 unread",
        });

        openNotificationPanel();

        const markReadButton = await screen.findByRole("button", {
            name: "Mark Note shared with you as read",
        });

        fireEvent.click(markReadButton);

        await waitFor(() => {
            expect(
                notificationService.markNotificationAsRead
            ).toHaveBeenCalled();

            expect(
                notificationService.markNotificationAsRead.mock.calls[0][0]
            ).toBe("notification-1");
        });
    });

    it("marks all notifications as read", async () => {
        renderNotificationBell();

        await screen.findByRole("button", {
            name: "Notifications, 2 unread",
        });

        openNotificationPanel();

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Mark all read",
            })
        );

        await waitFor(() => {
            expect(
                notificationService.markAllNotificationsAsRead
            ).toHaveBeenCalledTimes(1);
        });
    });

    it("deletes a notification", async () => {
        renderNotificationBell();

        await screen.findByRole("button", {
            name: "Notifications, 2 unread",
        });

        openNotificationPanel();

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Delete Note shared with you",
            })
        );

        await waitFor(() => {
            expect(
                notificationService.deleteNotification
            ).toHaveBeenCalled();

            expect(
                notificationService.deleteNotification.mock.calls[0][0]
            ).toBe("notification-1");
        });
    });

    it("shows an empty state when there are no notifications", async () => {
        notificationService.getNotifications.mockResolvedValue({
            success: true,
            data: {
                notifications: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                },
            },
        });

        renderNotificationBell();

        await screen.findByRole("button", {
            name: "Notifications, 2 unread",
        });

        openNotificationPanel();

        expect(
            await screen.findByText("You have no notifications.")
        ).toBeInTheDocument();
    });
});
