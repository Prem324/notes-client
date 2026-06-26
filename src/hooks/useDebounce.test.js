import { renderHook, act } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import useDebounce from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("react", 500));

    expect(result.current).toBe("react");
  });

  test("updates value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: {
          value: "react",
        },
      }
    );

    rerender({
      value: "mongodb",
    });

    expect(result.current).toBe("react");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("mongodb");
  });

  test("does not update before delay finishes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: {
          value: "react",
        },
      }
    );

    rerender({
      value: "node",
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("react");
  });

  test("uses latest value when value changes quickly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: {
          value: "r",
        },
      }
    );

    rerender({ value: "re" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "rea" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("r");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("rea");
  });
});