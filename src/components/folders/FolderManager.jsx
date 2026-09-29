import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "../common/Button";

import { folderService } from "../../features/folders/folderService";
import { useFolders } from "../../features/folders/useFolders";

import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toast";

import { getErrorMessage } from "../../utils/getErrorMessage";

function FolderManager() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useFolders();

  const folders = data?.data ?? [];

  const [name, setName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const createMutation = useMutation({
    mutationFn: folderService.createFolder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });

      setName("");

      showSuccessToast("Folder created successfully");
    },

    onError: (error) => {
      showErrorToast(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) =>
      folderService.updateFolder(id, name),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });

      setEditingFolderId(null);
      setEditingName("");

      showSuccessToast("Folder updated successfully");
    },

    onError: (error) => {
      showErrorToast(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: folderService.deleteFolder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });

      showSuccessToast("Folder deleted successfully");
    },

    onError: (error) => {
      showErrorToast(getErrorMessage(error));
    },
  });

  function handleCreate(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      showErrorToast("Folder name is required");
      return;
    }

    createMutation.mutate(trimmedName);
  }

  function startEditing(folder) {
    setEditingFolderId(folder._id);
    setEditingName(folder.name);
  }

  function cancelEditing() {
    setEditingFolderId(null);
    setEditingName("");
  }

  function handleUpdate(event, folderId) {
    event.preventDefault();

    const trimmedName = editingName.trim();

    if (!trimmedName) {
      showErrorToast("Folder name is required");
      return;
    }

    updateMutation.mutate({
      id: folderId,
      name: trimmedName,
    });
  }

  function handleDelete(folderId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this folder?"
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(folderId);
  }

  if (isLoading) {
    return <p>Loading folders...</p>;
  }

  if (isError) {
    return <p>Failed to load folders.</p>;
  }

  return (
    <section className="folder-manager">
      <div className="page-header">
        <div>
          <h2>Folders</h2>
          <p>Organize your notes into folders.</p>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          className="form-control"
          placeholder="Folder name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Add Folder"}
        </Button>
      </form>

      {folders.length === 0 ? (
        <p>No folders created yet.</p>
      ) : (
        <ul>
          {folders.map((folder) => (
            <li key={folder._id}>
              {editingFolderId === folder._id ? (
                <form
                  onSubmit={(event) =>
                    handleUpdate(event, folder._id)
                  }
                >
                  <input
                    type="text"
                    className="form-control"
                    value={editingName}
                    onChange={(event) =>
                      setEditingName(event.target.value)
                    }
                    maxLength={50}
                  />

                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>

                  <Button
                    type="button"
                    onClick={cancelEditing}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span>{folder.name}</span>

                  <Button
                    type="button"
                    onClick={() => startEditing(folder)}
                    disabled={deleteMutation.isPending}
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleDelete(folder._id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FolderManager;