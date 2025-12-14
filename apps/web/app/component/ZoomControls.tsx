import React, { useState, useEffect } from "react";
import { KEY_ZOOM_STEP_PERCENT, MAX_ZOOM, MIN_ZOOM } from "../constants/zoom";

type ZoomControlsProps = {
  drawerRef: React.RefObject<any>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export default function ZoomControls({ drawerRef, canvasRef }: ZoomControlsProps) {
  const [zoomPercent, setZoomPercent] = useState(100);

  // Auto-sync zoom value with camera
  useEffect(() => {
    let frame: number;

    const sync = () => {
      const drawer = drawerRef.current;
      if (drawer) {
        const zoom = drawer.camera.zoom ?? 1;
        setZoomPercent(Math.round(zoom * 100));
      }
      frame = requestAnimationFrame(sync);
    };

    sync();
    return () => cancelAnimationFrame(frame);
  }, []);

  const zoomIn = () => {
    const drawer = drawerRef.current;
    const canvas = canvasRef.current;
    if (!drawer || !canvas) return;

    const current = drawer.camera.zoom;
    const currentPercent = current * 100;
    const nextPercent = Math.min(currentPercent + KEY_ZOOM_STEP_PERCENT, MAX_ZOOM * 100);

    const nextZoom = nextPercent / 100;
    const factor = nextZoom / current;

    drawer.camera.zoomAtCenter(factor, canvas);
    drawer.refreshRender();
  };

  const zoomOut = () => {
    const drawer = drawerRef.current;
    const canvas = canvasRef.current;
    if (!drawer || !canvas) return;

    const current = drawer.camera.zoom;
    const currentPercent = current * 100;

    const nextPercent = Math.max(currentPercent - KEY_ZOOM_STEP_PERCENT, MIN_ZOOM * 100);

    const nextZoom = nextPercent / 100;
    const factor = nextZoom / current;

    drawer.camera.zoomAtCenter(factor, canvas);
    drawer.refreshRender();
  };

  const resetZoom = () => {
    const drawer = drawerRef.current;
    const canvas = canvasRef.current;
    if (!drawer || !canvas) return;

    const current = drawer.camera.zoom;
    const nextZoom = 1;               // 100%
    const factor = nextZoom / current;

    drawer.camera.zoomAtCenter(factor, canvas);
    drawer.refreshRender();
  };

  return (
    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-2 rounded-md flex items-center gap-3 z-50">

      <button className="px-2 py-1 bg-white/10 rounded hover:bg-white/20" onClick={zoomOut}>
        -
      </button>

      <span className="min-w-[60px] text-center">{zoomPercent}%</span>

      <button className="px-2 py-1 bg-white/10 rounded hover:bg-white/20" onClick={zoomIn}>
        +
      </button>

      <button className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-xs" onClick={resetZoom}>
        Reset
      </button>
    </div>
  );
}

