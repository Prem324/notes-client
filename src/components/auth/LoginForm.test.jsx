import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  test("renders login form fields", () => {
    render(<LoginForm onLogin={() => {}} />);

    expect(screen.getByRole("heading", { name: /^login$/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
  });

  test("shows validation error when email is empty", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("shows validation error when password is empty", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/email/i), "prem@example.com");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("calls onLogin with valid credentials", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(onLogin).toHaveBeenCalledWith({
      email: "prem@example.com",
      password: "password123",
    });

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  test("disables submit button when loading", () => {
    render(<LoginForm onLogin={() => {}} loading={true} />);

    expect(
      screen.getByRole("button", { name: /logging in/i })
    ).toBeDisabled();
  });
});