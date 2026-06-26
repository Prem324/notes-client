import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import RegisterForm from "./RegisterForm";

describe("RegisterForm", () => {
  test("renders register form fields", () => {
    render(<RegisterForm onRegister={() => {}} />);

    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^register$/i })).toBeInTheDocument();
  });

  test("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });

  test("shows validation error when email is empty", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/name/i), "Prem");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });

  test("shows validation error when password is less than 6 characters", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/name/i), "Prem");
    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(
      screen.getByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();

    expect(onRegister).not.toHaveBeenCalled();
  });

  test("calls onRegister with valid form data", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/name/i), "Prem");
    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(onRegister).toHaveBeenCalledWith({
      name: "Prem",
      email: "prem@example.com",
      password: "password123",
    });

    expect(onRegister).toHaveBeenCalledTimes(1);
  });

  test("disables submit button when loading", () => {
    render(<RegisterForm onRegister={() => {}} loading={true} />);

    expect(
      screen.getByRole("button", { name: /registering/i })
    ).toBeDisabled();
  });
});