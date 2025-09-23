import { BaseShape } from "./BaseShape";

export class Line extends BaseShape {
    startX: number;
    startY: number;
    endX: number;
    endY: number;

    constructor(startX: number, startY: number, endX: number, endY: number, color: string) {
        super(color);
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        if (this.selected) {
            this.getAllHandle().forEach(h => {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });
        }
    }

    isPointerInside(x: number, y: number): boolean {
        const padding = 5; 
        const minX = Math.min(this.startX, this.endX) - padding;
        const maxX = Math.max(this.startX, this.endX) + padding;
        const minY = Math.min(this.startY, this.endY) - padding;
        const maxY = Math.max(this.startY, this.endY) + padding;

        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    getAllHandle() {
        const { startX, startY, endX, endY } = this;

        return [
            { name: "start", x: startX, y: startY },
            { name: "end", x: endX, y: endY }
        ]
    }

    getHandleAt(x: number, y: number): string | null {

        return this.getAllHandle().find(h => Math.abs(x - h.x) <= 5 && Math.abs(y - h.y) <= 5)?.name || null;
    }

    move(dx: number, dy: number): void {
        this.startX = this.startX + dx;
        this.startY = this.startY + dy;
        this.endX = this.endX + dx;
        this.endY = this.endY + dy;
    }

    resize(handle: string, x: number, y: number): void {

        if (handle === "start") {
            this.startX = x;
            this.startY = y;
        } else if (handle === "end") {
            this.endX = x;
            this.endY = y;
        }
    }
}