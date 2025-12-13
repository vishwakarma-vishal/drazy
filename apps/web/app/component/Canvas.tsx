import { useEffect, useRef, useState } from "react";
import { CanvasDrawer } from "../draw/CanvasDrawer";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import { KEY_ZOOM_STEP_PERCENT } from "../constants/zoom";

export const Canvas = ({ socket, roomId }: { socket: WebSocket, roomId: string }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawerRef = useRef<CanvasDrawer | null>(null);

    const [selectedShapeType, setSelectedShapeType] = useState("RECTANGLE");
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    // canvas intilize according to socket state and roomId
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const drawer = new CanvasDrawer(canvas, socket, roomId, selectedShapeType, selectedColor);
        drawerRef.current = drawer;

        // cleanup
        return () => {
            drawer.destroy();
            drawerRef.current = null;
        }
    }, [socket, roomId]);

    // sync selected tool and color to drawer
    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.selectedColor = selectedColor;
            drawerRef.current.selectedShapeType = selectedShapeType;
        }
    }, [selectedColor, selectedShapeType]);

    // for dynamic window size
    useEffect(() => {
        const drawer = drawerRef.current;
        const canvas = canvasRef.current;
        if (!drawer || !canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawer.refreshRender();
        }

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);

    // Keyboard zoom shortcuts (Ctrl/Meta + + / -)
    // anchor point is viewport center
    useEffect(() => {
        const drawer = drawerRef.current;
        const canvas = canvasRef.current;
        if (!drawer || !canvas) return;

        const isTypingInField = () => {
            const el = document.activeElement;
            if (!el) return false;
            const tag = el.tagName.toLowerCase();
            const editable = (el as HTMLElement).getAttribute?.("contenteditable");
            return tag === "input" || tag === "textarea" || editable === "true";
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;
            if (isTypingInField()) return;

            let nextPercent: number | null = null;

            const currentZoom = drawer.camera.zoom;
            const currentPercent = currentZoom * 100;

            // ----- ZOOM IN (+) → +10% -----
            if (e.key === "+" || e.key === "=" || e.key === "Add") {
                nextPercent = Math.min(currentPercent + KEY_ZOOM_STEP_PERCENT, 300);
            }

            // ----- ZOOM OUT (-) → -10% -----
            else if (e.key === "-" || e.key === "Subtract") {
                nextPercent = Math.max(currentPercent - KEY_ZOOM_STEP_PERCENT, 1);
            }

            else return;

            e.preventDefault();

            const nextZoom = nextPercent / 100;
            const factor = nextZoom / currentZoom;

            // apply zoom
            drawer.camera.zoomAtCenter(factor, canvas);
            drawer.refreshRender();
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="bg-black"
                width={window.innerWidth}
                height={window.innerHeight}
            >
            </canvas>

            {/* Simple Zoom Controls */}
            <ZoomControls drawerRef={drawerRef} canvasRef={canvasRef} />

            <Toolbar setSelectedColor={setSelectedColor} setSelectedShapeType={setSelectedShapeType} selectedColor={selectedColor} />
        </div>
    )
}