import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ErrorMessage from "../components/common/ErrorMessage";

import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  showSuccessToast,
  showErrorToast,
} from "../utils/toast";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitted(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const result = await authService.forgotPassword(
        trimmedEmail
      );

      setSubmitted(true);

      showSuccessToast(
        result.message ||
          "If an account exists, a reset link has been sent."
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to process password reset request"
      );

      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Forgot Password</h1>

      <p>
        Enter your email address and we'll send you a
        password reset link.
      </p>

      <ErrorMessage message={error} />

      {submitted && (
        <div>
          <p>
            If an account exists with this email address,
            we've sent a password reset link.
          </p>

          <p>
            Please check your inbox and follow the link
            to reset your password.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;