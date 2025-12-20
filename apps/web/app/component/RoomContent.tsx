"use client";
import useSocket from "@/app/hooks/useSocket";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";
import { MAX_RETRIES } from "../constant";

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
    const { socket, status, manualReconnect, retryCount, countdown } = useSocket();
    const [hasJoined, setHasJoined] = useState<boolean>(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const router = useRouter();
    const [minLoadingComplete, setMinLoadingComplete] = useState(false); // show the loader to cut down the intial load time by loading data in the background and improve UX and brand identity

    useEffect(() => {
        const timer = setTimeout(() => setMinLoadingComplete(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!socket || status != "OPEN") return;

        joinRoom(socket, roomId);
        setHasJoined(true);

        return () => {
            leaveRoom(socket, roomId);
            setHasJoined(false);
            setIsDataLoaded(false);
        }
    }, [socket, roomId, status]);

    useEffect(() => {
        if (status === "UNAUTHORIZED") {
            router.replace("/auth");
        }
    }, [status, router]);

    // initilizing
    if (status === "INITIALIZING") return null;

    // unauthorized user
    if (status === "UNAUTHORIZED") return null;

    // server is down (unable to reconnect till max retry limit)
    if (status === "MAX_RETRIES_REACHED") {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-bg-app text-center p-6">
                <div className="size-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <span className="material-symbols-outlined text-3xl">cloud_off</span>
                </div>

                <h2 className="text-xl font-bold text-main tracking-tight">Server Unreachable</h2>
                <p className="text-text-subtle mt-2 max-w-xs text-sm leading-relaxed">
                    We tried reconnecting {MAX_RETRIES} times without success.
                </p>

                <div className="mt-8 flex flex-col gap-4 w-full max-w-[240px]">
                    <button
                        onClick={manualReconnect}
                        className="rounded-xl bg-primary px-8 py-3 font-bold text-primaryContrast hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20"
                    >
                        Try Again Manually
                    </button>


                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-subtle hover:text-white transition-colors py-2 cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const showSpinner = !minLoadingComplete || status !== "OPEN" || !hasJoined;
    const isRetrying = status === "CONNECTING" && retryCount > 0;

    return (
        <div className="relative h-screen w-full bg-black">
            {/* loading the canvas in background only when user joined the room */}
            {socket && hasJoined && (
                <Canvas
                    socket={socket}
                    roomId={roomId}
                    isDataLoaded={isDataLoaded}
                    setIsDataLoaded={setIsDataLoaded}
                />
            )}

            {/* on the forgraound showing brand loader/retry screen */}
            {showSpinner && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg-app transition-opacity duration-500">
                    <div className="relative">
                        <div className="size-12 text-primary animate-pulse">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 size-12 animate-ping rounded-full border-2 border-primary/20" />
                    </div>

                    <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-text-subtle">
                        {isRetrying && countdown !== null
                            ? `Retrying in ${countdown}s...`
                            : "Entering Canvas..."}
                    </p>

                    {isRetrying && (
                        <span className="mt-2 text-[10px] text-primary/40">
                            Attempt {retryCount} of {MAX_RETRIES}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}