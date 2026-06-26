import axiosInstance from "../../api/axiosInstance";

async function getCommentsByNote(noteId) {
    const response = await axiosInstance.get(`/comments/note/${noteId}`);
    return response.data;
}

async function createComment(noteId, text) {
    const response = await axiosInstance.post(`/comments/${noteId}`, {
    text,
    });

    return response.data;
}

export const commentService = {
    getCommentsByNote,
    createComment,
};