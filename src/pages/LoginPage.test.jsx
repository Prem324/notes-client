import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import LoginPage from "./LoginPage";
import { authService } from "../features/auth/authService";

const mockNavigate = vi.fn();
const mockAuthLogin = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../features/auth/AuthContext", () => ({
  useAuth: () => ({
    login: mockAuthLogin,
  }),
}));

vi.mock("../features/auth/authService", () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock("../components/auth/LoginForm", () => ({
  default: function MockLoginForm({ onLogin, loading }) {
    async function handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);

      await onLogin({
        email: formData.get("email"),
        password: formData.get("password"),
      });
    }

    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    );
  },
}));

function renderLoginPage(initialEntries = ["/login"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders login page", () => {
    renderLoginPage();

    expect(
      screen.getByRole("heading", { name: /^login$/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^login$/i })
    ).toBeInTheDocument();
  });

  test("shows success message from register redirect state", () => {
    renderLoginPage([
      {
        pathname: "/login",
        state: {
          message: "Registration successful. Please login.",
        },
      },
    ]);

    expect(
      screen.getByText(/registration successful/i)
    ).toBeInTheDocument();
  });

  test("logs in successfully and navigates to notes page", async () => {
    const user = userEvent.setup();

    authService.login.mockResolvedValue({
      data: {
        token: "fake-token",
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "prem@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(authService.login).toHaveBeenCalledWith({
      email: "prem@example.com",
      password: "password123",
    });

    expect(mockAuthLogin).toHaveBeenCalledWith("fake-token");
    expect(mockNavigate).toHaveBeenCalledWith("/notes");
  });

  test("shows error message when login fails", async () => {
    const user = userEvent.setup();

    authService.login.mockRejectedValue({
      response: {
        data: {
          message: "Invalid email or password",
        },
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();

    expect(mockAuthLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});