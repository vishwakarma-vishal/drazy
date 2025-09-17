import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw/initDraw";

export const Canvas = ({ socket, roomId }: { socket: WebSocket, roomId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cleanup = initDraw({canvas, socket, roomId});
        return cleanup;
    }, [canvasRef]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="bg-black"
                width={window.innerWidth}
                height={window.innerHeight}
            >
            </canvas>

            <div className="absolute bottom-15 left-2 text-white flex gap-5">
                {/* <button onClick={() => setSelectedShape(shapeType.CIRCLE)}>Circle</button>
                <button onClick={() => setSelectedShape(shapeType.RECTANGLE)}>Rectangle</button> */}
            </div>
        </div>
    )
}