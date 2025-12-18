"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getToken,
    isExpired,
    setToken,
    clearToken,
    getExpiry,
} from "./token";
import { registerLogoutHandler } from "./logout";

type Status = "loading" | "authenticated" | "unauthenticated";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<Status>("loading");
    const [token, setAuthToken] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // 1. Resolve auth on app load
    useEffect(() => {
        const t = getToken();
        if (!t || isExpired(t)) {
            clearToken();
            setStatus("unauthenticated");
            return;
        }
        setAuthToken(t);
        setStatus("authenticated");
    }, []);

    // 2. Register global logout
    useEffect(() => {
        registerLogoutHandler(() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setAuthToken(null);
            setStatus("unauthenticated");
            router.replace("/auth");
        });
    }, [router]);

    // 3. Auto logout on expiry
    useEffect(() => {
        if (!token) return;

        const exp = getExpiry(token);
        if (!exp) return logout();

        const delay = exp - Date.now();
        if (delay <= 0) return logout();

        timerRef.current = setTimeout(logout, delay);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [token]);

    function login(t: string) {
        setToken(t);
        setAuthToken(t);
        setStatus("authenticated");
        router.replace("/dashboard");
    }

    function logout() {
        clearToken();
        setAuthToken(null);
        setStatus("unauthenticated");
        router.replace("/auth");
    }

    return (
        <AuthContext.Provider value={{ status, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
