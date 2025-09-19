import { BaseShape } from "./BaseShape"

export class Circle extends BaseShape {
    startX: number;
    startY: number;
    radius: number;

    constructor(startX: number, startY: number, radius: number, color: string) {
        super(color);
        this.startX = startX;
        this.startY = startY;
        this.radius = radius;
    } 

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}