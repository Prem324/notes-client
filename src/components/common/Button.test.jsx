import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  test("renders button text", () => {
    render(<Button>Click Me</Button>);

    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("disables button when disabled is true", () => {
    render(<Button disabled>Saving...</Button>);

    expect(
      screen.getByRole("button", { name: /saving/i })
    ).toBeDisabled();
  });
});