import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw/initDraw";
import Toolbar from "./Toolbar";

export const Canvas = ({ socket, roomId }: { socket: WebSocket, roomId: string }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedShape, setSelectedShape] = useState("RECTANGLE");
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cleanup = initDraw({ canvas, socket, roomId, selectedShape, selectedColor});
        return cleanup;
    }, [canvasRef, socket, roomId, selectedColor, selectedShape]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="bg-black"
                width={window.innerWidth}
                height={window.innerHeight}
            >
            </canvas>

            <Toolbar setSelectedColor={setSelectedColor} setSelectedShape={setSelectedShape} selectedColor={selectedColor} />
        </div>
    )
}