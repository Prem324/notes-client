import { describe, expect, test, vi, beforeEach } from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { commentService } from "./commentService";

vi.mock("../../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("commentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getCommentsByNote calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        data: [
          {
            _id: "comment1",
            text: "Nice note",
          },
        ],
      },
    };

    axiosInstance.get.mockResolvedValue(fakeResponse);

    const result = await commentService.getCommentsByNote("note123");

    expect(axiosInstance.get).toHaveBeenCalledWith("/comments/note/note123");
    expect(result).toEqual(fakeResponse.data);
  });

  test("createComment calls correct API endpoint with text and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        data: {
          _id: "comment1",
          text: "Great note",
        },
      },
    };

    axiosInstance.post.mockResolvedValue(fakeResponse);

    const result = await commentService.createComment("note123", "Great note");

    expect(axiosInstance.post).toHaveBeenCalledWith("/comments/note123", {
      text: "Great note",
    });

    expect(result).toEqual(fakeResponse.data);
  });
});