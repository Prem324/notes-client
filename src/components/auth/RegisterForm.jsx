import { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import ErrorMessage from "../common/ErrorMessage";

function RegisterForm({ onRegister, loading = false }) {
  const [formData, setFormData] = useState({
    name: "",
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

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    onRegister(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      <ErrorMessage message={error} />

      <Input
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your name"
      />

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
        placeholder="Enter password"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}

export default RegisterForm;