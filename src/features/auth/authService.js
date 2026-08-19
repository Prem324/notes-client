import axiosInstance from "../../api/axiosInstance";

async function register(registerData) {
    const response = await axiosInstance.post("/auth/register", registerData);
    return response.data;
}

async function login(loginData) {
    const response = await axiosInstance.post("/auth/login", loginData);
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
export const authService = {
    register,
    login,
    verifyEmail,
    resendVerificationEmail
};