"use client";
import useSocket from "@/app/hooks/useSocket";
import { useEffect } from "react";
import { Canvas } from "./Canvas";

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
    const { socket, status } = useSocket();

    useEffect(() => {
        if (!socket || status != "OPEN") return;

        joinRoom(socket, roomId);

        return () => {
            leaveRoom(socket, roomId);
        }
    }, [socket, roomId, status]);

    if (!socket) return <div>Try to reload the page.</div>
    if (status != "OPEN") return <div>loading...</div>

    return (
        <Canvas socket={socket} roomId={roomId}></Canvas>
    );
}