
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useAuth } from "../auth/AuthContext";
import { useFeatureFlags } from "../featureFlags/useFeatureFlags";
import { notificationService } from "./notificationService";
import "./NotificationBell.css";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

function getErrorMessage(error, fallback) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}

function getNotificationsFromResponse(response) {
    const data = response?.data;

    if (Array.isArray(data?.notifications)) {
        return data.notifications;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
}

function getUnreadCountFromResponse(response) {
    const count = response?.data?.count;

    return Number.isFinite(count) ? count : 0;
}

function formatNotificationDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString();
}

function NotificationBell() {
    const { isLoggedIn } = useAuth();
    const { isEnabled } = useFeatureFlags();
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);

    const notificationsEnabled = isEnabled("notifications");
    const shouldFetch = Boolean(isLoggedIn && notificationsEnabled);

    const unreadCountQuery = useQuery({
        queryKey: UNREAD_COUNT_QUERY_KEY,
        queryFn: () => notificationService.getUnreadCount(),
        enabled: shouldFetch,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

    const notificationsQuery = useQuery({
        queryKey: [...NOTIFICATIONS_QUERY_KEY, { page: 1, limit: 20 }],
        queryFn: () =>
            notificationService.getNotifications({
                page: 1,
                limit: 20,
            }),
        enabled: shouldFetch && isOpen,
    });

    async function refreshNotificationQueries() {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: NOTIFICATIONS_QUERY_KEY,
            }),
            queryClient.invalidateQueries({
                queryKey: UNREAD_COUNT_QUERY_KEY,
            }),
        ]);
    }

    const markReadMutation = useMutation({
        mutationFn: (notificationId) =>
            notificationService.markNotificationAsRead(notificationId),
        onSuccess: async () => {
            await refreshNotificationQueries();
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(
                    error,
                    "Could not mark notification as read."
                )
            );
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: () =>
            notificationService.markAllNotificationsAsRead(),
        onSuccess: async () => {
            await refreshNotificationQueries();
            toast.success("All notifications marked as read.");
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(
                    error,
                    "Could not mark notifications as read."
                )
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (notificationId) =>
            notificationService.deleteNotification(notificationId),
        onSuccess: async () => {
            await refreshNotificationQueries();
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Could not delete notification.")
            );
        },
    });

    if (!isLoggedIn || !notificationsEnabled) {
        return null;
    }

    const unreadCount = getUnreadCountFromResponse(
        unreadCountQuery.data
    );

    const notifications = getNotificationsFromResponse(
        notificationsQuery.data
    );

    function handleNotificationClick(notification) {
        if (
            !notification?._id ||
            notification.read ||
            markReadMutation.isPending
        ) {
            return;
        }

        markReadMutation.mutate(notification._id);
    }

    function handleMarkAllRead() {
        if (
            unreadCount > 0 &&
            !markAllReadMutation.isPending
        ) {
            markAllReadMutation.mutate();
        }
    }

    function handleDelete(notificationId) {
        if (notificationId && !deleteMutation.isPending) {
            deleteMutation.mutate(notificationId);
        }
    }

    return (
        <div className="notification-bell">
            <button
                type="button"
                className="notification-bell__trigger"
                aria-label={
                    unreadCount > 0
                        ? `Notifications, ${unreadCount} unread`
                        : "Notifications"
                }
                aria-expanded={isOpen}
                aria-controls="notification-panel"
                onClick={() => setIsOpen((previous) => !previous)}
            >
                <span aria-hidden="true">🔔</span>

                {unreadCount > 0 && (
                    <span className="notification-bell__badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <section
                    id="notification-panel"
                    className="notification-panel"
                    aria-label="Notifications"
                >
                    <div className="notification-panel__header">
                        <h2>Notifications</h2>

                        <button
                            type="button"
                            className="notification-panel__text-button"
                            onClick={handleMarkAllRead}
                            disabled={
                                unreadCount === 0 ||
                                markAllReadMutation.isPending
                            }
                        >
                            {markAllReadMutation.isPending
                                ? "Marking..."
                                : "Mark all read"}
                        </button>
                    </div>

                    {unreadCountQuery.isError && (
                        <p
                            className="notification-panel__error"
                            role="alert"
                        >
                            {getErrorMessage(
                                unreadCountQuery.error,
                                "Could not load unread count."
                            )}
                        </p>
                    )}

                    {notificationsQuery.isLoading && (
                        <p className="notification-panel__status">
                            Loading notifications...
                        </p>
                    )}

                    {notificationsQuery.isError && (
                        <div
                            className="notification-panel__status"
                            role="alert"
                        >
                            <p>
                                {getErrorMessage(
                                    notificationsQuery.error,
                                    "Could not load notifications."
                                )}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    notificationsQuery.refetch()
                                }
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!notificationsQuery.isLoading &&
                        !notificationsQuery.isError &&
                        notifications.length === 0 && (
                            <p className="notification-panel__status">
                                You have no notifications.
                            </p>
                        )}

                    {notifications.length > 0 && (
                        <ul className="notification-panel__list">
                            {notifications.map((notification) => (
                                <li
                                    key={notification._id}
                                    className={[
                                        "notification-item",
                                        notification.read
                                            ? "notification-item--read"
                                            : "notification-item--unread",
                                    ].join(" ")}
                                >
                                    <button
                                        type="button"
                                        className="notification-item__content"
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                        disabled={
                                            !notification._id ||
                                            notification.read ||
                                            markReadMutation.isPending
                                        }
                                        aria-label={
                                            notification.read
                                                ? `${
                                                      notification.title ||
                                                      "Notification"
                                                  }, already read`
                                                : `Mark ${
                                                      notification.title ||
                                                      "notification"
                                                  } as read`
                                        }
                                    >
                                        <span className="notification-item__title">
                                            {notification.title ||
                                                "Notification"}
                                        </span>

                                        {notification.message && (
                                            <span className="notification-item__message">
                                                {notification.message}
                                            </span>
                                        )}

                                        {notification.createdAt && (
                                            <span className="notification-item__date">
                                                {formatNotificationDate(
                                                    notification.createdAt
                                                )}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="notification-item__delete"
                                        aria-label={`Delete ${
                                            notification.title ||
                                            "notification"
                                        }`}
                                        disabled={
                                            !notification._id ||
                                            deleteMutation.isPending
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                notification._id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}

export default NotificationBell;
