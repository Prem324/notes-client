
import {
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { notificationService } from "./notificationService";

vi.mock("../../api/axiosInstance", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("notificationService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("getNotifications fetches notifications with pagination parameters", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: {
                    notifications: [
                        {
                            _id: "notification1",
                            title: "A note was shared with you",
                            read: false,
                        },
                    ],
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: 1,
                        totalPages: 1,
                    },
                },
            },
        };

        axiosInstance.get.mockResolvedValue(fakeResponse);

        const params = {
            page: 1,
            limit: 20,
            unreadOnly: true,
        };

        const result =
            await notificationService.getNotifications(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
            "/notifications",
            { params }
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("getNotifications uses default parameters when omitted", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: {
                    notifications: [],
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: 0,
                        totalPages: 0,
                    },
                },
            },
        };

        axiosInstance.get.mockResolvedValue(fakeResponse);

        const result =
            await notificationService.getNotifications();

        expect(axiosInstance.get).toHaveBeenCalledWith(
            "/notifications",
            { params: {} }
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("getUnreadCount fetches the unread notification count", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: {
                    count: 3,
                },
            },
        };

        axiosInstance.get.mockResolvedValue(fakeResponse);

        const result = await notificationService.getUnreadCount();

        expect(axiosInstance.get).toHaveBeenCalledWith(
            "/notifications/unread-count"
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("markNotificationAsRead calls the correct endpoint", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: {
                    _id: "notification1",
                    read: true,
                },
            },
        };

        axiosInstance.patch.mockResolvedValue(fakeResponse);

        const result =
            await notificationService.markNotificationAsRead(
                "notification1"
            );

        expect(axiosInstance.patch).toHaveBeenCalledWith(
            "/notifications/notification1/read"
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("markAllNotificationsAsRead calls the read-all endpoint", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: {
                    modifiedCount: 4,
                },
            },
        };

        axiosInstance.patch.mockResolvedValue(fakeResponse);

        const result =
            await notificationService.markAllNotificationsAsRead();

        expect(axiosInstance.patch).toHaveBeenCalledWith(
            "/notifications/read-all"
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("deleteNotification calls the correct endpoint", async () => {
        const fakeResponse = {
            data: {
                success: true,
                data: null,
            },
        };

        axiosInstance.delete.mockResolvedValue(fakeResponse);

        const result =
            await notificationService.deleteNotification(
                "notification1"
            );

        expect(axiosInstance.delete).toHaveBeenCalledWith(
            "/notifications/notification1"
        );
        expect(result).toEqual(fakeResponse.data);
    });

    test("propagates API errors when fetching notifications", async () => {
        const error = new Error("Unable to fetch notifications");

        axiosInstance.get.mockRejectedValueOnce(error);

        await expect(
            notificationService.getNotifications()
        ).rejects.toBe(error);
    });

    test("propagates API errors when marking a notification as read", async () => {
        const error = new Error("Notification not found");

        axiosInstance.patch.mockRejectedValueOnce(error);

        await expect(
            notificationService.markNotificationAsRead(
                "missing-notification"
            )
        ).rejects.toBe(error);
    });

    test("propagates API errors when deleting a notification", async () => {
        const error = new Error("Delete failed");

        axiosInstance.delete.mockRejectedValueOnce(error);

        await expect(
            notificationService.deleteNotification("notification1")
        ).rejects.toBe(error);
    });
});
