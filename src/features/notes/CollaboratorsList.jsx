import { useEffect, useState } from "react";
import { noteService } from "./noteService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
    showSuccessToast,
    showErrorToast,
} from "../../utils/toast";

function CollaboratorsList({
    noteId,
    refreshKey = 0,
}) {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] =
        useState(null);
    const [removingUserId, setRemovingUserId] =
        useState(null);
    const [error, setError] = useState("");

    async function loadCollaborators() {
        try {
            setLoading(true);
            setError("");

            const response =
                await noteService.getNoteCollaborators(
                    noteId
                );

            setCollaborators(response.data || []);
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Failed to load collaborators"
            );

            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCollaborators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId, refreshKey]);

    async function handlePermissionChange(
        userId,
        permission
    ) {
        try {
            setUpdatingUserId(userId);
            setError("");

            await noteService.updateCollaboratorPermission(
                noteId,
                userId,
                permission
            );

            setCollaborators((current) =>
                current.map((collaborator) =>
                    collaborator.user?._id === userId
                        ? {
                              ...collaborator,
                              permission,
                          }
                        : collaborator
                )
            );

            showSuccessToast(
                "Collaborator permission updated successfully"
            );
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Failed to update collaborator permission"
            );

            setError(message);
            showErrorToast(message);
        } finally {
            setUpdatingUserId(null);
        }
    }

    async function handleRemove(userId) {
        const confirmed = window.confirm(
            "Remove this collaborator from the note?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingUserId(userId);
            setError("");

            await noteService.removeCollaborator(
                noteId,
                userId
            );

            setCollaborators((current) =>
                current.filter(
                    (collaborator) =>
                        collaborator.user?._id !== userId
                )
            );

            showSuccessToast(
                "Collaborator removed successfully"
            );
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Failed to remove collaborator"
            );

            setError(message);
            showErrorToast(message);
        } finally {
            setRemovingUserId(null);
        }
    }

    if (loading) {
        return (
            <section aria-label="Collaborators">
                <p>Loading collaborators...</p>
            </section>
        );
    }

    if (
        error &&
        collaborators.length === 0
    ) {
        return (
            <section aria-label="Collaborators">
                <p role="alert">{error}</p>

                <button
                    type="button"
                    onClick={loadCollaborators}
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <section aria-label="Collaborators">
            <h3>Collaborators</h3>

            {error && (
                <p role="alert">{error}</p>
            )}

            {collaborators.length === 0 ? (
                <p>No collaborators yet.</p>
            ) : (
                <ul>
                    {collaborators.map(
                        (collaborator) => {
                            const user =
                                collaborator.user;

                            const userId =
                                user?._id;

                            const isUpdating =
                                updatingUserId ===
                                userId;

                            const isRemoving =
                                removingUserId ===
                                userId;

                            const isBusy =
                                isUpdating ||
                                isRemoving;

                            return (
                                <li
                                    key={
                                        collaborator._id
                                    }
                                >
                                    <div>
                                        <strong>
                                            {user?.name ||
                                                "Unknown user"}
                                        </strong>

                                        {user?.email && (
                                            <span>
                                                {" "}
                                                (
                                                {
                                                    user.email
                                                }
                                                )
                                            </span>
                                        )}
                                    </div>

                                    <label
                                        htmlFor={`permission-${userId}`}
                                    >
                                        Permission
                                    </label>

                                    <select
                                        id={`permission-${userId}`}
                                        value={
                                            collaborator.permission
                                        }
                                        disabled={
                                            isBusy
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handlePermissionChange(
                                                userId,
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="viewer">
                                            Viewer
                                        </option>

                                        <option value="editor">
                                            Editor
                                        </option>
                                    </select>

                                    <button
                                        type="button"
                                        disabled={
                                            isBusy
                                        }
                                        onClick={() =>
                                            handleRemove(
                                                userId
                                            )
                                        }
                                    >
                                        {isRemoving
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>
                                </li>
                            );
                        }
                    )}
                </ul>
            )}
        </section>
    );
}

export default CollaboratorsList;