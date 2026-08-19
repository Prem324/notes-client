import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ErrorMessage from "../components/common/ErrorMessage";

import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  showSuccessToast,
  showErrorToast,
} from "../utils/toast";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("Password reset token is missing");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (password.length > 128) {
      setError(
        "Password must not exceed 128 characters"
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter"
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter"
      );
      return;
    }

    if (!/\d/.test(password)) {
      setError(
        "Password must contain at least one number"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const result = await authService.resetPassword(
        token,
        password
      );

      setReset(true);

      showSuccessToast(
        result.message ||
          "Password reset successfully"
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to reset password"
      );

      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  if (reset) {
    return (
      <div>
        <h1>Password Reset Successful</h1>

        <p>
          Your password has been changed successfully.
        </p>

        <p>
          You can now log in with your new password.
        </p>

        <Button onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Reset Password</h1>

      <p>
        Enter your new password below.
      </p>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <Input
          label="New Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Enter new password"
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Confirm new password"
        />

        <Button type="submit" disabled={loading}>
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </Button>
      </form>

      <p>
        Remember your password?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}

export default ResetPasswordPage;