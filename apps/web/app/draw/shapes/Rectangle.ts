import { BaseShape } from "./BaseShape"

export class Rectangle extends BaseShape {
    // properties
    startX: number;
    startY: number;
    width: number;
    height: number;
    //constraints
    minWidth: number = 40;
    minHeight: number = 20;

    constructor(id: string = "", tempId: string, status: string, startX: number, startY: number, width: number, height: number, color: string) {
        super(color, id, tempId, status);
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.startX, this.startY, this.width, this.height);

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
        return (x >= this.startX && x <= this.startX + this.width) &&
            (y >= this.startY && y <= this.startY + this.height);
    }

    move(dx: number, dy: number): void {
        this.startX += dx;
        this.startY += dy;
    }

    getAllHandle() {
        const { startX, startY, width, height } = this;

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
        const MIN_WIDTH = this.minWidth;
        const MIN_HEIGHT = this.minHeight;

        let fixedX: number, fixedY: number;

        switch (handle) {
            case "top-left":
                fixedX = this.startX + this.width;
                fixedY = this.startY + this.height;
                break;
            case "top-right":
                fixedX = this.startX;
                fixedY = this.startY + this.height;
                break;
            case "bottom-left":
                fixedX = this.startX + this.width;
                fixedY = this.startY;
                break;
            case "bottom-right":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "top-center":
                fixedX = this.startX;
                fixedY = this.startY + this.height;
                break;
            case "right-center":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "bottom-center":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "left-center":
                fixedX = this.startX + this.width;
                fixedY = this.startY;
                break;
            default:
                return;
        }

        // creating new rectangle from the updated values
        switch (handle) {
            case "top-left":
            case "top-right":
            case "bottom-left":
            case "bottom-right":
                this.startX = Math.min(fixedX, x);
                this.startY = Math.min(fixedY, y);
                this.width = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                this.height = Math.max(MIN_HEIGHT, Math.abs(y - fixedY));
                break;

            case "top-center":
            case "bottom-center":
                this.startY = Math.min(fixedY, y);
                this.height = Math.max(MIN_HEIGHT, Math.abs(y - fixedY));
                break;

            case "left-center":
            case "right-center":
                this.startX = Math.min(fixedX, x);
                this.width = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;
        }

    }
}