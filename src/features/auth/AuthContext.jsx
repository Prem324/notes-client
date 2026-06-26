import { createContext, useContext, useState } from "react";
import {
    getToken,
    saveToken,
    removeToken,
} from "./authUtils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(getToken());

    const isLoggedIn = Boolean(token);

    function login(tokenValue) {
    saveToken(tokenValue);
    setToken(tokenValue);
    }

    function logout() {
    removeToken();
    setToken(null);
    }

    const value = {
    token,
    isLoggedIn,
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
    const context = useContext(AuthContext);

    if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
