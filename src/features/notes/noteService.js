import axiosInstance from "../../api/axiosInstance";

async function getNotes({page=1,limit=10,search="",tag="",folder=""}={}) {
    const response=await axiosInstance.get("/notes",{
        params:{
            page,
            limit,
            search,
            tag,
            folder
        },
    });
    return response.data;
}

async function getNoteById(noteId) {
    const response = await axiosInstance.get(`/notes/${noteId}`);
    return response.data;
}

async function getNoteActivity(
    noteId,
    { page = 1, limit = 20 } = {}
) {
    const response = await axiosInstance.get(
        `/notes/${noteId}/activity`,
        {
            params: {
                page,
                limit,
            },
        }
    );

    return response.data;
}

async function createNote(noteData) {
    const response=await axiosInstance.post("/notes",noteData)
    return response.data;
}

async function updateNote(noteId, noteData) {
    const response=await axiosInstance.put(`/notes/${noteId}`,noteData);
    return response.data;
}

async function deleteNote(noteId) {
    const response=await axiosInstance.delete(`/notes/${noteId}`);
    return response.data
}

async function uploadAttachments(noteId, formData) {
    const response = await axiosInstance.post(
    `/notes/${noteId}/attachments`,
    formData
    );

    return response.data;
}

async function deleteAttachment(noteId, attachmentId) {
    const response = await axiosInstance.delete(
        `/notes/${noteId}/attachments/${attachmentId}`
    );
    
    return response.data;
}

async function shareNote(noteId, shareData) {
    const response = await axiosInstance.post(
        `/notes/${noteId}/share`,
        shareData
    );

    return response.data;
}

async function getNoteCollaborators(noteId) {
    const response = await axiosInstance.get(
        `/notes/${noteId}/collaborators`
    );

    return response.data;
}

async function updateCollaboratorPermission(
    noteId,
    userId,
    permission
) {
    const response = await axiosInstance.put(
        `/notes/${noteId}/collaborators/${userId}`,
        { permission }
    );

    return response.data;
}

async function removeCollaborator(noteId, userId) {
    const response = await axiosInstance.delete(
        `/notes/${noteId}/collaborators/${userId}`
    );

    return response.data;
}

export const noteService = {
    getNotes,
    getNoteById,
    getNoteActivity,
    createNote,
    updateNote,
    deleteNote,
    uploadAttachments,
    deleteAttachment,
    shareNote,
    getNoteCollaborators,
    updateCollaboratorPermission,
    removeCollaborator,
};