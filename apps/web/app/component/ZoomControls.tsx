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
    <div className="fixed z-50 transition-all max-md:right-4 max-md:top-4 md:bottom-6 md:right-6">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-bg-surface/90 p-1.5 shadow-lg backdrop-blur-md max-md:border-none max-md:bg-transparent max-md:p-0 max-md:shadow-none">

        <button
          onClick={zoomOut}
          className="hidden md:flex size-8 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-bg-app hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>

        <div className="hidden md:flex min-w-[48px] items-center justify-center font-mono text-[11px] font-bold text-text-main">
          {zoomPercent}%
        </div>

        <button
          onClick={zoomIn}
          className="hidden md:flex size-8 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-bg-app hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>

        <div className="hidden md:block mx-1 h-4 w-px bg-border" />

        {/* only reset action is availble on the mobile ui */}
        <button
          onClick={resetZoom}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-subtle shadow-sm transition-all hover:text-primary active:scale-95 md:size-8 md:border-none md:bg-transparent md:shadow-none md:hover:bg-bg-app md:hover:text-red-500"
          title="Reset Zoom"
        >
          <span className="material-symbols-outlined text-[20px] md:text-[18px]">restart_alt</span>
        </button>
      </div>
    </div>
  );
}

