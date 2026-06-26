import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import PublicOnlyRoute from "./PublicOnlyRoute";

let mockIsLoggedIn = false;

vi.mock("../features/auth/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn: mockIsLoggedIn,
  }),
}));

function renderPublicOnlyRoute() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <h1>Login Page</h1>
            </PublicOnlyRoute>
          }
        />

        <Route path="/notes" element={<h1>Notes Page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    mockIsLoggedIn = false;
  });

  test("renders children when user is not logged in", () => {
    mockIsLoggedIn = false;

    renderPublicOnlyRoute();

    expect(
      screen.getByRole("heading", { name: /login page/i })
    ).toBeInTheDocument();
  });

  test("redirects to notes when user is already logged in", () => {
    mockIsLoggedIn = true;

    renderPublicOnlyRoute();

    expect(
      screen.getByRole("heading", { name: /notes page/i })
    ).toBeInTheDocument();
  });
});