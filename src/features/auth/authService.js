import axiosInstance from "../../api/axiosInstance";

async function register(registerData) {
    const response = await axiosInstance.post("/auth/register", registerData);
    return response.data;
}

async function login(loginData) {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
}

async function refresh() {
  const response = await axiosInstance.post(
    "/auth/refresh"
  );

  return response.data;
}

async function logout() {
  const response = await axiosInstance.post(
    "/auth/logout"
  );

  return response.data;
}

async function verifyEmail(token) {
  const response = await axiosInstance.get(
    `/auth/verify-email/${token}`
  );

  return response.data;
}

async function resendVerificationEmail(email) {
  const response = await axiosInstance.post(
    "/auth/resend-verification",
    { email }
  );

  return response.data;
}

async function forgotPassword(email) {
  const response = await axiosInstance.post(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
}

async function resetPassword(token, password) {
  const response = await axiosInstance.post(
    `/auth/reset-password/${token}`,
    { password }
  );

  return response.data;
}
export const authService = {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
  };