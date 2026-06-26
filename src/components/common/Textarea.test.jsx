import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Textarea from "./Textarea";

describe("Textarea", () => {
  test("renders label and textarea", () => {
    render(
      <Textarea
        label="Content"
        name="content"
        value=""
        onChange={() => {}}
        placeholder="Enter content"
      />
    );

    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter content/i)).toBeInTheDocument();
  });

  test("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Textarea
        label="Comment"
        name="comment"
        value=""
        onChange={handleChange}
        placeholder="Write comment"
      />
    );

    await user.type(screen.getByLabelText(/comment/i), "Nice note");

    expect(handleChange).toHaveBeenCalled();
  });

  test("uses provided rows value", () => {
    render(
      <Textarea
        label="Description"
        name="description"
        value=""
        onChange={() => {}}
        rows={6}
      />
    );

    expect(screen.getByLabelText(/description/i)).toHaveAttribute("rows", "6");
  });
});