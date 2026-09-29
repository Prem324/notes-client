import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import FolderManager from "./FolderManager";

import { folderService } from "../../features/folders/folderService";

vi.mock("../../features/folders/folderService", () => ({
  folderService: {
    getFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

function renderFolderManager() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FolderManager />
    </QueryClientProvider>
  );
}

describe("FolderManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  it("should show loading state", () => {
    folderService.getFolders.mockReturnValue(
      new Promise(() => {})
    );

    renderFolderManager();

    expect(
      screen.getByText("Loading folders...")
    ).toBeInTheDocument();
  });

  it("should show error state", async () => {
    folderService.getFolders.mockRejectedValue(
      new Error("Failed to load folders")
    );

    renderFolderManager();

    expect(
      await screen.findByText("Failed to load folders.")
    ).toBeInTheDocument();
  });

  it("should show empty state", async () => {
    renderFolderManager();

    expect(
      await screen.findByText("No folders created yet.")
    ).toBeInTheDocument();
  });

  it("should display folders", async () => {
    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "folder-1",
          name: "Work",
        },
        {
          _id: "folder-2",
          name: "Personal",
        },
      ],
    });

    renderFolderManager();

    expect(
      await screen.findByText("Work")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Personal")
    ).toBeInTheDocument();
  });

  it("should create a folder", async () => {
    const user = userEvent.setup();

    folderService.createFolder.mockResolvedValue({
      success: true,
      data: {
        _id: "folder-1",
        name: "Work",
      },
    });

    renderFolderManager();

    const input = await screen.findByPlaceholderText(
      "Folder name"
    );

    await user.type(input, "Work");

    await user.click(
      screen.getByRole("button", {
        name: "Add Folder",
      })
    );

    await waitFor(() => {
      expect(folderService.createFolder).toHaveBeenCalledWith(
        "Work",
        expect.any(Object)
      );
    });
  });

  it("should edit a folder", async () => {
    const user = userEvent.setup();

    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "folder-1",
          name: "Work",
        },
      ],
    });

    folderService.updateFolder.mockResolvedValue({
      success: true,
      data: {
        _id: "folder-1",
        name: "Office",
      },
    });

    renderFolderManager();

    await user.click(
      await screen.findByRole("button", {
        name: "Edit",
      })
    );

    const input = screen.getByDisplayValue("Work");

    await user.clear(input);
    await user.type(input, "Office");

    await user.click(
      screen.getByRole("button", {
        name: "Save",
      })
    );

    await waitFor(() => {
      expect(folderService.updateFolder).toHaveBeenCalledWith(
        "folder-1",
        "Office"
      );
    });
  });

  it("should cancel editing a folder", async () => {
    const user = userEvent.setup();

    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "folder-1",
          name: "Work",
        },
      ],
    });

    renderFolderManager();

    await user.click(
      await screen.findByRole("button", {
        name: "Edit",
      })
    );

    expect(
      screen.getByDisplayValue("Work")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      })
    );

    expect(
      screen.queryByDisplayValue("Work")
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Work")
    ).toBeInTheDocument();
  });

  it("should delete a folder after confirmation", async () => {
    const user = userEvent.setup();

    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "folder-1",
          name: "Work",
        },
      ],
    });

    folderService.deleteFolder.mockResolvedValue({
      success: true,
      data: null,
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderFolderManager();

    await user.click(
      await screen.findByRole("button", {
        name: "Delete",
      })
    );

    await waitFor(() => {
      expect(folderService.deleteFolder).toHaveBeenCalledWith(
        "folder-1",
        expect.any(Object)
      );
    });
  });

  it("should not delete a folder when confirmation is cancelled", async () => {
    const user = userEvent.setup();

    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "folder-1",
          name: "Work",
        },
      ],
    });

    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderFolderManager();

    await user.click(
      await screen.findByRole("button", {
        name: "Delete",
      })
    );

    expect(
      folderService.deleteFolder
    ).not.toHaveBeenCalled();
  });
});