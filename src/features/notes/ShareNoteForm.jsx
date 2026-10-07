import { useState } from "react";

import { noteService } from "./noteService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

function ShareNoteForm({ noteId, onShared }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await noteService.shareNote(noteId, {
        email: trimmedEmail,
        permission,
      });

      showSuccessToast(
        result.message || "Note shared successfully"
      );

      setEmail("");
      setPermission("viewer");

      if (onShared) {
        await onShared();
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to share note"
      );

      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Share note form"
    >
      <div>
        <label htmlFor="share-email">
          Collaborator email
        </label>

        <input
          id="share-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="user@example.com"
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="share-permission">
          Permission
        </label>

        <select
          id="share-permission"
          value={permission}
          onChange={(event) =>
            setPermission(event.target.value)
          }
          disabled={loading}
        >
          <option value="viewer">
            Viewer — can read
          </option>

          <option value="editor">
            Editor — can read and edit
          </option>
        </select>
      </div>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? "Sharing..." : "Share Note"}
      </button>
    </form>
  );
}

export default ShareNoteForm;