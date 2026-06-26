import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import NoteForm from "./NoteForm";

describe("NoteForm", () => {
  test("shows validation error when title is empty", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", { name: /create note/i })
    );

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when title is less than 3 characters", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    await user.type(screen.getByLabelText(/title/i), "Hi");

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", { name: /create note/i })
    );

    expect(
      screen.getByText(/title must be at least 3 characters/i)
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when title is greater than 100 characters", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    const longTitle = "A".repeat(101);

    await user.type(screen.getByLabelText(/title/i), longTitle);

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "Some content"
    );

    await user.click(
      screen.getByRole("button", { name: /create note/i })
    );

    expect(
      screen.getByText(/title must be less than 100 characters/i)
    ).toBeInTheDocument();

    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("shows validation error when content is empty", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    await user.type(screen.getByLabelText(/title/i), "Valid title");

    await user.click(
      screen.getByRole("button", { name: /create note/i })
    );

    expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    expect(onAddNote).not.toHaveBeenCalled();
  });

  test("calls onAddNote with valid note data", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    await user.type(screen.getByLabelText(/title/i), "React Note");

    await user.type(
      screen.getByPlaceholderText(/enter content/i),
      "React content"
    );

    await user.click(
      screen.getByRole("button", { name: /create note/i })
    );

    expect(onAddNote).toHaveBeenCalledWith({
      title: "React Note",
      content: "React content",
      completed: false,
    });

    expect(onAddNote).toHaveBeenCalledTimes(1);
  });

  test("clears fields after successful create submit", async () => {
    const user = userEvent.setup();
    const onAddNote = vi.fn();

    render(<NoteForm onAddNote={onAddNote} />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByPlaceholderText(/enter content/i);

    await user.type(titleInput, "React Note");
    await user.type(contentTextarea, "React content");

    await user.click(
      screen.getByRole("button", { name: /create note/i })
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

    render(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: /edit note/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /update note/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue(/old title/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/old content/i)).toBeInTheDocument();
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

    render(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={onUpdateNote}
        onCancelEdit={() => {}}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByPlaceholderText(/enter content/i);

    await user.clear(titleInput);
    await user.type(titleInput, "Updated title");

    await user.clear(contentTextarea);
    await user.type(contentTextarea, "Updated content");

    await user.click(
      screen.getByRole("button", { name: /update note/i })
    );

    expect(onUpdateNote).toHaveBeenCalledWith({
      ...editingNote,
      title: "Updated title",
      content: "Updated content",
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

    render(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={onCancelEdit}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  test("disables submit button when loading in create mode", () => {
    render(<NoteForm onAddNote={() => {}} loading={true} />);

    expect(
      screen.getByRole("button", { name: /creating/i })
    ).toBeDisabled();
  });

  test("disables submit button when loading in edit mode", () => {
    const editingNote = {
      _id: "note123",
      title: "Old title",
      content: "Old content",
      completed: false,
    };

    render(
      <NoteForm
        onAddNote={() => {}}
        editingNote={editingNote}
        onUpdateNote={() => {}}
        onCancelEdit={() => {}}
        loading={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /updating/i })
    ).toBeDisabled();
  });
});