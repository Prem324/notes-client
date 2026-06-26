import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";

import LoginForm from "../components/auth/LoginForm";
import ErrorMessage from "../components/common/ErrorMessage";
import { authService } from "../features/auth/authService";
import { useAuth } from "../features/auth/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";

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

      login(result.data.token);

      navigate("/notes");
    } catch (error) {
      setError(getErrorMessage(error, "Login failed"));
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
    </div>
  );
}

export default LoginPage;