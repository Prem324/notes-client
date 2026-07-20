import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../components/auth/RegisterForm";
import ErrorMessage from "../components/common/ErrorMessage";
import { authService } from "../features/auth/authService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { showSuccessToast, showErrorToast } from "../utils/toast";


function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(formData) {
    try {
      setLoading(true);
      setError("");

      const result=await authService.register(formData);
      showSuccessToast(result.message || "Account created successfully. Please login.");

      navigate("/login",{
        state:{
          message:"Registration successful. Please login.",
        }
      })
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