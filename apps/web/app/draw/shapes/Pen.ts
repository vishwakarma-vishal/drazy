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

        if (this.selected) {
            this.getAllHandle().forEach(h => {
                ctx.beginPath();
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });
            const { minX, minY, maxX, maxY } = this.getBoundingBox();
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        }
    }

    // get the pointer status inside the imaginary rectangle box
    isPointerInside(x: number, y: number): boolean {
        const { minX, minY, maxX, maxY } = this.getBoundingBox();

        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    getBoundingBox() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        this.points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        return { minX, minY, maxX, maxY };
    }

    // get all handles positions
    getAllHandle() {
        const { minX, minY, maxX, maxY } = this.getBoundingBox();
        const startX = minX;
        const startY = minY;
        const width = maxX - minX;
        const height = maxY - minY;

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
        return this.getAllHandle().find(h => Math.abs(x - h.x) <= 5 && Math.abs(y - h.y) <= 5)?.name || null;
    }

    move(dx: number, dy: number): void {
        this.points = this.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    resize(handle: string, x: number, y: number): void {
        const { minX, minY, maxX, maxY } = this.getBoundingBox();

        let fixedX = minX;
        let fixedY = minY;
        let startX = maxX;
        let startY = maxY;

        switch (handle) {
            case "top-left":
                fixedX = maxX;
                fixedY = maxY;
                startX = minX;
                startY = minY;
                break;
            case "top-center":
                fixedX = (minX + maxX) / 2;
                fixedY = maxY;
                startX = fixedX;
                startY = minY;
                break;
            case "top-right":
                fixedX = minX;
                fixedY = maxY;
                startX = maxX;
                startY = minY;
                break;
            case "right-center":
                fixedX = minX;
                fixedY = (minY + maxY) / 2;
                startX = maxX;
                startY = fixedY;
                break;
            case "bottom-right":
                fixedX = minX;
                fixedY = minY;
                startX = maxX;
                startY = maxY;
                break;
            case "bottom-center":
                fixedX = (minX + maxX) / 2;
                fixedY = minY;
                startX = fixedX;
                startY = maxY;
                break;
            case "bottom-left":
                fixedX = maxX;
                fixedY = minY;
                startX = minX;
                startY = maxY;
                break;
            case "left-center":
                fixedX = maxX;
                fixedY = (minY + maxY) / 2;
                startX = minX;
                startY = fixedY;
                break;
            default:
                return;
        }

        let scaleX = 1;
        let scaleY = 1;

        // scaleX = new width / old width
        if (handle.includes("left") || handle.includes("right")) {
            scaleX = (x - fixedX) / (startX - fixedX || 1);
        }

        // scaleY = new height / old height
        if (handle.includes("top") || handle.includes("bottom")) {
            scaleY = (y - fixedY) / (startY - fixedY || 1);
        }

        // Scale all points relative to anchor
        this.points = this.points.map(p => ({
            x: fixedX + (p.x - fixedX) * scaleX,
            y: fixedY + (p.y - fixedY) * scaleY
        }));
    }
}