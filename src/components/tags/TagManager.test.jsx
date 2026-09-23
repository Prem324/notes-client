import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import TagManager from "./TagManager";
import { tagService } from "../../features/tags/tagService";

vi.mock("../../features/tags/tagService", () => ({
  tagService: {
    getTags: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
  },
}));

function renderWithQueryClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
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

describe("TagManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("loads and displays tags", async () => {
    tagService.getTags.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "tag-1",
          name: "React",
        },
        {
          _id: "tag-2",
          name: "Backend",
        },
      ],
    });

    renderWithQueryClient(<TagManager />);

    expect(
      await screen.findByText("React")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Backend")
    ).toBeInTheDocument();

    expect(tagService.getTags).toHaveBeenCalledTimes(1);
  });

  test("creates a tag", async () => {
    tagService.getTags.mockResolvedValue({
      success: true,
      data: [],
    });

    tagService.createTag.mockResolvedValue({
      success: true,
      data: {
        _id: "tag-1",
        name: "React",
      },
    });

    renderWithQueryClient(<TagManager />);

    const input = await screen.findByPlaceholderText(
      "Enter tag name"
    );

    await userEvent.type(input, "React");

    await userEvent.click(
      screen.getByRole("button", {
        name: "Add Tag",
      })
    );

    await waitFor(() => {
      expect(tagService.createTag).toHaveBeenCalledWith(
        "React",
        expect.any(Object)
      );
    });
  });

  test("renames a tag", async () => {
    tagService.getTags.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "tag-1",
          name: "React",
        },
      ],
    });

    tagService.updateTag.mockResolvedValue({
      success: true,
      data: {
        _id: "tag-1",
        name: "Frontend",
      },
    });

    renderWithQueryClient(<TagManager />);

    await screen.findByText("React");

    await userEvent.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    const input = screen.getByDisplayValue("React");

    await userEvent.clear(input);

    await userEvent.type(input, "Frontend");

    await userEvent.click(
      screen.getByRole("button", {
        name: "Save",
      })
    );

    await waitFor(() => {
      expect(tagService.updateTag).toHaveBeenCalledWith(
        "tag-1",
        "Frontend"
      );
    });
  });

  test("deletes a tag after confirmation", async () => {
    tagService.getTags.mockResolvedValue({
      success: true,
      data: [
        {
          _id: "tag-1",
          name: "React",
        },
      ],
    });

    tagService.deleteTag.mockResolvedValue({
      success: true,
    });

    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithQueryClient(<TagManager />);

    await screen.findByText("React");

    await userEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    await waitFor(() => {
      expect(tagService.deleteTag).toHaveBeenCalledWith(
        "tag-1",
        expect.any(Object)
      );
    });
  });
});