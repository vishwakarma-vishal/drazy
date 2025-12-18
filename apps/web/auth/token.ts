import jwt from "jsonwebtoken";

const KEY = "token";

type Payload = { exp: number };

export function getToken() {
    return localStorage.getItem(KEY);
}

export function setToken(token: string) {
    localStorage.setItem(KEY, token);
}

export function clearToken() {
    localStorage.removeItem(KEY);
}

export function getExpiry(token: string): number | null {
    try {
        const decodedToken = jwt.decode(token);
        const { exp } = decodedToken as Payload;
        return exp * 1000;
    } catch {
        return null;
    }
}

export function isExpired(token: string) {
    const exp = getExpiry(token);
    return !exp || Date.now() >= exp;
}
