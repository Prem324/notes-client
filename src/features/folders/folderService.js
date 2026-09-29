import axiosInstance from "../../api/axiosInstance";

const getFolders = async () => {
  const response = await axiosInstance.get("/folders");
  return response.data;
};

const createFolder = async (name) => {
  const response = await axiosInstance.post("/folders", { name });
  return response.data;
};

const updateFolder = async (id, name) => {
  const response = await axiosInstance.put(`/folders/${id}`, { name });
  return response.data;
};

const deleteFolder = async (id) => {
  const response = await axiosInstance.delete(`/folders/${id}`);
  return response.data;
};

export const folderService = {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
};