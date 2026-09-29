import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  render,
  screen,
} from "@testing-library/react";

import NoteFolderSelector from "./NoteFolderSelector";

import { useFolders } from "../../features/folders/useFolders";

vi.mock("../../features/folders/useFolders", () => ({
  useFolders: vi.fn(),
}));

describe("NoteFolderSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state", () => {
    useFolders.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<NoteFolderSelector register={vi.fn()} />);

    expect(
      screen.getByText("Loading folders...")
    ).toBeInTheDocument();
  });

  it("should show error state", () => {
    useFolders.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<NoteFolderSelector register={vi.fn()} />);

    expect(
      screen.getByText("Unable to load folders.")
    ).toBeInTheDocument();
  });

  it("should show no folder option when there are no folders", () => {
    useFolders.mockReturnValue({
      data: {
        success: true,
        data: [],
      },
      isLoading: false,
      isError: false,
    });

    const register = vi.fn(() => ({}));

    render(<NoteFolderSelector register={register} />);

    expect(
      screen.getByRole("option", {
        name: "No folder",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Folder",
      })
    ).toBeInTheDocument();
  });

  it("should display available folders", () => {
    useFolders.mockReturnValue({
      data: {
        success: true,
        data: [
          {
            _id: "folder-1",
            name: "Work",
          },
          {
            _id: "folder-2",
            name: "Personal",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    const register = vi.fn(() => ({}));

    render(<NoteFolderSelector register={register} />);

    expect(
      screen.getByRole("option", {
        name: "No folder",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Work",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Personal",
      })
    ).toBeInTheDocument();
  });

  it("should register the folder field", () => {
    const register = vi.fn(() => ({}));

    useFolders.mockReturnValue({
      data: {
        success: true,
        data: [],
      },
      isLoading: false,
      isError: false,
    });

    render(<NoteFolderSelector register={register} />);

    expect(register).toHaveBeenCalledWith("folder");
  });
});