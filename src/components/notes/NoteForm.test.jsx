import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFeatureFlags } from "../../features/featureFlags/useFeatureFlags";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useTags } from "../../features/tags/useTags";

vi.mock("../../features/tags/useTags", () => ({
  useTags: vi.fn(),
}));

import NoteForm from "./NoteForm";

vi.mock("../../features/featureFlags/useFeatureFlags", () => ({
  useFeatureFlags: vi.fn(),
}));

beforeEach(() => {
  useFeatureFlags.mockReturnValue({
    isEnabled: (feature) => feature === "tags",
  });
});
function renderWithQueryClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("NoteForm", () => {

  beforeEach(() => {
  useTags.mockReturnValue({
    data: {
      data: [
        {
          _id: "tag-1",
          name: "React",
        },
        {
          _id: "tag-2",
          name: "MERN",
        },
        {
          _id: "tag-3",
          name: "JavaScript",
        },
      ],
    },
    isLoading: false,
    isError: false,
  });

  useFeatureFlags.mockReturnValue({
    isEnabled: (feature) => feature === "tags",
  });
}); 

  test("shows validation error when title is empty", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(
      screen.getByText(/title is required/i)
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when title is less than 3 characters", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    await user.type(
      screen.getByLabelText(/title/i),
      "Hi"
    );

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(
      screen.getByText(
        /title must be at least 3 characters/i
      )
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when title is greater than 100 characters", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    const longTitle = "A".repeat(101);

    await user.type(
      screen.getByLabelText(/title/i),
      longTitle
    );

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(
      screen.getByText(
        /title must be less than 100 characters/i
      )
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when content is empty", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    await user.type(
      screen.getByLabelText(/title/i),
      "Valid title"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(
      screen.getByText(/content is required/i)
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("calls onAddNote with valid note data", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    await user.type(
      screen.getByLabelText(/title/i),
      "React Note"
    );

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "React content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(onAddNote).toHaveBeenCalledWith({
      title: "React Note",
      content: "React content",
      completed: false,
      tags: [],
    });

    expect(onAddNote).toHaveBeenCalledTimes(1);
  });

  test("clears fields after successful create submit", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    renderWithQueryClient(
      <NoteForm onAddNote={onAddNote} />
    );

    const titleInput = screen.getByLabelText(/title/i);

    const contentTextarea =
      screen.getByPlaceholderText(/enter content/i);

    await user.type(
      titleInput,
      "React Note"
    );

    await user.type(
      contentTextarea,
      "React content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create note/i,
      })
    );

    expect(titleInput).toHaveValue("");
    expect(contentTextarea).toHaveValue("");
  });

  test("shows edit mode heading, update button, cancel button, and existing values", () => {
    const editingNote = {
      _id: "note123",
      title: "Old title",
      content: "Old content",
      completed: false,
    };

    renderWithQueryClient(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /edit note/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /update note/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(/old title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(/old content/i)
    ).toBeInTheDocument();
  });

  test("calls onUpdateNote with edited note data", async () => {
    const user = userEvent.setup();
    const onUpdateNote = vi.fn();

    const editingNote = {
      _id: "note123",
      title: "Old title",
      content: "Old content",
      completed: true,
    };

    renderWithQueryClient(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={onUpdateNote}
        onCancelEdit={() => {}}
      />
    );

    const titleInput =
      screen.getByLabelText(/title/i);

    const contentTextarea =
      screen.getByPlaceholderText(/enter content/i);

    await user.clear(titleInput);
    await user.type(
      titleInput,
      "Updated title"
    );

    await user.clear(contentTextarea);
    await user.type(
      contentTextarea,
      "Updated content"
    );

    await user.click(
      screen.getByRole("button", {
        name: /update note/i,
      })
    );

    expect(onUpdateNote).toHaveBeenCalledWith({
      ...editingNote,
      title: "Updated title",
      content: "Updated content",
      tags: [],
    });

    expect(onUpdateNote).toHaveBeenCalledTimes(1);
  });

  test("calls onCancelEdit when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();

    const editingNote = {
      _id: "note123",
      title: "Old title",
      content: "Old content",
      completed: false,
    };

    renderWithQueryClient(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={onCancelEdit}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  test("disables submit button when loading in create mode", () => {
    renderWithQueryClient(
      <NoteForm
        onAddNote={() => {}}
        loading={true}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /creating/i,
      })
    ).toBeDisabled();
  });

  test("disables submit button when loading in edit mode", () => {
    const editingNote = {
      _id: "note123",
      title: "Old title",
      content: "Old content",
      completed: false,
    };

    renderWithQueryClient(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={() => {}}
        loading={true}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /updating/i,
      })
    ).toBeDisabled();
  });

  test("submits selected tag when creating a note", async () => {
  const user = userEvent.setup();

  const onAddNote = vi.fn().mockResolvedValue(undefined);

  renderWithQueryClient(
    <NoteForm
      onAddNote={onAddNote}
      editingNote={null}
      onUpdateNote={vi.fn()}
      onCancelEdit={vi.fn()}
    />
  );

  await user.type(
    screen.getByLabelText(/title/i),
    "React Notes"
  );

  await user.type(
    screen.getByLabelText(/content/i),
    "Learning React"
  );

  await user.selectOptions(
    screen.getByLabelText(/tags/i),
    "tag-1"
  );

  await user.click(
    screen.getByRole("button", {
      name: /create note/i,
    })
  );

  expect(onAddNote).toHaveBeenCalledWith({
    title: "React Notes",
    content: "Learning React",
    completed: false,
    tags: ["tag-1"],
  });
});

test("submits multiple selected tags when creating a note", async () => {
  const user = userEvent.setup();

  const onAddNote = vi.fn().mockResolvedValue(undefined);

  renderWithQueryClient(
    <NoteForm
      onAddNote={onAddNote}
      editingNote={null}
      onUpdateNote={vi.fn()}
      onCancelEdit={vi.fn()}
    />
  );

  await user.type(
    screen.getByLabelText(/title/i),
    "MERN Notes"
  );

  await user.type(
    screen.getByLabelText(/content/i),
    "Learning MERN"
  );

  await user.selectOptions(
    screen.getByLabelText(/tags/i),
    ["tag-1", "tag-2"]
  );

  await user.click(
    screen.getByRole("button", {
      name: /create note/i,
    })
  );

  expect(onAddNote).toHaveBeenCalledWith({
    title: "MERN Notes",
    content: "Learning MERN",
    completed: false,
    tags: ["tag-1", "tag-2"],
  });
});

test("selects existing tags when editing a note", () => {
  const editingNote = {
    _id: "note-1",
    title: "React Notes",
    content: "Learning React",
    completed: false,
    tags: [
      {
        _id: "tag-1",
        name: "React",
      },
      {
        _id: "tag-2",
        name: "MERN",
      },
    ],
  };

  renderWithQueryClient(
    <NoteForm
      onAddNote={vi.fn()}
      editingNote={editingNote}
      onUpdateNote={vi.fn()}
      onCancelEdit={vi.fn()}
    />
  );

  const select = screen.getByLabelText(/tags/i);

  expect(
  screen.getByRole("option", { name: "React" }).selected
).toBe(true);

expect(
  screen.getByRole("option", { name: "MERN" }).selected
).toBe(true);

expect(
  screen.getByRole("option", { name: "JavaScript" }).selected
).toBe(false);

  expect(select).toHaveAttribute("multiple");
});

test("submits updated tags when editing a note", async () => {
  const user = userEvent.setup();

  const onUpdateNote = vi.fn();

  const editingNote = {
    _id: "note-1",
    title: "React Notes",
    content: "Learning React",
    completed: false,
    tags: [
      {
        _id: "tag-1",
        name: "React",
      },
    ],
  };

  renderWithQueryClient(
    <NoteForm
      onAddNote={vi.fn()}
      editingNote={editingNote}
      onUpdateNote={onUpdateNote}
      onCancelEdit={vi.fn()}
    />
  );

  const select = screen.getByLabelText(/tags/i);

  await user.deselectOptions(select, "tag-1");

  await user.selectOptions(select, [
    "tag-2",
    "tag-3",
  ]);

  await user.click(
    screen.getByRole("button", {
      name: /update note/i,
    })
  );

  expect(onUpdateNote).toHaveBeenCalledWith({
    ...editingNote,
    tags: ["tag-2", "tag-3"],
  });
});

test("submits an empty tag array when all tags are removed", async () => {
  const user = userEvent.setup();

  const onUpdateNote = vi.fn();

  const editingNote = {
    _id: "note-1",
    title: "React Notes",
    content: "Learning React",
    completed: false,
    tags: [
      {
        _id: "tag-1",
        name: "React",
      },
    ],
  };

  renderWithQueryClient(
    <NoteForm
      onAddNote={vi.fn()}
      editingNote={editingNote}
      onUpdateNote={onUpdateNote}
      onCancelEdit={vi.fn()}
    />
  );

  const select = screen.getByLabelText(/tags/i);

  await user.deselectOptions(select, "tag-1");

  await user.click(
    screen.getByRole("button", {
      name: /update note/i,
    })
  );

  expect(onUpdateNote).toHaveBeenCalledWith({
    ...editingNote,
    tags: [],
  });
});

test("does not send tags when tags feature is disabled during create", async () => {
  const user = userEvent.setup();

  useFeatureFlags.mockReturnValue({
    isEnabled: () => false,
  });

  const onAddNote = vi.fn().mockResolvedValue(undefined);

  renderWithQueryClient(
    <NoteForm
      onAddNote={onAddNote}
      editingNote={null}
      onUpdateNote={vi.fn()}
      onCancelEdit={vi.fn()}
    />
  );

  await user.type(
    screen.getByLabelText(/title/i),
    "React Notes"
  );

  await user.type(
    screen.getByLabelText(/content/i),
    "Learning React"
  );

  await user.click(
    screen.getByRole("button", {
      name: /create note/i,
    })
  );

  expect(onAddNote).toHaveBeenCalledWith({
    title: "React Notes",
    content: "Learning React",
    completed: false,
  });
});

test("preserves existing tags when tags feature is disabled during edit", async () => {
  const user = userEvent.setup();

  useFeatureFlags.mockReturnValue({
    isEnabled: () => false,
  });

  const onUpdateNote = vi.fn();

  const editingNote = {
    _id: "note-1",
    title: "React Notes",
    content: "Learning React",
    completed: false,
    tags: [
      {
        _id: "tag-1",
        name: "React",
      },
      {
        _id: "tag-2",
        name: "MERN",
      },
    ],
  };

  renderWithQueryClient(
    <NoteForm
      onAddNote={vi.fn()}
      editingNote={editingNote}
      onUpdateNote={onUpdateNote}
      onCancelEdit={vi.fn()}
    />
  );

  await user.click(
    screen.getByRole("button", {
      name: /update note/i,
    })
  );

  expect(onUpdateNote).toHaveBeenCalledWith({
    ...editingNote,
    title: "React Notes",
    content: "Learning React",
  });
});
});