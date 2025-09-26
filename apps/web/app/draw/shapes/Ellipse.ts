import { BaseShape } from "./BaseShape"

export class Ellipse extends BaseShape {
    startX: number; // starting position of ellipse closing rectangle
    startY: number;
    radiusX: number;
    radiusY: number;
    //constraints
    minWidth: number = 40;
    minHeight: number = 20;

    // follow this centerX -> startX + radiusX, centery -> startY + radiusY

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
        ctx.ellipse(this.startX + this.radiusX, this.startY + this.radiusY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        if (this.selected) {
            this.getAllHandle().forEach(h => {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });

            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.strokeRect(this.startX, this.startY, this.radiusX * 2, this.radiusY * 2);
        }
    }

    isPointerInside(x: number, y: number): boolean {
        const dx = x - (this.startX + this.radiusX);
        const dy = y - (this.startY + this.radiusY);

        return (dx * dx) / (this.radiusX * this.radiusX) +
            (dy * dy) / (this.radiusY * this.radiusY) <= 1;
    }

    move(dx: number, dy: number): void {
        this.startX = this.startX + dx;
        this.startY = this.startY + dy;
    }

    getAllHandle() {
        const { startX, startY, radiusX, radiusY } = this;
        const width: number = radiusX * 2;
        const height: number = radiusY * 2;

        return [
            { name: "top-left", x: startX, y: startY },
            { name: "top-center", x: startX + width / 2, y: startY },
            { name: "top-right", x: startX + width, y: startY },
            { name: "left-center", x: startX, y: startY + height / 2 },
            { name: "right-center", x: startX + width, y: startY + height / 2 },
            { name: "bottom-left", x: startX, y: startY + height },
            { name: "bottom-center", x: startX + width / 2, y: startY + height },
            { name: "bottom-right", x: startX + width, y: startY + height }
        ]
    }

    getHandleAt(x: number, y: number): string | null {
        return this.getAllHandle().find(h => (Math.abs(x - h.x) <= 5) && (Math.abs(y - h.y) <= 5))?.name || null;
    }

    resize(handle: string, x: number, y: number): void {
        let fixedX: number, fixedY: number;
        let width = this.radiusX * 2;
        let height = this.radiusY * 2;
        const startX = this.startX;
        const startY = this.startY;

        switch (handle) {
            case "bottom-right":
                fixedX = startX;
                fixedY = startY;
                break;
            case "top-left":
                fixedX = startX + width;
                fixedY = startY + height;
                break;
            case "top-right":
                fixedX = startX;
                fixedY = startY + height;
                break;
            case "bottom-left":
                fixedX = startX + width;
                fixedY = startY;
                break;
            case "top-center":
                fixedX = startX;
                fixedY = startY + height;
                break;
            case "right-center":
                fixedX = startX;
                fixedY = startY;
                break;
            case "bottom-center":
                fixedX = startX;
                fixedY = startY;
                break;
            case "left-center":
                fixedX = startX + width;
                fixedY = startY;
                break;
            default:
                return;
        }

        // creating new ellipse from the updated values
        switch (handle) {
            case "top-left":
            case "top-right":
            case "bottom-left":
            case "bottom-right":
                this.startX = Math.min(fixedX, x);
                this.startY = Math.min(fixedY, y);
                width = Math.max(this.minWidth, Math.abs(x - fixedX));
                height = Math.max(this.minHeight, Math.abs(y - fixedY));
                this.radiusX = width / 2;
                this.radiusY = height / 2;
                break;

            case "top-center":
            case "bottom-center":
                height = Math.max(this.minHeight, Math.abs(y - fixedY));
                this.radiusY = height / 2;
                this.startY = Math.min(fixedY, y);
                break;

            case "left-center":
            case "right-center":
                width = Math.max(this.minWidth, Math.abs(x - fixedX));
                this.radiusX = width / 2;
                this.startX = Math.min(fixedX, x);
                break;
        }
    }
}