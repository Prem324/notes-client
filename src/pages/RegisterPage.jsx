import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../components/auth/RegisterForm";
import ErrorMessage from "../components/common/ErrorMessage";
import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";

function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(formData) {
    try {
      setLoading(true);
      setError("");

      await authService.register(formData);

      navigate("/login",{
        state:{
          message:"Registration successful. Please login.",
        }
      })
    } catch (error) {
      setError(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Register</h1>

      <ErrorMessage message={error} />

      <RegisterForm
        onRegister={handleRegister}
        loading={loading}
      />
    </div>
  );
}

export default RegisterPage;