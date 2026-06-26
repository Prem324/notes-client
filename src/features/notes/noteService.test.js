import { beforeEach, describe, expect, test, vi } from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { noteService } from "./noteService";

vi.mock("../../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("noteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getNotes calls correct API endpoint with params and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        data: [
          {
            _id: "note1",
            title: "React Note",
          },
        ],
      },
    };

    axiosInstance.get.mockResolvedValue(fakeResponse);

    const result = await noteService.getNotes({
      page: 2,
      limit: 5,
      search: "react",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/notes", {
      params: {
        page: 2,
        limit: 5,
        search: "react",
      },
    });

    expect(result).toEqual(fakeResponse.data);
  });

  test("getNoteById calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        data: {
          _id: "note1",
          title: "React Note",
        },
      },
    };

    axiosInstance.get.mockResolvedValue(fakeResponse);

    const result = await noteService.getNoteById("note1");

    expect(axiosInstance.get).toHaveBeenCalledWith("/notes/note1");
    expect(result).toEqual(fakeResponse.data);
  });

  test("createNote calls correct API endpoint with note data and returns data", async () => {
    const noteData = {
      title: "New Note",
      content: "New content",
      completed: false,
    };

    const fakeResponse = {
      data: {
        success: true,
        data: {
          _id: "note1",
          ...noteData,
        },
      },
    };

    axiosInstance.post.mockResolvedValue(fakeResponse);

    const result = await noteService.createNote(noteData);

    expect(axiosInstance.post).toHaveBeenCalledWith("/notes", noteData);
    expect(result).toEqual(fakeResponse.data);
  });

  test("updateNote calls correct API endpoint with note data and returns data", async () => {
    const noteData = {
      title: "Updated Note",
      content: "Updated content",
      completed: true,
    };

    const fakeResponse = {
      data: {
        success: true,
        data: {
          _id: "note1",
          ...noteData,
        },
      },
    };

    axiosInstance.put.mockResolvedValue(fakeResponse);

    const result = await noteService.updateNote("note1", noteData);

    expect(axiosInstance.put).toHaveBeenCalledWith("/notes/note1", noteData);
    expect(result).toEqual(fakeResponse.data);
  });

  test("deleteNote calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        message: "Note deleted successfully",
      },
    };

    axiosInstance.delete.mockResolvedValue(fakeResponse);

    const result = await noteService.deleteNote("note1");

    expect(axiosInstance.delete).toHaveBeenCalledWith("/notes/note1");
    expect(result).toEqual(fakeResponse.data);
  });

  test("uploadAttachments calls correct API endpoint with FormData and returns data", async () => {
    const formData = new FormData();

    const fakeResponse = {
      data: {
        success: true,
        message: "Attachments uploaded successfully",
      },
    };

    axiosInstance.post.mockResolvedValue(fakeResponse);

    const result = await noteService.uploadAttachments("note1", formData);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/notes/note1/attachments",
      formData
    );

    expect(result).toEqual(fakeResponse.data);
  });

  test("deleteAttachment calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        message: "Attachment deleted successfully",
      },
    };

    axiosInstance.delete.mockResolvedValue(fakeResponse);

    const result = await noteService.deleteAttachment("note1", "attachment1");

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/notes/note1/attachments/attachment1"
    );

    expect(result).toEqual(fakeResponse.data);
  });
});