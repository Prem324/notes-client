import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NoteForm from "../components/notes/NoteForm";
import NotesList from "../components/notes/NotesList";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import NoteSearch from "../components/notes/NoteSearch";

import { noteService } from "../features/notes/noteService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../features/auth/AuthContext";
import useDebounce from "../hooks/useDebounce";

function extractNotes(result) {
  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.data?.notes)) {
    return result.data.notes;
  }

  if (Array.isArray(result.notes)) {
    return result.notes;
  }

  return [];
}

function extractNote(result) {
  if (result.data?._id) {
    return result.data;
  }

  if (result.data?.note?._id) {
    return result.data.note;
  }

  if (result.note?._id) {
    return result.note;
  }

  return null;
}

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const noteStats = useMemo(() => {
    const total = notes.length;
    const completed = notes.filter((note) => note.completed).length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
    };
  }, [notes]);

  const handleUnauthorized = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return true;
      }

      return false;
    },
    [logout, navigate]
  );

  const fetchNotes = useCallback(
    async (searchValue = "") => {
      try {
        setLoading(true);
        setError("");

        const result = await noteService.getNotes({
          page: 1,
          limit: 10,
          search: searchValue,
        });

        const notesFromBackend = extractNotes(result);

        setNotes(notesFromBackend);
      } catch (error) {
        if (handleUnauthorized(error)) return;

        setError(getErrorMessage(error, "Failed to load notes"));
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    fetchNotes(debouncedSearch);
  }, [debouncedSearch, fetchNotes]);

  async function handleAddNote(noteData) {
    try {
      setActionLoading(true);
      setError("");

      await noteService.createNote(noteData);

      await fetchNotes(search);
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to create note"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      setActionLoading(true);
      setError("");

      await noteService.deleteNote(noteId);

      setNotes((prevNotes) =>
        prevNotes.filter((note) => note._id !== noteId)
      );
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to delete note"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleComplete(noteId) {
    try {
      setActionLoading(true);
      setError("");

      const noteToUpdate = notes.find((note) => note._id === noteId);

      if (!noteToUpdate) {
        setError("Note not found");
        return;
      }

      const result = await noteService.updateNote(noteId, {
        title: noteToUpdate.title,
        content: noteToUpdate.content,
        completed: !noteToUpdate.completed,
      });

      const savedNote = extractNote(result);

      if (!savedNote) {
        setError("Note updated but response format was unexpected");
        return;
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === savedNote._id ? savedNote : note
        )
      );
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to update note status"));
    } finally {
      setActionLoading(false);
    }
  }

  const handleStartEdit = useCallback((note) => {
    setEditingNote(note);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingNote(null);
  }, []);

  async function handleUpdateNote(updatedNote) {
    try {
      setActionLoading(true);
      setError("");

      const result = await noteService.updateNote(updatedNote._id, {
        title: updatedNote.title,
        content: updatedNote.content,
        completed: updatedNote.completed,
      });

      const savedNote = extractNote(result);

      if (!savedNote) {
        setError("Note updated but response format was unexpected");
        return;
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === savedNote._id ? savedNote : note
        )
      );

      setEditingNote(null);
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to update note"));
    } finally {
      setActionLoading(false);
    }
  }

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Notes</h1>
          <p>Manage your personal notes, comments, and attachments.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{noteStats.total}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{noteStats.completed}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{noteStats.pending}</strong>
        </div>
      </div>

      <ErrorMessage message={error} />

      <NoteSearch
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      <NoteForm
        onAddNote={handleAddNote}
        editingNote={editingNote}
        onUpdateNote={handleUpdateNote}
        onCancelEdit={handleCancelEdit}
        loading={actionLoading}
      />

      {loading ? (
        <Loader message="Loading notes..." />
      ) : (
        <NotesList
          notes={notes}
          search={search}
          onDeleteNote={handleDeleteNote}
          onToggleComplete={handleToggleComplete}
          onStartEdit={handleStartEdit}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

export default NotesPage;