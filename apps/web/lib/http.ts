// src/lib/http.ts
import axios from "axios";
import { getToken } from "@/auth/token";
import { forceLogout } from "@/auth/logout";

const http = axios.create({
    baseURL: process.env.HTTP_BACKEND_URL,
});

http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
            forceLogout("HTTP_401");
        }
        return Promise.reject(err);
    }
);

export default http;
