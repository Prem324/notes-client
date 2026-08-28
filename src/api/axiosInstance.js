import axios from "axios";

import {
    getToken,
    removeToken,
    saveToken,
} from "../features/auth/authUtils";


const axiosInstance = axios.create({

    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:5000/api/v1",

    // Required for httpOnly refresh-token cookie
    withCredentials: true,

});


/*
 * ==========================================
 * REQUEST INTERCEPTOR
 * ==========================================
 */

axiosInstance.interceptors.request.use(

    (config) => {

        const token = getToken();

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        if (config.data instanceof FormData) {

            delete config.headers["Content-Type"];

        } else {

            config.headers["Content-Type"] =
                "application/json";

        }

        return config;

    },

    (error) => {
        return Promise.reject(error);
    }

);


/*
 * ==========================================
 * REFRESH TOKEN QUEUE
 * ==========================================
 */

let isRefreshing = false;

let refreshSubscribers = [];


function subscribeTokenRefresh(callback) {

    refreshSubscribers.push(callback);

}


function onRefreshed(newToken) {

    refreshSubscribers.forEach(
        (callback) => callback(newToken)
    );

    refreshSubscribers = [];

}


/*
 * ==========================================
 * AUTH ENDPOINT CHECK
 * ==========================================
 */

function isAuthRequest(url = "") {

    return (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password") ||
        url.includes("/auth/verify-email") ||
        url.includes("/auth/resend-verification")
    );

}


/*
 * ==========================================
 * RESPONSE INTERCEPTOR
 * ==========================================
 */

axiosInstance.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;


        /*
         * If there is no request config,
         * just return the original error.
         */

        if (!originalRequest) {

            return Promise.reject(error);

        }


        /*
         * Only handle 401 responses.
         */

        if (
            error.response?.status !== 401
        ) {

            return Promise.reject(error);

        }


        /*
         * NEVER refresh for authentication
         * endpoints.
         *
         * This is critical for:
         *
         * /login
         * /register
         * /refresh
         * /logout
         * /forgot-password
         * etc.
         */

        if (
            isAuthRequest(
                originalRequest.url
            )
        ) {

            return Promise.reject(error);

        }


        /*
         * Prevent infinite retry loops.
         */

        if (originalRequest._retry) {

            return Promise.reject(error);

        }


        originalRequest._retry = true;


        /*
         * ======================================
         * REFRESH ALREADY IN PROGRESS
         * ======================================
         */

        if (isRefreshing) {

            return new Promise(
                (resolve, reject) => {

                    subscribeTokenRefresh(
                        (newToken) => {

                            if (!newToken) {

                                reject(error);

                                return;

                            }


                            originalRequest
                                .headers
                                .Authorization =
                                `Bearer ${newToken}`;


                            resolve(
                                axiosInstance(
                                    originalRequest
                                )
                            );

                        }
                    );

                }
            );

        }


        /*
         * ======================================
         * START TOKEN REFRESH
         * ======================================
         */

        isRefreshing = true;


        try {

            const response =
                await axiosInstance.post(
                    "/auth/refresh"
                );


            const newToken =
                response.data.data.accessToken;


            /*
             * Save new access token.
             */

            saveToken(newToken);


            /*
             * Resolve all queued requests.
             */

            onRefreshed(newToken);


            /*
             * Retry original request.
             */

            originalRequest
                .headers
                .Authorization =
                `Bearer ${newToken}`;


            return axiosInstance(
                originalRequest
            );


        } catch (refreshError) {

            /*
             * Refresh token is invalid,
             * expired, missing, or revoked.
             */

            removeToken();


            /*
             * Reject all queued requests.
             */

            onRefreshed(null);


            return Promise.reject(
                refreshError
            );


        } finally {

            isRefreshing = false;

        }

    }

);


export default axiosInstance;