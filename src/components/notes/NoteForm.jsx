import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";

import FeatureGate from "../../features/featureFlags/FeatureGate";
import { useFeatureFlags } from "../../features/featureFlags/useFeatureFlags";

import NoteTagSelector from "../tags/NoteTagSelector";

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
      tags: [],
    },
  });

  const { isEnabled } = useFeatureFlags();

  const tagsEnabled = isEnabled("tags");

  useEffect(() => {
    if (editingNote) {
      reset({
        title: editingNote.title,
        content: editingNote.content,
        tags:
          editingNote.tags?.map((tag) =>
            typeof tag === "string" ? tag : tag._id
          ) ?? [],
      });
    } else {
      reset({
        title: "",
        content: "",
        tags: [],
      });
    }
  }, [editingNote, reset]);

  async function handleFormSubmit(data) {
    const title = data.title.trim();
    const content = data.content.trim();

    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        title,
        content,
      };

      // Only modify tags when the feature is enabled.
      // Otherwise existing tags are preserved.
      if (tagsEnabled) {
        updatedNote.tags = data.tags ?? [];
      }

      onUpdateNote(updatedNote);
      return;
    }

    const newNote = {
      title,
      content,
      completed: false,
    };

    // Only send tags when the Tags feature is enabled.
    if (tagsEnabled) {
      newNote.tags = data.tags ?? [];
    }

    await onAddNote(newNote);

    reset({
      title: "",
      content: "",
      tags: [],
    });
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
        <p className="field-error">
          {errors.title.message}
        </p>
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
        <p className="field-error">
          {errors.content.message}
        </p>
      )}

      <FeatureGate feature="tags">
        <NoteTagSelector register={register} />
      </FeatureGate>

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