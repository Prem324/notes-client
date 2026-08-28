import axiosInstance from "../../api/axiosInstance";

async function getDashboard() {
    const response = await axiosInstance.get(
        "/admin/dashboard"
    );

    return response.data;
}

async function getUsers() {
    const response = await axiosInstance.get(
        "/admin/users"
    );

    return response.data;
}

async function updateUserRole(userId, role) {
    const response = await axiosInstance.patch(
        `/admin/users/${userId}/role`,
        { role }
    );

    return response.data;
}

async function deleteUser(userId) {
    const response = await axiosInstance.delete(
        `/admin/users/${userId}`
    );

    return response.data;
}

async function deleteNote(noteId) {
    const response = await axiosInstance.delete(
        `/admin/notes/${noteId}`
    );

    return response.data;
}

export const adminService = {
    getDashboard,
    getUsers,
    updateUserRole,
    deleteUser,
    deleteNote,
};