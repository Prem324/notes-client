import { beforeEach, describe, expect, test } from "vitest";

import {
  saveToken,
  getToken,
  removeToken,
  isAuthenticated,
} from "./authUtils";

describe("authUtils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saveToken stores token in localStorage", () => {
    saveToken("fake-token");

    expect(localStorage.getItem("token")).toBe("fake-token");
  });

  test("getToken returns stored token", () => {
    localStorage.setItem("token", "stored-token");

    expect(getToken()).toBe("stored-token");
  });

  test("removeToken removes token from localStorage", () => {
    localStorage.setItem("token", "stored-token");

    removeToken();

    expect(localStorage.getItem("token")).toBeNull();
  });

  test("isAuthenticated returns true when token exists", () => {
    localStorage.setItem("token", "stored-token");

    expect(isAuthenticated()).toBe(true);
  });

  test("isAuthenticated returns false when token does not exist", () => {
    expect(isAuthenticated()).toBe(false);
  });

  test("saveToken throws error when token is missing", () => {
    expect(() => saveToken()).toThrow(/token is required/i);
  });
});