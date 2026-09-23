import axiosInstance from "../../api/axiosInstance";

const getTags = async () => {
  const response = await axiosInstance.get("/tags");
  return response.data;
};

const createTag = async (name) => {
  const response = await axiosInstance.post("/tags", { name });
  return response.data;
};

const updateTag = async (id, name) => {
  const response = await axiosInstance.put(`/tags/${id}`, { name });
  return response.data;
};

const deleteTag = async (id) => {
  const response = await axiosInstance.delete(`/tags/${id}`);
  return response.data;
};

export const tagService = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};