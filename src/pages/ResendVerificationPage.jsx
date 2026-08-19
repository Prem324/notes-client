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

function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSent(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const result =
        await authService.resendVerificationEmail(
          trimmedEmail
        );

      setSent(true);

      showSuccessToast(
        result.message ||
          "Verification email sent successfully"
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to resend verification email"
      );

      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Resend Verification Email</h1>

      <p>
        Enter your email address and we'll send you a
        new verification link.
      </p>

      <ErrorMessage message={error} />

      {sent && (
        <p>
          Please check your email for the new
          verification link.
        </p>
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
          {loading
            ? "Sending..."
            : "Resend Verification Email"}
        </Button>
      </form>

      <p>
        Already verified?{" "}
        <Link to="/login">
          Go to Login
        </Link>
      </p>
    </div>
  );
}

export default ResendVerificationPage;