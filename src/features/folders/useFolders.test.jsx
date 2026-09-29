import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useFolders } from "./useFolders";
import { folderService } from "./folderService";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

vi.mock("./folderService", () => ({
  folderService: {
    getFolders: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useFolders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch folders successfully", async () => {
    const mockFolders = {
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
    };

    folderService.getFolders.mockResolvedValue(mockFolders);

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(folderService.getFolders).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockFolders);
  });

  it("should use the folders query", async () => {
    folderService.getFolders.mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(folderService.getFolders).toHaveBeenCalledTimes(1);
  });

  it("should expose loading state", () => {
    folderService.getFolders.mockReturnValue(
      new Promise(() => {})
    );

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("should expose error state", async () => {
    const error = new Error("Failed to fetch folders");

    folderService.getFolders.mockRejectedValue(error);

    const { result } = renderHook(() => useFolders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});