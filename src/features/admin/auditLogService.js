import axiosInstance from "../../api/axiosInstance";

export const auditLogService = {

    getAuditLogs: async ({
        page = 1,
        limit = 10,
        action = "",
        resource = "",
        userId = "",
    } = {}) => {

        const params = {
            page,
            limit,
        };

        if (action) {
            params.action = action;
        }

        if (resource) {
            params.resource = resource;
        }

        if (userId) {
            params.userId = userId;
        }

        const response =
            await axiosInstance.get(
                "/admin/audit-logs",
                {
                    params,
                }
            );

        return response.data;
    },
};