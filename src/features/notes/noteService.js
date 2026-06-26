import axiosInstance from "../../api/axiosInstance";

async function getNotes({page=1,limit=10,search=""}={}) {
    const response=await axiosInstance.get("/notes",{
        params:{
            page,
            limit,
            search,
        },
    });
    return response.data;
}

async function getNoteById(noteId) {
    const response = await axiosInstance.get(`/notes/${noteId}`);
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

export const noteService = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    uploadAttachments,
    deleteAttachment
};