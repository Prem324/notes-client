import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import RegisterForm from "../components/auth/RegisterForm";
import ErrorMessage from "../components/common/ErrorMessage";
import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { showSuccessToast, showErrorToast } from "../utils/toast";


function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function handleRegister(formData) {
    try {
      setLoading(true);
      setError("");

      const result=await authService.register(formData);
      setRegisteredEmail(formData.email);

      showSuccessToast(result.message || "Registration successful");

      
    } catch (error) {
      const message=getErrorMessage(error, "Registration failed");
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ErrorMessage message={error} />
      {registeredEmail ? (
  <div>
    <h1>Check Your Email</h1>

    <p>
      We sent a verification link to:
    </p>

    <strong>{registeredEmail}</strong>

    <p>
      Please check your inbox and click the
      verification link to verify your account.
    </p>

    <p>
      Didn't receive the email?
    </p>

    <Link to="/resend-verification">
      Resend Verification Email
    </Link>

    <p>
      Already verified?
    </p>

    <Link to="/login">
      Go to Login
    </Link>
  </div>
) : (
  <RegisterForm
    onRegister={handleRegister}
    loading={loading}
  />
)}
    </div>
  );
}

export default RegisterPage;
