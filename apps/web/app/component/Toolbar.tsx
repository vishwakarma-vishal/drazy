"use client";

import { BiRectangle } from "react-icons/bi";
import { FaRegCircle } from "react-icons/fa";
import { LuMinus, LuPen } from "react-icons/lu";
import { GoArrowUpRight } from "react-icons/go";
import { Dispatch, SetStateAction, useEffect } from "react";
import { ShapeTypes } from "../constants/common";
import { IoText } from "react-icons/io5";

interface ToolbarProps {
  setSelectedColor: Dispatch<SetStateAction<string>>;
  setSelectedShapeType: Dispatch<SetStateAction<string>>;
  selectedColor: string;
}

export default function Toolbar({ setSelectedColor, selectedColor, setSelectedShapeType }: ToolbarProps) {

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[20px] 
                    bg-white/10 backdrop-blur-md text-white 
                    rounded-full shadow-lg border border-white/20
                    flex items-center gap-4 px-5 py-2">

      <button onClick={() => setSelectedShapeType(ShapeTypes.RECTANGLE)} className="p-2 rounded-full hover:bg-white/20 transition">
        <BiRectangle className="text-2xl" />
      </button>

      <button onClick={() => setSelectedShapeType(ShapeTypes.ELLIPSE)} className="p-2 rounded-full hover:bg-white/20 transition">
        <FaRegCircle className="text-2xl" />
      </button>

      <button onClick={() => setSelectedShapeType(ShapeTypes.LINE)} className="p-2 rounded-full hover:bg-white/20 transition">
        <LuMinus className="text-2xl" />
      </button>

      <button onClick={() => setSelectedShapeType(ShapeTypes.ARROW)} className="p-2 rounded-full hover:bg-white/20 transition">
        <GoArrowUpRight className="text-2xl" />
      </button>

      <button onClick={() => setSelectedShapeType(ShapeTypes.PEN)} className="p-2 rounded-full hover:bg-white/20 transition">
        <LuPen className="text-2xl" />
      </button>

      <button onClick={() => setSelectedShapeType(ShapeTypes.TEXT)} className="p-2 rounded-full hover:bg-white/20 transition">
        <IoText className="text-2xl" />
      </button>

      {/* Color Picker */}
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="inline-block w-8 h-8 rounded-full cursor-pointer border-none
                   bg-transparent p-0 overflow-hidden outline-none"
      />
    </div>
  );
}
