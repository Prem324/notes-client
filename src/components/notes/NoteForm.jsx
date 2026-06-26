import { useEffect, useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import ErrorMessage from "../common/ErrorMessage";

function NoteForm({
  onAddNote,
  editingNote,
  onUpdateNote,
  onCancelEdit,
  loading=false,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle("");
      setContent("");
    }

    setError("");
  }, [editingNote]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.trim().length < 3) {
    setError("Title must be at least 3 characters");
    return;
    }

if (title.trim().length > 100) {
  setError("Title must be less than 100 characters");
  return;
}

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        title,
        content,
      });
    } else {
      onAddNote({
        title,
        content,
        completed: false,
      });
    }

    setTitle("");
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editingNote ? "Edit Note" : "Create Note"}</h2>

      <ErrorMessage message={error} />

      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
      />

        <Textarea
        label="Content"
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content"
        />
      

      <Button type="submit" disabled={loading}>
        {loading
        ? editingNote? "Updating...": "Creating..."
        : editingNote? "Update Note": "Create Note"}
        </Button>

        {editingNote && (
        <Button onClick={onCancelEdit}>
          Cancel
        </Button>
      )}
    </form>
  );
}

export default NoteForm;