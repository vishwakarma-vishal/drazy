"use client";

import { useEffect, useRef, useState } from "react";

let socket: WebSocket | null = null;

type wsStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "UNAUTHORIZED";

const useSocket = () => {
    const [status, setStatus] = useState<wsStatus>("CONNECTING");
    const [token, setToken] = useState<string | null | undefined>(undefined);
    const didInit = useRef(false);

    const WS_BACKEND = process.env.WS_BACKEND_URL;
    if (!WS_BACKEND) throw new Error("WS_BACKEND must be defined in environment variables");

    // get token from local storage
    useEffect(() => {
        const t = localStorage.getItem("token");
        setToken(t);
    }, []);

    useEffect(() => {
        if (token === undefined) return;

        if (didInit.current) return; 
        didInit.current = true;

        if (!token) {
            setStatus("UNAUTHORIZED");
            return;
        }

        if (socket) {
            return;
        }

        const wsc = new WebSocket(`${WS_BACKEND}/?token=${token}`);

        wsc.onopen = () => setStatus("OPEN");
        wsc.onerror = (error) => {
            setStatus("CLOSED");
        }

        wsc.onclose = (event) => {
            if (event.code == 4002) {
                setStatus("UNAUTHORIZED");
            } else setStatus("CLOSED")
        }

        socket = wsc;

        return () => {
            if (socket) {
                socket.close();
                socket = null;
            }
        };
    }, [token]);

    return { socket, status };
}

export default useSocket;