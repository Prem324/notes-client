import { beforeEach, describe, expect, test, vi } from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { profileService } from "./profileService";

vi.mock("../../api/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("profileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getProfile calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        data: {
          _id: "user1",
          name: "Prem",
          email: "prem@example.com",
        },
      },
    };

    axiosInstance.get.mockResolvedValue(fakeResponse);

    const result = await profileService.getProfile();

    expect(axiosInstance.get).toHaveBeenCalledWith("/users/profile");
    expect(result).toEqual(fakeResponse.data);
  });

  test("uploadProfilePicture calls correct API endpoint with FormData and returns data", async () => {
    const formData = new FormData();

    const fakeResponse = {
      data: {
        success: true,
        message: "Profile picture uploaded successfully",
      },
    };

    axiosInstance.patch.mockResolvedValue(fakeResponse);

    const result = await profileService.uploadProfilePicture(formData);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/users/profile-picture",
      formData
    );

    expect(result).toEqual(fakeResponse.data);
  });

  test("deleteProfilePicture calls correct API endpoint and returns data", async () => {
    const fakeResponse = {
      data: {
        success: true,
        message: "Profile picture deleted successfully",
      },
    };

    axiosInstance.delete.mockResolvedValue(fakeResponse);

    const result = await profileService.deleteProfilePicture();

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/users/profile-picture"
    );

    expect(result).toEqual(fakeResponse.data);
  });
});