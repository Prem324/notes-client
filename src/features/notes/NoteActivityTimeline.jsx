import { useCallback, useEffect, useState } from "react";

import { noteService } from "./noteService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useAuth } from "../auth/AuthContext";

const PAGE_SIZE = 20;

function formatActivityDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function NoteActivityTimeline({ noteId }) {
    const { logout } = useAuth();

    const [activities, setActivities] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const fetchActivity = useCallback(
        async (page, append = false) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            setError("");

            try {
                const result =
                    await noteService.getNoteActivity(
                        noteId,
                        {
                            page,
                            limit: PAGE_SIZE,
                        }
                    );

                const data = result.data;

                const newActivities = Array.isArray(
                    data?.activities
                )
                    ? data.activities
                    : [];

                setActivities((previous) => {
                    if (!append) {
                        return newActivities;
                    }

                    const existingIds = new Set(
                        previous.map((item) => String(item.id))
                    );

                    const uniqueNewActivities =
                        newActivities.filter(
                            (item) =>
                                !existingIds.has(
                                    String(item.id)
                                )
                        );

                    return [
                        ...previous,
                        ...uniqueNewActivities,
                    ];
                });

                setPagination(data?.pagination || null);
            } catch (requestError) {
                if (
                    requestError.response?.status === 401
                ) {
                    logout();
                    return;
                }

                setError(
                    getErrorMessage(
                        requestError,
                        "Failed to load note activity"
                    )
                );
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [noteId, logout]
    );

    useEffect(() => {
        setActivities([]);
        setPagination(null);
        setError("");

        fetchActivity(1);

    }, [fetchActivity]);

    function handleLoadMore() {
        if (
            !pagination?.hasNextPage ||
            loadingMore ||
            loading
        ) {
            return;
        }

        fetchActivity(
            pagination.currentPage + 1,
            true
        );
    }

    return (
        <section
            aria-labelledby="note-activity-heading"
        >
            <h2 id="note-activity-heading">
                Activity Timeline
            </h2>

            {loading && (
                <p role="status">
                    Loading activity...
                </p>
            )}

            {error && (
                <div>
                    <p role="alert">{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchActivity(1)
                        }
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading &&
                !error &&
                activities.length === 0 && (
                    <p>
                        No activity recorded yet.
                    </p>
                )}

            {activities.length > 0 && (
                <ol aria-label="Note activity history">
                    {activities.map((activity) => (
                        <li key={activity.id}>
                            <div>
                                <strong>
                                    {activity.description}
                                </strong>

                                <p>
                                    {formatActivityDate(
                                        activity.createdAt
                                    )}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            {!loading &&
                !error &&
                pagination?.hasNextPage && (
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore
                            ? "Loading more..."
                            : "Load more"}
                    </button>
                )}
        </section>
    );
}

export default NoteActivityTimeline;