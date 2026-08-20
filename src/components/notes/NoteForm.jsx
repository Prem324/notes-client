import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";

function NoteForm({
  onAddNote,
  editingNote,
  onUpdateNote,
  onCancelEdit,
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (editingNote) {
      reset({
        title: editingNote.title,
        content: editingNote.content,
      });
    } else {
      reset({
        title: "",
        content: "",
      });
    }
  }, [editingNote, reset]);

  async function handleFormSubmit(data) {
    const title = data.title.trim();
    const content = data.content.trim();

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        title,
        content,
      });
    } else {
      await onAddNote({
        title,
        content,
        completed: false,
      });
      reset({
        title: "",
        content: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h2>{editingNote ? "Edit Note" : "Create Note"}</h2>

      <Input
        label="Title"
        type="text"
        placeholder="Enter title"
        {...register("title", {
          required: "Title is required",
          minLength: {
            value: 3,
            message: "Title must be at least 3 characters",
          },
          maxLength: {
            value: 100,
            message: "Title must be less than 100 characters",
          },
          validate: (value) =>
            value.trim().length > 0 ||
            "Title cannot contain only spaces",
        })}
      />

      {errors.title && (
        <p className="field-error">{errors.title.message}</p>
      )}

      <Textarea
        label="Content"
        placeholder="Enter content"
        rows={4}
        {...register("content", {
          required: "Content is required",
          validate: (value) =>
            value.trim().length > 0 ||
            "Content cannot contain only spaces",
        })}
      />

      {errors.content && (
        <p className="field-error">{errors.content.message}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading
          ? editingNote
            ? "Updating..."
            : "Creating..."
          : editingNote
          ? "Update Note"
          : "Create Note"}
      </Button>

      {editingNote && (
        <Button
          type="button"
          onClick={onCancelEdit}
          disabled={loading}
        >
          Cancel
        </Button>
      )}
    </form>
  );
}

export default NoteForm;
