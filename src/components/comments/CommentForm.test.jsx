import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  test("shows validation error when submitting empty comment", async () => {
    const user = userEvent.setup();
    const handleAddComment = vi.fn();

    render(<CommentForm onAddComment={handleAddComment} />);

    await user.click(
      screen.getByRole("button", { name: /add comment/i })
    );

    expect(
      screen.getByText(/comment text is required/i)
    ).toBeInTheDocument();

    expect(handleAddComment).not.toHaveBeenCalled();
  });

  test("calls onAddComment with typed comment", async () => {
    const user = userEvent.setup();
    const handleAddComment = vi.fn().mockResolvedValue(true);

    render(<CommentForm onAddComment={handleAddComment} />);

    await user.type(
      screen.getByLabelText(/comment/i),
      "This is a good note"
    );

    await user.click(
      screen.getByRole("button", { name: /add comment/i })
    );

    expect(handleAddComment).toHaveBeenCalledWith("This is a good note");
  });

  test("disables submit button when loading", () => {
    render(<CommentForm onAddComment={() => {}} loading={true} />);

    expect(
      screen.getByRole("button", { name: /adding/i })
    ).toBeDisabled();
  });
});

test("clears textarea after successful submit", async () => {
  const user = userEvent.setup();
  const handleAddComment = vi.fn().mockResolvedValue(true);

  render(<CommentForm onAddComment={handleAddComment} />);

  const textarea = screen.getByLabelText(/comment/i);

  await user.type(textarea, "Nice work");
  await user.click(screen.getByRole("button", { name: /add comment/i }));

  expect(textarea).toHaveValue("");
});

