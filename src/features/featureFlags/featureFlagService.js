import axiosInstance from "../../api/axiosInstance";

const getFeatureFlags = async () => {
  const response = await axiosInstance.get("/config/features");

  return response.data;
};

export const featureFlagService = {
  getFeatureFlags,
};