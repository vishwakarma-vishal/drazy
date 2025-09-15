"use client";

import useSocket from "@/app/hooks/useSocket";
import Link from "next/link";

export default function Dashboard() {
    const { status } = useSocket();

    if (status === "CONNECTING") {
        return <div>Loading...</div>
    }

    if (status === "UNAUTHORIZED") {
        return <div>Invalid or expired token. Sign in again.</div>
    }

    if (status === "OPEN") {
        return (
            <div>
                <p>WebSocket Status: {status}</p>
                <Link href="/room/f6a2e72c-f5a0-496f-9216-dd91de1d966f/abc">Room</Link>
                <p>Dashboard page, where we show all the available rooms.</p>
            </div>
        );
    }

    return <div>Connection closed. Please refresh the page.</div>;
}