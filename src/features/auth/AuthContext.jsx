import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getToken,
    saveToken,
    removeToken,
} from "./authUtils";

import { authService } from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        getToken()
    );

    const [loading, setLoading] = useState(true);

    const isLoggedIn = Boolean(token);


    useEffect(() => {

        async function restoreAuth() {

            try {

                const existingToken = getToken();

                /*
                 * If we already have an access token,
                 * don't unnecessarily refresh immediately.
                 */
                if (existingToken) {
                    return;
                }

                /*
                 * No access token.
                 *
                 * Try to get a new one using the
                 * httpOnly refresh-token cookie.
                 */
                const result =
                    await authService.refresh();

                const newAccessToken =
                    result.data.accessToken;

                saveToken(newAccessToken);

                setToken(newAccessToken);

            } catch (error) {

                /*
                 * No valid refresh token.
                 *
                 * User simply remains logged out.
                 */
                removeToken();
                setToken(null);

            } finally {

                setLoading(false);

            }
        }

        restoreAuth();

    }, []);


    function login(tokenValue) {

        saveToken(tokenValue);

        setToken(tokenValue);

    }


    async function logout() {

        try {

            await authService.logout();

        } catch (error) {

            console.error(
                "Logout request failed:",
                error
            );

        } finally {

            removeToken();

            setToken(null);

        }

    }


    const value = {
        token,
        isLoggedIn,
        loading,
        login,
        logout,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
}