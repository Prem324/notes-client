import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tagService } from "../../features/tags/tagService";
import { useTags } from "../../features/tags/useTags";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { getErrorMessage } from "../../utils/getErrorMessage";

function TagManager() {
  const [name, setName] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useTags();

  const tags = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: tagService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });

      setName("");
      showSuccessToast("Tag created successfully");
    },
    onError: (error) => {
      showErrorToast(
        getErrorMessage(error, "Failed to create tag")
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) =>
      tagService.updateTag(id, name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });

      setEditingTagId(null);
      setEditingName("");

      showSuccessToast("Tag updated successfully");
    },

    onError: (error) => {
      showErrorToast(
        getErrorMessage(error, "Failed to update tag")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagService.deleteTag,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags"],
      });

      showSuccessToast("Tag deleted successfully");
    },

    onError: (error) => {
      showErrorToast(
        getErrorMessage(error, "Failed to delete tag")
      );
    },
  });

  const handleCreate = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      showErrorToast("Tag name is required");
      return;
    }

    createMutation.mutate(trimmedName);
  };

  const handleStartEdit = (tag) => {
    setEditingTagId(tag._id);
    setEditingName(tag.name);
  };

  const handleUpdate = (event) => {
    event.preventDefault();

    const trimmedName = editingName.trim();

    if (!trimmedName) {
      showErrorToast("Tag name is required");
      return;
    }

    updateMutation.mutate({
      id: editingTagId,
      name: trimmedName,
    });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tag?"
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <p>Loading tags...</p>;
  }

  if (isError) {
    return <p>Failed to load tags.</p>;
  }

  return (
    <section className="tag-manager">
      <div className="page-header">
        <div>
          <h2>Tags</h2>
          <p>Organize your notes with reusable tags.</p>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter tag name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
          disabled={createMutation.isPending}
        />

        <button
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Add Tag"}
        </button>
      </form>

      {tags.length === 0 ? (
        <p>No tags created yet.</p>
      ) : (
        <ul>
          {tags.map((tag) => (
            <li key={tag._id}>
              {editingTagId === tag._id ? (
                <form onSubmit={handleUpdate}>
                  <input
                    type="text"
                    className="form-control"
                    value={editingName}
                    onChange={(event) =>
                      setEditingName(event.target.value)
                    }
                    maxLength={50}
                    disabled={updateMutation.isPending}
                  />

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTagId(null);
                      setEditingName("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span>{tag.name}</span>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(tag)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(tag._id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TagManager;