import { BaseShape } from "./BaseShape";


export class Pen extends BaseShape {
    points: { x: number, y: number }[];

    constructor(points: { x: number, y: number }[], color: string) {
        super(color);
        this.points = points;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const path = this.points;
        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }
}