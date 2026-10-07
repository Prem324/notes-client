import {
  describe,
  expect,
  test,
  vi,
  beforeEach,
} from "vitest";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import ShareNoteForm from "./ShareNoteForm";

import { noteService } from "./noteService";

vi.mock("./noteService", () => ({
  noteService: {
    shareNote: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

describe("ShareNoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sharing fields", () => {
    render(
      <ShareNoteForm noteId="note1" />
    );

    expect(
      screen.getByLabelText("Collaborator email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Permission")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Share Note",
      })
    ).toBeInTheDocument();
  });

  test("shows validation error when email is empty", async () => {
    render(
      <ShareNoteForm noteId="note1" />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Share Note",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Email is required");

    expect(
      noteService.shareNote
    ).not.toHaveBeenCalled();
  });

  test("shows validation error for invalid email", async () => {
    render(
      <ShareNoteForm noteId="note1" />
    );

    fireEvent.change(
      screen.getByLabelText("Collaborator email"),
      {
        target: {
          value: "invalid-email",
        },
      }
    );

    fireEvent.submit(
  screen.getByRole("form", {
    name: "Share note form",
  })
);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Please enter a valid email address"
    );

    expect(
      noteService.shareNote
    ).not.toHaveBeenCalled();
  });

  test("shares note with viewer permission by default", async () => {
    noteService.shareNote.mockResolvedValue({
      success: true,
      message: "Note shared successfully",
    });

    const onShared = vi.fn();

    render(
      <ShareNoteForm
        noteId="note1"
        onShared={onShared}
      />
    );

    fireEvent.change(
      screen.getByLabelText("Collaborator email"),
      {
        target: {
          value: "viewer@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Share Note",
      })
    );

    await waitFor(() => {
      expect(
        noteService.shareNote
      ).toHaveBeenCalledWith("note1", {
        email: "viewer@example.com",
        permission: "viewer",
      });
    });

    expect(onShared).toHaveBeenCalled();
  });

  test("shares note with editor permission", async () => {
    noteService.shareNote.mockResolvedValue({
      success: true,
      message: "Note shared successfully",
    });

    render(
      <ShareNoteForm noteId="note1" />
    );

    fireEvent.change(
      screen.getByLabelText("Collaborator email"),
      {
        target: {
          value: "editor@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Permission"),
      {
        target: {
          value: "editor",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Share Note",
      })
    );

    await waitFor(() => {
      expect(
        noteService.shareNote
      ).toHaveBeenCalledWith("note1", {
        email: "editor@example.com",
        permission: "editor",
      });
    });
  });

  test("shows API error when sharing fails", async () => {
    noteService.shareNote.mockRejectedValue({
      response: {
        data: {
          message: "User already has access to this note",
        },
      },
    });

    render(
      <ShareNoteForm noteId="note1" />
    );

    fireEvent.change(
      screen.getByLabelText("Collaborator email"),
      {
        target: {
          value: "existing@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Share Note",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "User already has access to this note"
    );
  });

  test("disables form controls while sharing", async () => {
    let resolveRequest;

    noteService.shareNote.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(
      <ShareNoteForm noteId="note1" />
    );

    const emailInput =
      screen.getByLabelText("Collaborator email");

    const permissionSelect =
      screen.getByLabelText("Permission");

    fireEvent.change(emailInput, {
      target: {
        value: "user@example.com",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Share Note",
      })
    );

    expect(emailInput).toBeDisabled();
    expect(permissionSelect).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Sharing...",
      })
    ).toBeDisabled();

    resolveRequest({
      success: true,
      message: "Note shared successfully",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Share Note",
        })
      ).toBeEnabled();
    });
  });
});