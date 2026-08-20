import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import LoginForm from "../components/auth/LoginForm";
import ErrorMessage from "../components/common/ErrorMessage";
import { authService } from "../features/auth/authService";
import { useAuth } from "../features/auth/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { showSuccessToast, showErrorToast } from "../utils/toast";


function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location=useLocation();
  const {login}=useAuth();

  const successMessage=location.state?.message;

  async function handleLogin(formData) {
    try {
      setLoading(true);
      setError("");

      const result = await authService.login(formData);

      login(result.data.accessToken);

      showSuccessToast(result.message || "Login successful");


      navigate("/notes");
    } catch (error) {
      const message=getErrorMessage(error, "Login failed");
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>

      {successMessage && <p>{successMessage}</p>}

      <ErrorMessage message={error} />

      <LoginForm onLogin={handleLogin} loading={loading} />
      <p>
        Forgot your password?{" "}
        <Link to="/forgot-password">
        Reset it
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;