import { useEffect, useRef, useState } from "react";
import { Drawer } from "../draw/Drawer";
import Toolbar from "./Toolbar";

export const Canvas = ({ socket, roomId }: { socket: WebSocket, roomId: string }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawerRef = useRef<Drawer | null>(null);

    const [selectedShapeType, setSelectedShapeType] = useState("RECTANGLE");
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const drawer = new Drawer(canvas, socket, roomId, selectedShapeType, selectedColor);
        drawerRef.current = drawer;

        // cleanup
        return () => {
            drawer.destroy();
            drawerRef.current = null;
        }
    }, [socket, roomId]);

    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.selectedColor = selectedColor;
            drawerRef.current.selectedShapeType = selectedShapeType;
        }
    }, [selectedColor, selectedShapeType]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="bg-black"
                width={window.innerWidth}
                height={window.innerHeight}
            >
            </canvas>

            <Toolbar setSelectedColor={setSelectedColor} setSelectedShapeType={setSelectedShapeType} selectedColor={selectedColor} />
        </div>
    )
}