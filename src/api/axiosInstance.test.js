import { beforeEach, describe, expect, test } from "vitest";

import axiosInstance from "./axiosInstance";

describe("axiosInstance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("uses correct baseURL", () => {
    expect(axiosInstance.defaults.baseURL).toBe(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
    );
  });

  test("adds Authorization header when token exists", async () => {
    localStorage.setItem("token", "fake-token");

    const config = {
      headers: {},
      data: {},
    };

    const requestInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled;

    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer fake-token");
  });

  test("does not add Authorization header when token does not exist", async () => {
    const config = {
      headers: {},
      data: {},
    };

    const requestInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled;

    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test("sets Content-Type as application/json for normal data", async () => {
    const config = {
      headers: {},
      data: {
        title: "React Note",
      },
    };

    const requestInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled;

    const result = await requestInterceptor(config);

    expect(result.headers["Content-Type"]).toBe("application/json");
  });

  test("does not force Content-Type for FormData", async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      data: new FormData(),
    };

    const requestInterceptor =
      axiosInstance.interceptors.request.handlers[0].fulfilled;

    const result = await requestInterceptor(config);

    expect(result.headers["Content-Type"]).toBeUndefined();
  });
});