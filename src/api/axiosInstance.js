import axios from "axios";
import { getToken, removeToken,saveToken } from "../features/auth/authUtils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",

  // Required for httpOnly refresh-token cookie
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => {
    callback(newToken);
  });

  refreshSubscribers = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

  if (
    error.response?.status !== 401 ||
    originalRequest._retry ||
    originalRequest.url === "/auth/refresh"
  ) {
  return Promise.reject(error);
  }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(
            axiosInstance(originalRequest)
          );
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axiosInstance.post(
        "/auth/refresh"
      );

      const newToken =
        response.data.data.accessToken;

      saveToken(newToken);

      onRefreshed(newToken);

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return axiosInstance(originalRequest);

    } catch (refreshError) {

      removeToken();

      onRefreshed(null);

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;