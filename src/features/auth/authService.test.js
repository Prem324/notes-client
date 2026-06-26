import { beforeEach, describe, expect, test, vi } from "vitest";

import axiosInstance from "../../api/axiosInstance";
import { authService } from "./authService";

vi.mock("../../api/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("register calls correct API endpoint with user data and returns data", async () => {
    const userData = {
      name: "Prem",
      email: "prem@example.com",
      password: "password123",
    };

    const fakeResponse = {
      data: {
        success: true,
        message: "User registered successfully",
      },
    };

    axiosInstance.post.mockResolvedValue(fakeResponse);

    const result = await authService.register(userData);

    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/register", userData);
    expect(result).toEqual(fakeResponse.data);
  });

  test("login calls correct API endpoint with credentials and returns data", async () => {
    const credentials = {
      email: "prem@example.com",
      password: "password123",
    };

    const fakeResponse = {
      data: {
        success: true,
        token: "fake-token",
      },
    };

    axiosInstance.post.mockResolvedValue(fakeResponse);

    const result = await authService.login(credentials);

    expect(axiosInstance.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(result).toEqual(fakeResponse.data);
  });
});