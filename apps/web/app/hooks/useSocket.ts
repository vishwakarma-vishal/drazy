"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_RETRIES } from "../constant";

const WS_BACKEND = process.env.WS_BACKEND_URL;
if (!WS_BACKEND) throw new Error("WS_BACKEND must be defined in environment variables");

type wsStatus = "INITIALIZING" | "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "UNAUTHORIZED" | "MAX_RETRIES_REACHED";

const useSocket = () => {
    const [status, setStatus] = useState<wsStatus>("INITIALIZING");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const socketRef = useRef<WebSocket | null>(null); // prevent creating multiple socket connection
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    // get token from local storage
    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            setToken(t);
            setStatus("CONNECTING");
        } else {
            setStatus("UNAUTHORIZED");
        }
    }, []);

    const connect = () => {
        if (!token) return;

        // react strick mode protection
        if (socketRef.current) return;

        const wsc = new WebSocket(`${WS_BACKEND}/?token=${token}`);
        socketRef.current = wsc;
        setSocket(wsc);

        wsc.onopen = () => {
            setStatus("OPEN");
            setRetryCount(0);
            setCountdown(null);
        }

        wsc.onclose = (event) => {
            socketRef.current = null;
            setSocket(null);

            if (event.code == 4002) {
                setStatus("UNAUTHORIZED");
            } else if (retryCount < MAX_RETRIES) {
                setStatus("CONNECTING");
                // retry after: 2s, 4s, 8s, 16s, 32s ...
                const delaySeconds = Math.pow(2, retryCount);
                setCountdown(delaySeconds);

                const interval = setInterval(() => {
                    setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
                }, 1000);

                retryTimerRef.current = setTimeout(() => {
                    clearInterval(interval);
                    setCountdown(null);
                    setRetryCount(prev => prev + 1);
                }, delaySeconds * 1000);
            } else {
                setStatus("MAX_RETRIES_REACHED");
            }
        }

        wsc.onerror = () => {
            if (wsc.readyState === WebSocket.CLOSED || wsc.readyState === WebSocket.CLOSING) return;
            wsc.close();
        }
    }

    useEffect(() => {
        connect();

        return () => {
            if (socketRef.current) socketRef.current.close();
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            socketRef.current = null;
        };
    }, [token, retryCount]);

    // Manual retry function for the UI button
    const manualReconnect = () => {
        setRetryCount(0);
        setStatus("CONNECTING");
    };

    return { socket, status, manualReconnect, retryCount, countdown };
}

export default useSocket;