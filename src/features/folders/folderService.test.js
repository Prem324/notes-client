import { describe, expect, it, vi, beforeEach } from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { folderService } from "./folderService";

vi.mock("../../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("folderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch folders", async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          {
            _id: "folder-1",
            name: "Work",
          },
        ],
      },
    };

    axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await folderService.getFolders();

    expect(axiosInstance.get).toHaveBeenCalledWith("/folders");
    expect(result).toEqual(mockResponse.data);
  });

  it("should create a folder", async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          _id: "folder-1",
          name: "Work",
        },
      },
    };

    axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await folderService.createFolder("Work");

    expect(axiosInstance.post).toHaveBeenCalledWith("/folders", {
      name: "Work",
    });

    expect(result).toEqual(mockResponse.data);
  });

  it("should update a folder", async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          _id: "folder-1",
          name: "Personal",
        },
      },
    };

    axiosInstance.put.mockResolvedValue(mockResponse);

    const result = await folderService.updateFolder(
      "folder-1",
      "Personal"
    );

    expect(axiosInstance.put).toHaveBeenCalledWith(
      "/folders/folder-1",
      {
        name: "Personal",
      }
    );

    expect(result).toEqual(mockResponse.data);
  });

  it("should delete a folder", async () => {
    const mockResponse = {
      data: {
        success: true,
        data: null,
      },
    };

    axiosInstance.delete.mockResolvedValue(mockResponse);

    const result = await folderService.deleteFolder("folder-1");

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/folders/folder-1"
    );

    expect(result).toEqual(mockResponse.data);
  });
});