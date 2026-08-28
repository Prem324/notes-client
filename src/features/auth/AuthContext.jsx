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

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const isLoggedIn = Boolean(token);


    // ================================
    // Restore Authentication
    // ================================

    useEffect(() => {

        async function restoreAuth() {

            try {

                const existingToken = getToken();

                /*
                 * Access token already exists.
                 *
                 * We still fetch the profile so
                 * that we know the user's role.
                 */
                if (existingToken) {

                    setToken(existingToken);

                    const result =
                        await authService.getProfile();

                    setUser(result.user);

                    return;
                }


                /*
                 * No access token.
                 *
                 * Try to get a new access token
                 * using the httpOnly refresh cookie.
                 */
                const result =
                    await authService.refresh();

                const newAccessToken =
                    result.data.accessToken;

                saveToken(newAccessToken);

                setToken(newAccessToken);


                /*
                 * Get authenticated user's
                 * information and role.
                 */
                const profileResult =
                    await authService.getProfile();

                setUser(profileResult.user);

            } catch (error) {

                /*
                 * No valid authentication.
                 */
                removeToken();

                setToken(null);

                setUser(null);

            } finally {

                setLoading(false);

            }
        }

        restoreAuth();

    }, []);


    // ================================
    // Login
    // ================================

    async function login(tokenValue) {

        saveToken(tokenValue);

        setToken(tokenValue);


        /*
         * Fetch the authenticated user's
         * profile immediately after login.
         */
        try {

            const result =
                await authService.getProfile();

            setUser(result.user);

        } catch (error) {

            removeToken();

            setToken(null);

            setUser(null);

            throw error;
        }

    }


    // ================================
    // Logout
    // ================================

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

            setUser(null);

        }

    }


    // ================================
    // Context Value
    // ================================

    const value = {
        token,
        user,
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