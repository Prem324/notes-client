import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import NoteCard from "./NoteCard";

function renderNoteCard(props = {}) {
  const note = {
    _id: "note123",
    title: "React Testing",
    content: "Learn React Testing Library",
    completed: false,
  };

  const defaultProps = {
    note,
    onDeleteNote: vi.fn(),
    onToggleComplete: vi.fn(),
    onStartEdit: vi.fn(),
    actionLoading: false,
  };

  const finalProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(
      <MemoryRouter>
        <NoteCard {...finalProps} />
      </MemoryRouter>
    ),
    props: finalProps,
  };
}

describe("NoteCard", () => {
  test("renders note title and content", () => {
    renderNoteCard();

    expect(
      screen.getByRole("heading", { name: /^react testing$/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^learn react testing library$/i)
    ).toBeInTheDocument();
  });

  test("shows pending status when note is not completed", () => {
    renderNoteCard();

    expect(screen.getByText(/^pending$/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /mark complete/i })
    ).toBeInTheDocument();
  });

  test("shows completed status when note is completed", () => {
    renderNoteCard({
      note: {
        _id: "note123",
        title: "Done Note",
        content: "Completed content",
        completed: true,
      },
    });

    expect(screen.getByText(/^completed$/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /mark pending/i })
    ).toBeInTheDocument();
  });

  test("has view details link", () => {
    renderNoteCard();

    expect(
      screen.getByRole("link", { name: /view details/i })
    ).toHaveAttribute("href", "/notes/note123");
  });

  test("calls onToggleComplete when mark complete button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleComplete = vi.fn();

    renderNoteCard({ onToggleComplete });

    await user.click(
      screen.getByRole("button", { name: /mark complete/i })
    );

    expect(onToggleComplete).toHaveBeenCalledWith("note123");
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
  });

  test("calls onStartEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();

    const { props } = renderNoteCard({ onStartEdit });

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(onStartEdit).toHaveBeenCalledWith(props.note);
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  test("calls onDeleteNote when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteNote = vi.fn();

    renderNoteCard({ onDeleteNote });

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDeleteNote).toHaveBeenCalledWith("note123");
    expect(onDeleteNote).toHaveBeenCalledTimes(1);
  });

  test("disables action buttons when actionLoading is true", () => {
    renderNoteCard({ actionLoading: true });

    expect(
      screen.getByRole("button", { name: /mark complete/i })
    ).toBeDisabled();

    expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();

    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });
});