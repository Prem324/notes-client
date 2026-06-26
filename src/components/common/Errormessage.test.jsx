import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
  test("renders error message when message is provided", () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("renders nothing when message is empty", () => {
    const { container } = render(<ErrorMessage message="" />);

    expect(container).toBeEmptyDOMElement();
  });
});