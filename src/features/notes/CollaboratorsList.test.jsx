import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
  it,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import CollaboratorsList from "./CollaboratorsList";

import { noteService } from "./noteService";

vi.mock("./noteService", () => ({
  noteService: {
    getNoteCollaborators: vi.fn(),
    updateCollaboratorPermission: vi.fn(),
    removeCollaborator: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

describe("CollaboratorsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    noteService.getNoteCollaborators.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  test("shows loading state while collaborators are loading", async () => {
    let resolveRequest;

    noteService.getNoteCollaborators.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      screen.getByText("Loading collaborators...")
    ).toBeInTheDocument();

    resolveRequest({
      success: true,
      data: [],
    });

    await waitFor(() => {
      expect(
        screen.getByText("No collaborators yet.")
      ).toBeInTheDocument();
    });
  });

  test("loads and displays collaborators", async () => {
    noteService.getNoteCollaborators.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "share1",
          permission: "editor",
          user: {
            _id: "user2",
            name: "Editor User",
            email: "editor@example.com",
          },
        },
        {
          _id: "share2",
          permission: "viewer",
          user: {
            _id: "user3",
            name: "Viewer User",
            email: "viewer@example.com",
          },
        },
      ],
    });

    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      await screen.findByText("Editor User")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Viewer User")
    ).toBeInTheDocument();

    const rows = screen.getAllByRole("listitem");

    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveTextContent(
      "Editor User"
    );

    expect(rows[0]).toHaveTextContent(
      "editor@example.com"
    );

    expect(rows[0]).toHaveTextContent(
      "Editor"
    );

    expect(rows[1]).toHaveTextContent(
      "Viewer User"
    );

    expect(rows[1]).toHaveTextContent(
      "viewer@example.com"
    );

    expect(rows[1]).toHaveTextContent(
      "Viewer"
    );

    expect(
      noteService.getNoteCollaborators
    ).toHaveBeenCalledWith("note1");
  });

  test("shows empty state when there are no collaborators", async () => {
    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      await screen.findByText("No collaborators yet.")
    ).toBeInTheDocument();
  });

  test("updates collaborator permission", async () => {
    noteService.getNoteCollaborators.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "share1",
          permission: "viewer",
          user: {
            _id: "user2",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ],
    });

    noteService.updateCollaboratorPermission.mockResolvedValue({
      success: true,
      message:
        "Collaborator permission updated successfully",
    });

    render(
      <CollaboratorsList noteId="note1" />
    );

    const select = await screen.findByLabelText(
      "Permission"
    );

    expect(select).toHaveValue("viewer");

    fireEvent.change(select, {
      target: {
        value: "editor",
      },
    });

    await waitFor(() => {
      expect(
        noteService.updateCollaboratorPermission
      ).toHaveBeenCalledWith(
        "note1",
        "user2",
        "editor"
      );
    });

    expect(select).toHaveValue("editor");
  });

  test("removes collaborator after confirmation", async () => {
    noteService.getNoteCollaborators.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "share1",
          permission: "viewer",
          user: {
            _id: "user2",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ],
    });

    noteService.removeCollaborator.mockResolvedValue({
      success: true,
      message:
        "Collaborator removed successfully",
    });

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      await screen.findByText("Test User")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove",
      })
    );

    expect(confirmSpy).toHaveBeenCalledWith(
      "Remove this collaborator from the note?"
    );

    await waitFor(() => {
      expect(
        noteService.removeCollaborator
      ).toHaveBeenCalledWith(
        "note1",
        "user2"
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("No collaborators yet.")
      ).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  test("does not remove collaborator when confirmation is cancelled", async () => {
    noteService.getNoteCollaborators.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "share1",
          permission: "viewer",
          user: {
            _id: "user2",
            name: "Test User",
            email: "test@example.com",
          },
        },
      ],
    });

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(false);

    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      await screen.findByText("Test User")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove",
      })
    );

    expect(
      noteService.removeCollaborator
    ).not.toHaveBeenCalled();

    expect(
      screen.getByText("Test User")
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("shows API error when loading collaborators fails", async () => {
    noteService.getNoteCollaborators.mockRejectedValue({
      response: {
        data: {
          message: "Failed to load collaborators",
        },
      },
    });

    render(
      <CollaboratorsList noteId="note1" />
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Failed to load collaborators"
    );

    expect(
      screen.getByRole("button", {
        name: "Retry",
      })
    ).toBeInTheDocument();
  });

  it("should reload collaborators when refreshKey changes", async () => {
    noteService.getNoteCollaborators
        .mockResolvedValue({
            data: [],
        });

    const { rerender } = render(
        <CollaboratorsList
            noteId="note-1"
            refreshKey={0}
        />
    );

    await waitFor(() => {
        expect(
            noteService.getNoteCollaborators
        ).toHaveBeenCalledTimes(1);
    });

    rerender(
        <CollaboratorsList
            noteId="note-1"
            refreshKey={1}
        />
    );

    await waitFor(() => {
        expect(
            noteService.getNoteCollaborators
        ).toHaveBeenCalledTimes(2);
    });
});
});