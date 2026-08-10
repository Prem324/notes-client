import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Input from "../common/Input";

function RegisterForm({ onRegister, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function handleFormSubmit(data) {
    onRegister(data);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h2>Create Account</h2>

      <Input
        label="Name"
        placeholder="Enter your name"
        {...register("name", {
          required: "Name is required",
        })}
      />

      {errors.name && (
        <p className="field-error">{errors.name.message}</p>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
          },
        })}
      />

      {errors.email && (
        <p className="field-error">{errors.email.message}</p>
      )}

      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
      />

      {errors.password && (
        <p className="field-error">{errors.password.message}</p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}

export default RegisterForm;