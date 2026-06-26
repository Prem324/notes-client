import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import NotesList from "./NotesList";

function renderNotesList(props = {}) {
  const defaultProps = {
    notes: [],
    search: "",
    onDeleteNote: vi.fn(),
    onToggleComplete: vi.fn(),
    onStartEdit: vi.fn(),
    actionLoading: false,
  };

  const finalProps = {
    ...defaultProps,
    ...props,
  };

  return render(
    <MemoryRouter>
      <NotesList {...finalProps} />
    </MemoryRouter>
  );
}

describe("NotesList", () => {
  test("shows default empty state when notes list is empty", () => {
    renderNotesList();

    expect(screen.getByText(/no notes found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/create your first note/i)
    ).toBeInTheDocument();
  });

  test("shows search empty state when search is active", () => {
    renderNotesList({
      search: "react",
    });

    expect(
      screen.getByText(/no notes matched your search/i)
    ).toBeInTheDocument();
  });

  test("renders multiple notes", () => {
    const notes = [
      {
        _id: "note1",
        title: "First Note",
        content: "First content",
        completed: false,
      },
      {
        _id: "note2",
        title: "Second Note",
        content: "Second content",
        completed: true,
      },
    ];

    renderNotesList({ notes });

    expect(
      screen.getByRole("heading", { name: /^first note$/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /^second note$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/^first content$/i)).toBeInTheDocument();
    expect(screen.getByText(/^second content$/i)).toBeInTheDocument();
  });
});