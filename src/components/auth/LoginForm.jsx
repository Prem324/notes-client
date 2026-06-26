import { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";

function LoginForm({ onLogin, loading = false }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }

    onLogin(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <ErrorMessage message={error} />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

export default LoginForm;