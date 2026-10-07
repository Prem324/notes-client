import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import NoteDetailsPage from "./NoteDetailsPage";

import { noteService } from "../features/notes/noteService";
import { commentService } from "../features/comments/commentService";
import { useAuth } from "../features/auth/AuthContext";
import { useFeatureFlags } from "../features/featureFlags/useFeatureFlags";

import { useParams, useNavigate } from "react-router-dom";

vi.mock("../features/notes/noteService", () => ({
  noteService: {
    getNoteById: vi.fn(),
    uploadAttachments: vi.fn(),
    deleteAttachment: vi.fn(),
  },
}));

vi.mock("../features/comments/commentService", () => ({
  commentService: {
    getCommentsByNote: vi.fn(),
    createComment: vi.fn(),
  },
}));

vi.mock("../features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../features/featureFlags/useFeatureFlags", () => ({
  useFeatureFlags: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual(
    "react-router-dom"
  );

  return {
    ...actual,

    Link: ({ children }) => (
      <a href="/notes">{children}</a>
    ),

    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock("../socket/socket", () => ({
  socket: {
    connected: false,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("../components/common/Loader", () => ({
  default: ({ message }) => (
    <div>{message}</div>
  ),
}));

vi.mock("../components/common/ErrorMessage", () => ({
  default: ({ message }) =>
    message ? (
      <div role="alert">{message}</div>
    ) : null,
}));

vi.mock("../components/comments/CommentForm", () => ({
  default: ({ onAddComment, loading }) => (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          onAddComment("Test comment")
        }
      >
        Add Comment
      </button>
    </div>
  ),
}));

vi.mock("../components/comments/CommentsList", () => ({
  default: ({ comments }) => (
    <div data-testid="comments-list">
      Comments: {comments.length}
    </div>
  ),
}));

vi.mock("../components/attachments/AttachmentForm", () => ({
  default: ({ loading }) => (
    <div data-testid="attachment-form">
      Attachment Form
      {loading && " Loading"}
    </div>
  ),
}));

vi.mock("../components/attachments/AttachmentList", () => ({
  default: ({
    attachments,
    onDeleteAttachment,
  }) => (
    <div data-testid="attachment-list">
      <span>
        Attachments: {attachments.length}
      </span>

      {onDeleteAttachment && (
        <button
          type="button"
          onClick={() =>
            onDeleteAttachment({
              _id: "attachment1",
            })
          }
        >
          Delete Attachment
        </button>
      )}
    </div>
  ),
}));

vi.mock("../features/notes/ShareNoteForm", () => ({
  default: ({ noteId, onShared }) => (
    <div data-testid="share-note-form">
      Share Note Form: {noteId}

      <button
        type="button"
        onClick={onShared}
      >
        Share Note Mock
      </button>
    </div>
  ),
}));

vi.mock("../features/notes/CollaboratorsList", () => ({
  default: ({ noteId, refreshKey }) => (
    <div data-testid="collaborators-list">
      Collaborators List: {noteId}

      <span data-testid="collaborators-refresh-key">
        {refreshKey}
      </span>
    </div>
  ),
}));

describe("NoteDetailsPage", () => {
  const navigateMock = vi.fn();
  const logoutMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useParams.mockReturnValue({
      noteId: "note1",
    });

    useNavigate.mockReturnValue(
      navigateMock
    );

    useAuth.mockReturnValue({
      logout: logoutMock,
    });

    useFeatureFlags.mockReturnValue({
      flags: {
        noteSharing: true,
      },

      isLoading: false,

      isError: false,

      error: null,

      isEnabled: (featureName) =>
        featureName === "noteSharing",
    });

    noteService.getNoteById.mockResolvedValue({
      success: true,

      data: {
        _id: "note1",
        title: "Test Note",
        content: "Test note content",
        completed: false,
        accessRole: "owner",
        attachments: [],
      },
    });

    commentService.getCommentsByNote.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  test("shows loading state while note is loading", async () => {
    let resolveNote;

    noteService.getNoteById.mockReturnValue(
      new Promise((resolve) => {
        resolveNote = resolve;
      })
    );

    render(<NoteDetailsPage />);

    expect(
      screen.getByText(
        "Loading note details..."
      )
    ).toBeInTheDocument();

    resolveNote({
      success: true,

      data: {
        _id: "note1",
        title: "Test Note",
        content: "Test content",
        completed: false,
        accessRole: "owner",
        attachments: [],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText("Test Note")
      ).toBeInTheDocument();
    });
  });

  test("loads and displays note details", async () => {
    render(<NoteDetailsPage />);

    expect(
      await screen.findByText("Test Note")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Test note content")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Status: Pending")
    ).toBeInTheDocument();

    expect(
      screen.getByText("owner", {
        selector: "strong",
      })
    ).toBeInTheDocument();

    expect(
      noteService.getNoteById
    ).toHaveBeenCalledWith("note1");

    expect(
      commentService.getCommentsByNote
    ).toHaveBeenCalledWith("note1");
  });

  test(
    "owner sees sharing management UI when note sharing is enabled",
    async () => {
      render(<NoteDetailsPage />);

      expect(
        await screen.findByTestId(
          "share-note-form"
        )
      ).toHaveTextContent(
        "Share Note Form: note1"
      );

      expect(
        screen.getByTestId(
          "collaborators-list"
        )
      ).toHaveTextContent(
        "Collaborators List: note1"
      );

      expect(
        screen.getByTestId(
          "collaborators-refresh-key"
        )
      ).toHaveTextContent("0");
    }
  );

  test(
    "admin sees sharing management UI when note sharing is enabled",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Admin Note",
          content: "Admin content",
          completed: false,
          accessRole: "admin",
          attachments: [],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByTestId(
          "share-note-form"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(
          "collaborators-list"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText("admin", {
          selector: "strong",
        })
      ).toBeInTheDocument();
    }
  );

  test(
    "editor does not see sharing management UI",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Editor Note",
          content: "Editor content",
          completed: false,
          accessRole: "editor",
          attachments: [],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Editor Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "share-note-form"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "collaborators-list"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.getByText("editor", {
          selector: "strong",
        })
      ).toBeInTheDocument();
    }
  );

  test(
    "viewer does not see sharing management UI",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Viewer Note",
          content: "Viewer content",
          completed: false,
          accessRole: "viewer",
          attachments: [],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Viewer Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "share-note-form"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "collaborators-list"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.getByText("viewer", {
          selector: "strong",
        })
      ).toBeInTheDocument();
    }
  );

  test(
    "hides sharing UI when note sharing feature is disabled",
    async () => {
      useFeatureFlags.mockReturnValue({
        flags: {
          noteSharing: false,
        },

        isLoading: false,

        isError: false,

        error: null,

        isEnabled: () => false,
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Test Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "share-note-form"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "collaborators-list"
        )
      ).not.toBeInTheDocument();
    }
  );

  test(
    "hides sharing UI while feature flags are loading",
    async () => {
      useFeatureFlags.mockReturnValue({
        flags: {},

        isLoading: true,

        isError: false,

        error: null,

        isEnabled: () => false,
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Test Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "share-note-form"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "collaborators-list"
        )
      ).not.toBeInTheDocument();
    }
  );

  test(
    "hides sharing UI when feature flag request fails",
    async () => {
      useFeatureFlags.mockReturnValue({
        flags: {},

        isLoading: false,

        isError: true,

        error: new Error(
          "Feature flag request failed"
        ),

        isEnabled: () => false,
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Test Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "share-note-form"
        )
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "collaborators-list"
        )
      ).not.toBeInTheDocument();
    }
  );

  test(
    "editor sees attachment upload UI",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Editor Note",
          content: "Editor content",
          completed: false,
          accessRole: "editor",
          attachments: [],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByTestId(
          "attachment-form"
        )
      ).toBeInTheDocument();
    }
  );

  test(
    "viewer does not see attachment upload UI",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Viewer Note",
          content: "Viewer content",
          completed: false,
          accessRole: "viewer",
          attachments: [],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Viewer Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId(
          "attachment-form"
        )
      ).not.toBeInTheDocument();
    }
  );

  test(
    "editor does not see delete attachment control",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Editor Note",
          content: "Editor content",
          completed: false,
          accessRole: "editor",

          attachments: [
            {
              _id: "attachment1",
              fileName: "test.pdf",
            },
          ],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Editor Note")
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(
          "attachment-list"
        )
      ).toHaveTextContent(
        "Attachments: 1"
      );

      expect(
        screen.queryByRole("button", {
          name: "Delete Attachment",
        })
      ).not.toBeInTheDocument();
    }
  );

  test(
    "viewer does not see delete attachment control",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Viewer Note",
          content: "Viewer content",
          completed: false,
          accessRole: "viewer",

          attachments: [
            {
              _id: "attachment1",
              fileName: "test.pdf",
            },
          ],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Viewer Note")
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Delete Attachment",
        })
      ).not.toBeInTheDocument();
    }
  );

  test(
    "owner sees delete attachment control",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Owner Note",
          content: "Owner content",
          completed: false,
          accessRole: "owner",

          attachments: [
            {
              _id: "attachment1",
              fileName: "test.pdf",
            },
          ],
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByRole("button", {
          name: "Delete Attachment",
        })
      ).toBeInTheDocument();
    }
  );

  test(
    "renders comments and attachments",
    async () => {
      noteService.getNoteById.mockResolvedValue({
        success: true,

        data: {
          _id: "note1",
          title: "Test Note",
          content: "Test content",
          completed: true,
          accessRole: "owner",

          attachments: [
            {
              _id: "attachment1",
              fileName: "document.pdf",
            },
          ],
        },
      });

      commentService.getCommentsByNote.mockResolvedValue({
        success: true,

        data: [
          {
            _id: "comment1",
            text: "Existing comment",
          },
          {
            _id: "comment2",
            text: "Another comment",
          },
        ],
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByText("Test Note")
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(
          "attachment-list"
        )
      ).toHaveTextContent(
        "Attachments: 1"
      );

      expect(
        screen.getByTestId(
          "comments-list"
        )
      ).toHaveTextContent(
        "Comments: 2"
      );
    }
  );

  test(
    "redirects to login when note request returns 401",
    async () => {
      noteService.getNoteById.mockRejectedValue({
        response: {
          status: 401,
        },
      });

      render(<NoteDetailsPage />);

      await waitFor(() => {
        expect(
          logoutMock
        ).toHaveBeenCalled();

        expect(
          navigateMock
        ).toHaveBeenCalledWith(
          "/login"
        );
      });
    }
  );

  test(
    "handles note loading errors",
    async () => {
      noteService.getNoteById.mockRejectedValue({
        response: {
          status: 500,

          data: {
            message: "Unable to load note",
          },
        },
      });

      render(<NoteDetailsPage />);

      expect(
        await screen.findByRole("alert")
      ).toHaveTextContent(
        "Unable to load note"
      );
    }
  );

  test(
    "initializes the note Socket.IO subscription",
    async () => {
      const { socket } = await import(
        "../socket/socket"
      );

      render(<NoteDetailsPage />);

      await screen.findByText("Test Note");

      expect(
        socket.connect
      ).toHaveBeenCalled();

      expect(
        socket.emit
      ).toHaveBeenCalledWith(
        "join-note",
        "note1"
      );

      expect(
        socket.on
      ).toHaveBeenCalledWith(
        "comment:created",
        expect.any(Function)
      );
    }
  );

  test(
    "renders comment form",
    async () => {
      render(<NoteDetailsPage />);

      expect(
        await screen.findByRole("button", {
          name: "Add Comment",
        })
      ).toBeInTheDocument();
    }
  );

  test(
    "calls createComment when adding a comment",
    async () => {
      commentService.createComment.mockResolvedValue({
        success: true,

        message:
          "Comment added successfully",

        data: {
          _id: "comment1",
          text: "Test comment",
        },
      });

      render(<NoteDetailsPage />);

      const button =
        await screen.findByRole(
          "button",
          {
            name: "Add Comment",
          }
        );

      fireEvent.click(button);

      await waitFor(() => {
        expect(
          commentService.createComment
        ).toHaveBeenCalledWith(
          "note1",
          "Test comment"
        );
      });
    }
  );

  test(
    "refreshes collaborators after a successful share",
    async () => {
      render(<NoteDetailsPage />);

      expect(
        await screen.findByTestId(
          "share-note-form"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(
          "collaborators-refresh-key"
        )
      ).toHaveTextContent("0");

      fireEvent.click(
        screen.getByRole("button", {
          name: "Share Note Mock",
        })
      );

      await waitFor(() => {
        expect(
          screen.getByTestId(
            "collaborators-refresh-key"
          )
        ).toHaveTextContent("1");
      });
    }
  );

  test("shows collaboration management UI for admin users", async () => {
  noteService.getNoteById.mockResolvedValue({
    success: true,
    data: {
      _id: "note1",
      title: "Admin Note",
      content: "Admin content",
      accessRole: "admin",
      attachments: [],
    },
  });

  render(<NoteDetailsPage />);

  expect(await screen.findByText("Share Note")).toBeInTheDocument();
  expect(screen.getByTestId("share-note-form")).toBeInTheDocument();
  expect(screen.getByTestId("collaborators-list")).toBeInTheDocument();
});
});