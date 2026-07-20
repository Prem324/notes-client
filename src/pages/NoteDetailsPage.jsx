import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import CommentForm from "../components/comments/CommentForm";
import CommentsList from "../components/comments/CommentsList";

import AttachmentForm from "../components/attachments/AttachmentForm";
import AttachmentList from "../components/attachments/AttachmentList";

import { noteService } from "../features/notes/noteService";
import { commentService } from "../features/comments/commentService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "../features/auth/AuthContext";
import { socket } from "../socket/socket";
import { showSuccessToast, showErrorToast } from "../utils/toast";



function extractComments(result) {
  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.data?.comments)) {
    return result.data.comments;
  }

  if (Array.isArray(result.comments)) {
    return result.comments;
  }

  return [];
}

function extractComment(result) {
  if (result.data?._id) {
    return result.data;
  }

  if (result.data?.comment?._id) {
    return result.data.comment;
  }

  if (result.comment?._id) {
    return result.comment;
  }

  return null;
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

function NoteDetailsPage() {
  const { noteId } = useParams();

  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);

  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
  const [attachmentUploadLoading, setAttachmentUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");


  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleUnauthorized(error) {
    if (error.response?.status === 401) {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }

  async function fetchNoteDetails() {
    try {
      setLoading(true);
      setError("");

      const [noteResult, commentsResult] = await Promise.all([
        noteService.getNoteById(noteId),
        commentService.getCommentsByNote(noteId),
      ]);

      const selectedNote = extractNote(noteResult);
      const commentsFromBackend = extractComments(commentsResult);

      setNote(selectedNote);
      setComments(commentsFromBackend);
    } catch (error) {
      if (handleUnauthorized(error)) return;

      setError(getErrorMessage(error, "Failed to load note details"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNoteDetails();
  }, [noteId]);

/*useEffect(() => {
  function handleConnect() {
    console.log("Socket connected:", socket.id);
  }

  function handleDisconnect() {
    console.log("Socket disconnected");
  }

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
  };
}, []);*/


  useEffect(() => {
  if (!noteId) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join-note", noteId);

  function handleCommentCreated(payload) {

    if(payload.noteId !== noteId){
      return;
    }

    const newComment=payload.comment;

    setComments((prevComments) => {
      const alreadyExists = prevComments.some(
        (comment) => String(comment._id) === String(newComment._id)
      );

      if (alreadyExists) {
        return prevComments;
      }

      return [newComment, ...prevComments];
    });
  }

  socket.on("comment:created", handleCommentCreated);

  return () => {
    socket.off("comment:created", handleCommentCreated);
    socket.emit("leave-note", noteId);
  };
}, [noteId]);

  async function handleAddComment(text) {
    try {
      setCommentLoading(true);
      setError("");

      const result = await commentService.createComment(noteId, text);

      const createdComment = extractComment(result);

      if (!createdComment) {
        const message="Comment created but response format was unexpected";
        setError(message);
        showErrorToast(message);
        return false;
      }
      showSuccessToast(result.message || "Comment added successfully");

      return true;
    } catch (error) {
      if (handleUnauthorized(error)) return false;

      const message=getErrorMessage(error, "Failed to add comment");
      setError(message);
      showErrorToast(message);
      return false;
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleUploadAttachments(formData) {
  try {
    setAttachmentUploadLoading(true);
    setError("");

    const result = await noteService.uploadAttachments(noteId, formData);

    const updatedNote = extractNote(result);

    if (!updatedNote) {
      setError("Files uploaded but response format was unexpected");
      return false;
    }

    setNote(updatedNote);
    showSuccessToast(result.message || "Attachment uploaded successfully");

    return true;
  } catch (error) {
    if (handleUnauthorized(error)) return false;

    const message=getErrorMessage(error, "Failed to upload attachments");
    setError(message);
    showErrorToast(message);
    return false;
  } finally {
    setAttachmentUploadLoading(false);
  }
}

async function handleDeleteAttachment(attachment) {
  try {
    setDeletingAttachmentId(attachment._id);
    setError("");

    const result = await noteService.deleteAttachment(
      noteId,
      attachment._id
    );

    const updatedNote = extractNote(result);

    if (!updatedNote) {
      const message="Attachment deleted but response format was unexpected";
      setError(message)
      showErrorToast(message);
      return;
    }

    setNote(updatedNote);
    showSuccessToast(result.message || "Attachment deleted successfully");
  } catch (error) {
    if (handleUnauthorized(error)) return;

    const message=getErrorMessage(error, "Failed to delete attachment");
    setError(message);
    showErrorToast(message);
  } finally {
    setDeletingAttachmentId(null);
  }
}

  if (loading) {
    return <Loader message="Loading note details..." />;
  }

  return (
    <div>
      <Link to="/notes">Back to Notes</Link>

      <div className="page-header">
  <div>
    <h1>Note Details</h1>
    <p>Manage your personal note, comments, and attachments.</p>
  </div>
</div>

      <ErrorMessage message={error} />

      {note ? (
        <div>
          <h2>{note.title}</h2>
          <p>{note.content}</p>
          <p>Status: {note.completed ? "Completed" : "Pending"}</p>
        </div>
      ) : (
        <p>Note not found</p>
      )}

      {note && (
        <>
        <AttachmentList 
        attachments={note.attachments || []} 
        onDeleteAttachment={handleDeleteAttachment}
        deletingAttachmentId={deletingAttachmentId}
        />
        
        <AttachmentForm
        onUploadAttachments={handleUploadAttachments}
        loading={attachmentUploadLoading}
        />
        </>
      )}

      <CommentForm
        onAddComment={handleAddComment}
        loading={commentLoading}
      />

      <CommentsList comments={comments} />
    </div>
  );
}

export default NoteDetailsPage;