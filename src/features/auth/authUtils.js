const TOKEN_KEY = "token";

export function saveToken(token) {
    if(!token){
        throw new Error("Token is required");
    }
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
    return Boolean(getToken());
}