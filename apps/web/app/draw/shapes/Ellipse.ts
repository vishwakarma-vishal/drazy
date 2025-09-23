import { BaseShape } from "./BaseShape"

export class Ellipse extends BaseShape {
    startX: number; // center x
    startY: number; // center y
    radiusX: number;
    radiusY: number

    constructor(startX: number, startY: number, radiusX: number, radiusY: number, color: string) {
        super(color);
        this.startX = startX;
        this.startY = startY;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        // draw resize handlers only if selected
        if (this.selected) {
            this.getAllHandle().forEach(h => {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });

            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.strokeRect(this.startX - this.radiusX, this.startY - this.radiusY, this.radiusX * 2, this.radiusY * 2);
        }
    }

    isPointerInside(x: number, y: number): boolean {
        const dx = x - this.startX;
        const dy = y - this.startY;

        return (dx * dx) / (this.radiusX * this.radiusX) +
            (dy * dy) / (this.radiusY * this.radiusY) <= 1;
    }


    move(dx: number, dy: number): void {
        this.startX = this.startX + dx;
        this.startY = this.startY + dy;
    }

    // get all handles positions
    getAllHandle() {
        const { startX, startY, radiusX, radiusY } = this;

        return [
            { name: "top-left", x: startX - radiusX, y: startY - radiusY },
            { name: "top-center", x: startX, y: startY - radiusY },
            { name: "top-right", x: startX + radiusX, y: startY - radiusY },
            { name: "left-center", x: startX - radiusX, y: startY },
            { name: "right-center", x: startX + radiusX, y: startY },
            { name: "bottom-left", x: startX - radiusX, y: startY + radiusY },
            { name: "bottom-center", x: startX, y: startY + radiusY },
            { name: "bottom-right", x: startX + radiusX, y: startY + radiusY }
        ]
    }

    getHandleAt(x: number, y: number): string | null {
        return this.getAllHandle().find(h => (Math.abs(x - h.x) <= 5) && (Math.abs(y - h.y) <= 5))?.name || null;
    }

    // to resize the shape
    resize(handle: string, x: number, y: number): void {
        switch (handle) {
            case "top-center":
            case "bottom-center":
                this.radiusY = Math.abs(y - this.startY);
                break;
            case "left-center":
            case "right-center":
                this.radiusX = Math.abs(x - this.startX);
                break;
            case "top-left":
            case "top-right":
            case "bottom-left":
            case "bottom-right":
                this.radiusX = Math.abs(x - this.startX);
                this.radiusY = Math.abs(y - this.startY);
                break;
        }
    }
}