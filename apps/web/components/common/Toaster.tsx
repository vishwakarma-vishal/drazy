"use client";

import { useEffect, useState } from "react";

const THEMES: any = {
  success: { icon: "check_circle", color: "text-green-500", bg: "bg-green-500" },
  error: { icon: "error", color: "text-red-500", bg: "bg-red-500" },
  warn: { icon: "warning", color: "text-amber-500", bg: "bg-amber-500" },
  info: { icon: "info", color: "text-primary", bg: "bg-primary" },
};

export const Toaster = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('drazy-toast', handleToast);

    return () => window.removeEventListener('drazy-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-[10000] flex w-full max-w-[90%] -translate-x-1/2 flex-col gap-3 md:right-6 md:left-auto md:w-auto md:max-w-sm md:translate-x-0">
      {toasts.map((t) => {
        const theme = THEMES[t.type] || THEMES.success;
        return (
          <div
            key={t.id}
            className="animate-in fade-in slide-in-from-top-4 relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-bg-surface/95 p-4 shadow-2xl backdrop-blur-md">
            <div className={`absolute left-0 top-0 h-full w-1 ${theme.bg}`} />
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-app ${theme.color}`}>
              <span className="material-symbols-outlined text-[20px]">{theme.icon}</span>
            </div>

            <div className="flex-1 pr-4">
              <p className="text-[13px] font-bold text-text-main capitalize">
                {t.type === 'warn' ? 'Warning' : t.type}
              </p>
              <p className="text-[12px] text-text-subtle">{t.message}</p>
            </div>

            <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} className="text-text-subtle hover:text-text-main">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};