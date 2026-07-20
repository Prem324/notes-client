import { toast } from "react-toastify";

export const showSuccessToast = (message) => {
    toast.success(message || "Success");
};

export const showErrorToast = (message) => {
    toast.error(message || "Something went wrong");
};

export const showInfoToast = (message) => {
    toast.info(message || "Info");
};

export const showWarningToast = (message) => {
    toast.warning(message || "Warning");
};