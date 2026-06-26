import axiosInstance from "../../api/axiosInstance";

async function getProfile() {
  const response = await axiosInstance.get("/users/profile");
  return response.data;
}

async function uploadProfilePicture(formData) {
  const response = await axiosInstance.patch("/users/profile-picture", formData);
  return response.data;
}

async function deleteProfilePicture() {
  const response = await axiosInstance.delete("/users/profile-picture");
  return response.data;
}

export const profileService = {
  getProfile,
  uploadProfilePicture,
  deleteProfilePicture,
};