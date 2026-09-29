import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  render,
  screen,
} from "@testing-library/react";

import FoldersPage from "./FoldersPage";

vi.mock("../features/featureFlags/FeatureGate", () => ({
  default: ({ feature, children, fallback = null }) => (
    <div data-testid="feature-gate">
      {feature === "folders" ? children : fallback}
    </div>
  ),
}));

vi.mock("../components/folders/FolderManager", () => ({
  default: () => (
    <div data-testid="folder-manager">
      Folder Manager
    </div>
  ),
}));

describe("FoldersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the folders feature gate", () => {
    render(<FoldersPage />);

    expect(
      screen.getByTestId("feature-gate")
    ).toBeInTheDocument();
  });

  it("should render FolderManager when folders feature is enabled", () => {
    render(<FoldersPage />);

    expect(
      screen.getByTestId("folder-manager")
    ).toBeInTheDocument();
  });
});