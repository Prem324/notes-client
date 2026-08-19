import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NoteForm from "../components/notes/NoteForm";
import NotesList from "../components/notes/NotesList";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import NoteSearch from "../components/notes/NoteSearch";
import Pagination from "../components/common/Pagination";

import { noteService } from "../features/notes/noteService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../features/auth/AuthContext";
import useDebounce from "../hooks/useDebounce";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const DEFAULT_LIMIT = 10;

const defaultPagination = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function extractNotes(result) {
  if (Array.isArray(result?.data?.notes)) {
    return result.data.notes;
  }

  if (Array.isArray(result?.notes)) {
    return result.notes;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

function extractNote(result) {
  if (result?.data?.note?._id) {
    return result.data.note;
  }

  if (result?.note?._id) {
    return result.note;
  }

  if (result?.data?._id) {
    return result.data;
  }

  return null;
}

function extractPagination(result) {
  const pagination = result?.data?.pagination || result?.pagination;

  if (!pagination) {
    return defaultPagination;
  }

  const total = Number(pagination.totalNotes || pagination.total || 0);
  const limit = Number(pagination.limit || DEFAULT_LIMIT);
  const page = Number(pagination.currentPage || pagination.page || 1);
  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasPrevPage:
      typeof pagination.hasPrevPage === "boolean"
        ? pagination.hasPrevPage
        : page > 1,
    hasNextPage:
      typeof pagination.hasNextPage === "boolean"
        ? pagination.hasNextPage
        : page < totalPages,
  };
}

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [pagination, setPagination] = useState(defaultPagination);

  const debouncedSearch = useDebounce(search, 500);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const noteStats = useMemo(() => {
    const total = pagination.total;
    const completedOnPage = notes.filter((note) => note.completed).length;
    const pendingOnPage = notes.length - completedOnPage;

    return {
      total,
      completedOnPage,
      pendingOnPage,
    };
  }, [notes, pagination.total]);

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
    async (pageValue = 1, searchValue = "") => {
      try {
        setLoading(true);
        setError("");

        const result = await noteService.getNotes({
          page: pageValue,
          limit,
          search: searchValue,
        });

        console.log("GET NOTES RESULT:", result);

        const notesFromBackend = extractNotes(result);
        const paginationFromBackend = extractPagination(result);

        setNotes(notesFromBackend);
        setPagination(paginationFromBackend);
      } catch (error) {
        if (handleUnauthorized(error)) return;

        setError(getErrorMessage(error, "Failed to load notes"));
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized, limit]
  );

  useEffect(() => {
    fetchNotes(page, debouncedSearch);
  }, [page, debouncedSearch, fetchNotes]);

  async function handleAddNote(noteData) {
    try {
      setActionLoading(true);
      setError("");

      const result=await noteService.createNote(noteData);

      showSuccessToast(result.message || "Note created successfully");

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchNotes(1, debouncedSearch);
      }
    } catch (error) {
      if (handleUnauthorized(error)) return;

      const message=getErrorMessage(error, "Failed to create note");
      setError(message);
      showErrorToast(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      setActionLoading(true);
      setError("");

      const result=await noteService.deleteNote(noteId);

      showSuccessToast(result.message || "Note deleted successfully");

      const remainingNotesOnPage = notes.filter((note) => note._id !== noteId);

      if (remainingNotesOnPage.length === 0 && page > 1) {
        setPage((prevPage) => prevPage - 1);
      } else {
        await fetchNotes(page, debouncedSearch);
      }
    } catch (error) {
      if (handleUnauthorized(error)) return;

      const message=getErrorMessage(error, "Failed to delete note");
      setError(message);
      showErrorToast(message);
    } finally {
      setActionLoading(false);
    }
  }

async function handleToggleComplete(noteId) {
  const noteToUpdate = notes.find(
    (note) => note._id === noteId
  );

  if (!noteToUpdate) {
    const message = "Note not found";
    setError(message);
    showErrorToast(message);
    return;
  }

  const previousNotes = notes;
  const newCompleted = !noteToUpdate.completed;

  // Optimistic update
  setNotes((prevNotes) =>
    prevNotes.map((note) =>
      note._id === noteId
        ? {
            ...note,
            completed: newCompleted,
          }
        : note
    )
  );

  try {
    setError("");

    const result = await noteService.updateNote(noteId, {
      title: noteToUpdate.title,
      content: noteToUpdate.content,
      completed: newCompleted,
    });

    showSuccessToast(
      result.message ||
        (newCompleted
          ? "Note marked as completed"
          : "Note marked as pending")
    );
  } catch (error) {
    // Rollback
    setNotes(previousNotes);

    if (handleUnauthorized(error)) return;

    const message = getErrorMessage(
      error,
      "Failed to update note status"
    );

    setError(message);
    showErrorToast(message);
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
        const message="Note updated but response format was unexpected";
        setError(message);
        showErrorToast(message);
        return;
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === savedNote._id ? savedNote : note
        )
      );

      setEditingNote(null);
      showSuccessToast(result.message || "Note updated successfully");
    } catch (error) {
      if (handleUnauthorized(error)) return;

      const message = getErrorMessage(error, "Failed to update note");
      setError(message);
      showErrorToast(message);
    } finally {
      setActionLoading(false);
    }
  }

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
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
          <span>Completed on this page</span>
          <strong>{noteStats.completedOnPage}</strong>
        </div>

        <div className="stat-card">
          <span>Pending on this page</span>
          <strong>{noteStats.pendingOnPage}</strong>
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
        <>
          <NotesList
            notes={notes}
            search={search}
            onDeleteNote={handleDeleteNote}
            onToggleComplete={handleToggleComplete}
            onStartEdit={handleStartEdit}
            actionLoading={actionLoading}
          />

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            currentCount={notes.length}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={pagination.hasNextPage}
            loading={loading || actionLoading}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </>
      )}
    </div>
  );
}

export default NotesPage;