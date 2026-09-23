import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import NoteTagSelector from "./NoteTagSelector";
import { useTags } from "../../features/tags/useTags";

vi.mock("../../features/tags/useTags", () => ({
  useTags: vi.fn(),
}));

describe("NoteTagSelector", () => {
  test("shows loading state while tags are loading", () => {
    useTags.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const register = vi.fn();

    render(<NoteTagSelector register={register} />);

    expect(
      screen.getByText(/loading tags/i)
    ).toBeInTheDocument();
  });

  test("shows error state when tags fail to load", () => {
    useTags.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const register = vi.fn();

    render(<NoteTagSelector register={register} />);

    expect(
      screen.getByText(/unable to load tags/i)
    ).toBeInTheDocument();
  });

  test("shows message when no tags exist", () => {
    useTags.mockReturnValue({
      data: {
        data: [],
      },
      isLoading: false,
      isError: false,
    });

    const register = vi.fn();

    render(<NoteTagSelector register={register} />);

    expect(
      screen.getByText(/no tags available/i)
    ).toBeInTheDocument();
  });

  test("renders available tags", () => {
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

    const register = vi.fn(() => ({
      name: "tags",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }));

    render(<NoteTagSelector register={register} />);

    expect(
      screen.getByLabelText(/tags/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "React",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "MERN",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "JavaScript",
      })
    ).toBeInTheDocument();

    expect(register).toHaveBeenCalledWith("tags");
  });

  test("renders tags as a multiple-select field", () => {
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
        ],
      },
      isLoading: false,
      isError: false,
    });

    const register = vi.fn(() => ({
      name: "tags",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }));

    render(<NoteTagSelector register={register} />);

    const select = screen.getByLabelText(/tags/i);

    expect(select).toHaveAttribute("multiple");
  });
});