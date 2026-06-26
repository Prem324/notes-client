import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import NoteSearch from "./NoteSearch";

describe("NoteSearch", () => {
  test("renders search input", () => {
    render(
      <NoteSearch
        search=""
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />
    );

    expect(screen.getByLabelText(/search notes/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/search by title or content/i)
    ).toBeInTheDocument();
  });

  test("calls onSearchChange when user types", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <NoteSearch
        search=""
        onSearchChange={onSearchChange}
        onClearSearch={() => {}}
      />
    );

    await user.type(screen.getByLabelText(/search notes/i), "react");

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange).toHaveBeenLastCalledWith("t");
  });

  test("shows current search value", () => {
    render(
      <NoteSearch
        search="mongodb"
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />
    );

    expect(screen.getByLabelText(/search notes/i)).toHaveValue("mongodb");
  });

  test("does not show clear button when search is empty", () => {
    render(
      <NoteSearch
        search=""
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />
    );

    expect(
      screen.queryByRole("button", { name: /clear/i })
    ).not.toBeInTheDocument();
  });

  test("calls onClearSearch when clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClearSearch = vi.fn();

    render(
      <NoteSearch
        search="react"
        onSearchChange={() => {}}
        onClearSearch={onClearSearch}
      />
    );

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });
});