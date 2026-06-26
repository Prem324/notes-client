import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import SuccessMessage from "./SuccessMessage";

describe("SuccessMessage", () => {
  test("renders success message when message is provided", () => {
    render(<SuccessMessage message="Saved successfully" />);

    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
  });

  test("renders nothing when message is empty", () => {
    const { container } = render(<SuccessMessage message="" />);

    expect(container).toBeEmptyDOMElement();
  });
});