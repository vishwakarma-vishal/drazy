import { BaseShape } from "./BaseShape";

export class Arrow extends BaseShape {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    // constraints
    minLength: number = 23;

    constructor(id: string = "", tempId: string, status: string, startX: number, startY: number, endX: number, endY: number, color: string) {
        super(color, id, tempId, status);
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
                ctx.strokeStyle = "black";
                ctx.fillStyle = h.name === "delete" ? "red" : "white";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });
        }

        // skip drawing head if both x and y are on the same spot
        if (this.startX === this.endX && this.startY === this.endY) return;
        this.drawHead(ctx);
    }

    // arrow head
    drawHead(ctx: CanvasRenderingContext2D): void {
        // angle of line with respect to x axis
        const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
        const headLength = 10; // length of arrow left/right line
        const headAngle = Math.PI / 6; // 30 degree

        // left/right line angle with respect to x
        const leftAngle = angle - headAngle;
        const rightAngle = angle + headAngle;

        // find start point of both left and right line
        const leftX = this.endX - headLength * Math.cos(leftAngle);
        const leftY = this.endY - headLength * Math.sin(leftAngle);
        const rightX = this.endX - headLength * Math.cos(rightAngle);
        const rightY = this.endY - headLength * Math.sin(rightAngle);

        // draw the head
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(this.endX, this.endY);
        ctx.moveTo(rightX, rightY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
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

        let deleteX, deleteY;
        const offset = 10;

        // to get the top-right delete handle cordinates
        if (endX > startX || (endX === startX && endY < startY)) {
            // end point is the right/top one
            deleteX = endX + offset;
            deleteY = endY - offset;
        } else {
            deleteX = startX + offset;
            deleteY = startY - offset;
        }

        return [
            { name: "start", x: startX, y: startY },
            { name: "end", x: endX, y: endY },
            { name: "delete", x: deleteX, y: deleteY }
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
        const dx = (handle === "start" ? this.endX - x : x - this.startX);
        const dy = (handle === "start" ? this.endY - y : y - this.startY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.minLength) return;

        if (handle === "start") {
            this.startX = x;
            this.startY = y;
        } else if (handle === "end") {
            this.endX = x;
            this.endY = y;
        }
    }
}