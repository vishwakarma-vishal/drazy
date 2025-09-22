import { BaseShape } from "./BaseShape"

export class Rectangle extends BaseShape {
    startX: number;
    startY: number;
    width: number;
    height: number;

    constructor(startX: number, startY: number, width: number, height: number, color: string) {
        super(color);
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.startX, this.startY, this.width, this.height);

        // draw resize handlers only if selected
        if (this.selected) {
            this.getAllHandlers().forEach(h => {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });
        }
    }

    // check if the clicked is inside shape or not
    isPointerInside(x: number, y: number): boolean {
        return (x >= this.startX && x <= this.startX + this.width) &&
            (y >= this.startY && y <= this.startY + this.height);
    }

    // to move the shape
    move(dx: number, dy: number): void {
        this.startX += dx;
        this.startY += dy;
    }

    // get all handles positions
    getAllHandlers() {
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

    // check if point in on the move handle
    getHandleAt(x: number, y: number): string | null {
        return this.getAllHandlers().find(h => (Math.abs(x - h.x) <= 5) && (Math.abs(y - h.y) <= 5))?.name || null;
    }

    // to resize the shape
    resize(handle: string, x: number, y: number): void {
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

            // Edge-center handles: fixed edge opposite to moving edge
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

        // Compute new rectangle boundaries from fixed point and moving mouse
        this.startX = Math.min(fixedX, x);
        this.startY = Math.min(fixedY, y);
        this.width = Math.abs(x - fixedX);
        this.height = Math.abs(y - fixedY);
    }
}