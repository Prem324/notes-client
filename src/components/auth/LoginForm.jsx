import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Input from "../common/Input";

function LoginForm({ onLogin, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleFormSubmit(data) {
    onLogin(data);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h2>Login</h2>

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
        <p className="field-error">
          {errors.email.message}
        </p>
      )}

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters long",
          },
        })}
      />

      {errors.password && (
        <p className="field-error">
          {errors.password.message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

export default LoginForm;