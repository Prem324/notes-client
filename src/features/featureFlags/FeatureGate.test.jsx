import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import FeatureGate from "./FeatureGate";
import { useFeatureFlags } from "./useFeatureFlags";

vi.mock("./useFeatureFlags", () => ({
  useFeatureFlags: vi.fn(),
}));

describe("FeatureGate", () => {
  test("renders children when feature is enabled", () => {
    useFeatureFlags.mockReturnValue({
      isEnabled: () => true,
      isLoading: false,
      isError: false,
    });

    render(
      <FeatureGate feature="tags">
        <div>Tags Feature</div>
      </FeatureGate>
    );

    expect(screen.getByText("Tags Feature")).toBeInTheDocument();
  });

  test("renders fallback when feature is disabled", () => {
    useFeatureFlags.mockReturnValue({
      isEnabled: () => false,
      isLoading: false,
      isError: false,
    });

    render(
      <FeatureGate feature="tags" fallback={<div>Feature Disabled</div>}>
        <div>Tags Feature</div>
      </FeatureGate>
    );

    expect(screen.queryByText("Tags Feature")).not.toBeInTheDocument();
    expect(screen.getByText("Feature Disabled")).toBeInTheDocument();
  });

  test("renders fallback while flags are loading", () => {
    useFeatureFlags.mockReturnValue({
      isEnabled: () => true,
      isLoading: true,
      isError: false,
    });

    render(
      <FeatureGate feature="tags" fallback={<div>Loading Feature</div>}>
        <div>Tags Feature</div>
      </FeatureGate>
    );

    expect(screen.queryByText("Tags Feature")).not.toBeInTheDocument();
    expect(screen.getByText("Loading Feature")).toBeInTheDocument();
  });

  test("renders fallback when feature flag request fails", () => {
    useFeatureFlags.mockReturnValue({
      isEnabled: () => true,
      isLoading: false,
      isError: true,
    });

    render(
      <FeatureGate feature="tags" fallback={<div>Feature Unavailable</div>}>
        <div>Tags Feature</div>
      </FeatureGate>
    );

    expect(screen.queryByText("Tags Feature")).not.toBeInTheDocument();
    expect(screen.getByText("Feature Unavailable")).toBeInTheDocument();
  });
});