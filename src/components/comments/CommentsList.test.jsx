import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CommentsList from "./CommentsList";

describe("CommentsList", () => {
  test("shows empty state when there are no comments", () => {
    render(<CommentsList comments={[]} />);

    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  test("renders comments", () => {
    const comments = [
      {
        _id: "comment1",
        text: "First comment",
        user: {
          name: "Prem",
          email: "prem@example.com",
        },
        createdAt: "2026-06-20T10:00:00.000Z",
      },
      {
        _id: "comment2",
        text: "Second comment",
        user: {
          email: "user@example.com",
        },
        createdAt: "2026-06-21T10:00:00.000Z",
      },
    ];

    render(<CommentsList comments={comments} />);

    expect(screen.getByText(/first comment/i)).toBeInTheDocument();
    expect(screen.getByText(/second comment/i)).toBeInTheDocument();
    expect(screen.getByText(/prem/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });
});