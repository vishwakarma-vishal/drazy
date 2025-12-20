import { useEffect, useRef, useState } from "react";
import { CanvasDrawer } from "../draw/CanvasDrawer";
import Toolbar from "./Toolbar";
import ZoomControls from "./ZoomControls";
import { KEY_ZOOM_STEP_PERCENT } from "../constants/zoom";
import Link from "next/link";

interface CanvasProps {
    socket: WebSocket;
    roomId: string;
    isDataLoaded: boolean;
    setIsDataLoaded: (val: boolean) => void;
}

export const Canvas = ({ socket, roomId, isDataLoaded, setIsDataLoaded }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawerRef = useRef<CanvasDrawer | null>(null);

    const [selectedShapeType, setSelectedShapeType] = useState("RECTANGLE");
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    // canvas intilize according to socket state and roomId
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const drawer = new CanvasDrawer(
            canvas,
            socket,
            roomId,
            selectedShapeType,
            selectedColor,
            () => setIsDataLoaded(true)
        );
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
        <div className="relative h-screen w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className={`bg-black transition-opacity duration-700 ease-in-out ${isDataLoaded ? "opacity-100" : "opacity-0 cursor-not-allowed"
                    }`}
                width={window.innerWidth}
                height={window.innerHeight}

            >
            </canvas>

            {/* showing syncing message till the initial data load */}
            {!isDataLoaded && (
                <div className={`absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-bg-surface/80 px-4 py-2 backdrop-blur-md border border-border transition-all duration-500 ${isDataLoaded && "opacity-100 translate-y-0"
                    }`}>
                    <div className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-subtle">
                        Syncing Shapes...
                    </span>
                </div>
            )}

            <div className={`transition-opacity duration-1000 ${isDataLoaded ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}>
                {/* back to dashboard */}
                <Link
                    href="/dashboard"
                    className="fixed left-4 top-4 z-50 flex size-9 items-center justify-center rounded-lg border border-border bg-bg-surface text-text-subtle shadow-sm transition-all hover:text-primary active:scale-95 md:left-6 md:top-6 md:size-10 md:rounded-xl"
                >
                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">arrow_back</span>
                </Link>

                <ZoomControls drawerRef={drawerRef} canvasRef={canvasRef} />

                <Toolbar
                    setSelectedColor={setSelectedColor} setSelectedShapeType={setSelectedShapeType} selectedColor={selectedColor}
                    selectedShapeType={selectedShapeType} />
            </div>
        </div>
    )
}