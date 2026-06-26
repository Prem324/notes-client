import axiosInstance from "../../api/axiosInstance";

async function register(registerData) {
    const response = await axiosInstance.post("/auth/register", registerData);
    return response.data;
}

async function login(loginData) {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
}

export const authService = {
    register,
    login,
};