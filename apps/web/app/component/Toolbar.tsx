"use client";
import { Dispatch, SetStateAction } from "react";
import { ShapeTypes } from "../constants/common";

interface ToolbarProps {
  setSelectedColor: Dispatch<SetStateAction<string>>;
  setSelectedShapeType: Dispatch<SetStateAction<string>>;
  selectedColor: string;
  selectedShapeType: string;
}

export default function Toolbar({ setSelectedColor, selectedColor, setSelectedShapeType, selectedShapeType }: ToolbarProps) {
  const tools = [
    { type: ShapeTypes.RECTANGLE, icon: "rectangle" },
    { type: ShapeTypes.ELLIPSE, icon: "circle" },
    { type: ShapeTypes.LINE, icon: "horizontal_rule" },
    { type: ShapeTypes.ARROW, icon: "north_east" },
    { type: ShapeTypes.PEN, icon: "edit" },
    { type: ShapeTypes.TEXT, icon: "title" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border bg-bg-surface/90 p-1.5 shadow-2xl backdrop-blur-md md:bottom-6 md:gap-1 md:rounded-2xl md:p-2">
      {/* tools */}
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => setSelectedShapeType(tool.type)}
          className={`flex size-8 items-center justify-center rounded-lg transition-all md:size-10 md:rounded-xl ${selectedShapeType === tool.type
            ? "bg-primary text-primaryContrast shadow-md scale-105 md:scale-110"
            : "text-text-subtle hover:bg-bg-app hover:text-text-main"
            }`}
        >
          <span className="material-symbols-outlined text-[20px] md:text-[22px]">{tool.icon}</span>
        </button>
      ))}

      <div className="mx-1 h-5 w-px bg-border md:mx-2 md:h-6" />

      {/* color picker */}
      <div className="relative flex size-8 items-center justify-center md:size-10">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        <div
          className="size-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 md:size-6"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
    </div>
  );
}
