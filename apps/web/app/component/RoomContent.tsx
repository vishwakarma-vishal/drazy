"use client";
import useSocket from "@/app/hooks/useSocket";
import axios from "axios";
import { useEffect, useState } from "react";

const joinRoom = (socket: WebSocket, roomId: string) => {
    const joinRoomPayload = {
        "type": "join",
        "roomId": roomId
    }
    socket.send(JSON.stringify(joinRoomPayload));
}

const leaveRoom = (socket: WebSocket, roomId: string) => {
    const leaveRoomPayload = {
        "type": "leave",
        "roomId": roomId
    }
    socket.send(JSON.stringify(leaveRoomPayload));
}

export default function RoomContent({ roomId }: { roomId: string }) {
    const [content, setContent] = useState<any | null>(null);
    const { socket, status } = useSocket();

    useEffect(() => {
        if (!socket || status != "OPEN") return;

        joinRoom(socket, roomId);
        // get the content from the db

        return () => {
            leaveRoom(socket, roomId);
        }
    }, [socket, roomId, status]);

    if (!socket) return <div>Try to reload the page.</div>
    if (status != "OPEN") return <div>loading...</div>

    socket.onmessage = (message) => {
        console.log(message.data)
    }

    return (
        <div>{JSON.stringify(content)}</div>
    );
}