import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";

function VerifyEmailPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("Verification token is missing");
          return;
        }

        await authService.verifyEmail(token);

        setVerified(true);
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Email verification failed"
          )
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  if (loading) {
    return <Loader message="Verifying your email..." />;
  }

  return (
    <div>
      <h1>Email Verification</h1>

      {verified ? (
        <div>
          <h2>Email verified successfully!</h2>

          <p>
            Your email address has been verified.
            You can now log in to your account.
          </p>

          <Link to="/login">
            Go to Login
          </Link>
        </div>
      ) : (
        <div>
          <ErrorMessage message={error} />

          <p>
            Your verification link is invalid or has expired.
          </p>

          <Link to="/resend-verification">
            Resend Verification Email
          </Link>
        </div>
      )}
    </div>
  );
}

export default VerifyEmailPage;