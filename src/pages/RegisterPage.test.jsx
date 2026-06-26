import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import RegisterPage from "./RegisterPage";
import { authService } from "../features/auth/authService";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../features/auth/authService", () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock("../components/auth/RegisterForm", () => ({
  default: function MockRegisterForm({ onRegister, loading }) {
    async function handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);

      await onRegister({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
    }

    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    );
  },
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders register page", () => {
    renderRegisterPage();

    expect(
      screen.getByRole("heading", { name: /^register$/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^register$/i })
    ).toBeInTheDocument();
  });

  test("registers successfully and navigates to login page with success message", async () => {
    const user = userEvent.setup();

    authService.register.mockResolvedValue({
      success: true,
      message: "User registered successfully",
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/name/i), "Prem");
    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(authService.register).toHaveBeenCalledWith({
      name: "Prem",
      email: "prem@example.com",
      password: "password123",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: {
        message: "Registration successful. Please login.",
      },
    });
  });

  test("shows error message when registration fails", async () => {
    const user = userEvent.setup();

    authService.register.mockRejectedValue({
      response: {
        data: {
          message: "Email already exists",
        },
      },
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/name/i), "Prem");
    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(
      await screen.findByText(/email already exists/i)
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});