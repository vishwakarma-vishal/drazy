import { clearToken } from "./token";

let handler: (() => void) | null = null;

export function registerLogoutHandler(fn: () => void) {
    handler = fn;
}

export function forceLogout(reason?: string) {
    console.warn("LOGOUT:", reason);
    clearToken();
    handler?.();
}
