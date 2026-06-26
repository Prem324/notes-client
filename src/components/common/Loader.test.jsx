import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Loader from "./Loader";

describe("Loader", () => {
  test("renders default loading message", () => {
    render(<Loader />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders custom loading message", () => {
    render(<Loader message="Loading profile..." />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });
});