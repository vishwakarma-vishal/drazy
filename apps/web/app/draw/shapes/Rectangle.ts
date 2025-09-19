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
    }
}