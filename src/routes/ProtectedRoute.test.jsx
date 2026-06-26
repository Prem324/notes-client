import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ProtectedRoute from "./ProtectedRoute";

let mockIsLoggedIn = false;

vi.mock("../features/auth/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
  }),
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/notes"]}>
      <Routes>
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <h1>Notes Page</h1>
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockIsLoggedIn = false;
  });

  test("renders children when user is logged in", () => {
    mockIsLoggedIn = true;

    renderProtectedRoute();

    expect(
      screen.getByRole("heading", { name: /notes page/i })
    ).toBeInTheDocument();
  });

  test("redirects to login when user is not logged in", () => {
    mockIsLoggedIn = false;

    renderProtectedRoute();

    expect(
      screen.getByRole("heading", { name: /login page/i })
    ).toBeInTheDocument();
  });
});