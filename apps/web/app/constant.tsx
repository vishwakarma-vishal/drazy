
export const ShapeTypes = {
    RECTANGLE: "RECTANGLE",
    CIRCLE: "CIRCLE",
    LINE: "LINE",
    PEN: "PEN"
} as const;

// Extract union type ("RECTANGLE" | "CIRCLE")
export type ShapeType = typeof ShapeTypes[keyof typeof ShapeTypes];

export type Shape = {
    type: typeof ShapeTypes.RECTANGLE,
    startX: number,
    startY: number,
    width: number,
    height: number,
    color: string
} | {
    type: typeof ShapeTypes.CIRCLE,
    startX: number,
    startY: number,
    radius: number,
    color: string
}