
import axiosInstance from "../../api/axiosInstance";

async function getNotifications(params = {}) {
    const response = await axiosInstance.get("/notifications", {
        params,
    });

    return response.data;
}

async function getUnreadCount() {
    const response = await axiosInstance.get(
        "/notifications/unread-count"
    );

    return response.data;
}

async function markNotificationAsRead(notificationId) {
    const response = await axiosInstance.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
}

async function markAllNotificationsAsRead() {
    const response = await axiosInstance.patch(
        "/notifications/read-all"
    );

    return response.data;
}

async function deleteNotification(notificationId) {
    const response = await axiosInstance.delete(
        `/notifications/${notificationId}`
    );

    return response.data;
}

export const notificationService = {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
