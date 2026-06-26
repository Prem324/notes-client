import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Input from "./Input";

describe("Input", () => {
  test("renders label and input", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        placeholder="Enter email"
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  test("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Input
        label="Name"
        name="name"
        value=""
        onChange={handleChange}
        placeholder="Enter name"
      />
    );

    await user.type(screen.getByLabelText(/name/i), "Prem");

    expect(handleChange).toHaveBeenCalled();
  });

  test("uses provided input type", () => {
    render(
      <Input
        label="Password"
        name="password"
        type="password"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });
});