import { ShapeTypes } from "../constant";
import { Arrow } from "./shapes/Arrow";
import { BaseShape } from "./shapes/BaseShape";
import { Ellipse } from "./shapes/Ellipse";
import { Line } from "./shapes/Line";
import { Pen } from "./shapes/Pen";
import { Rectangle } from "./shapes/Rectangle";
import { TextShape } from "./shapes/TextShape";

export class ShapeFactory {
    ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    createShapeFromPayload(payload: any): BaseShape | null {

        switch (payload.type) {
            case ShapeTypes.RECTANGLE:
                return new Rectangle(payload.startX, payload.startY, payload.width, payload.height, payload.color);
            case ShapeTypes.ELLIPSE:
                return new Ellipse(payload.startX, payload.startY, payload.radiusX, payload.radiusY, payload.color);
            case ShapeTypes.LINE:
                return new Line(payload.startX, payload.startY, payload.endX, payload.endY, payload.color);
            case ShapeTypes.ARROW:
                return new Arrow(payload.startX, payload.startY, payload.endX, payload.endY, payload.color);
            case ShapeTypes.PEN:
                return new Pen(payload.points, payload.color);
            case ShapeTypes.TEXT:
                return new TextShape(payload.startX, payload.startY, payload.text, payload.fontSize, payload.color, payload.maxWidth, this.ctx);
            default:
                console.log("Unknown shape received from websocket, shape:", payload);
        }

        return null;
    }

    rectanglePreview(startX: number, startY: number, width: number, height: number, color: string) {
        this.ctx.strokeRect(startX, startY, width, height);
    }

    ellipsePreview(centerX: number, centerY: number, radiusX: number, radiusY: number, color: string) {
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    linePreview(startX: number, startY: number, endX: number, endY: number, color: string) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    penPreview(endX: number, endY: number, color: string) {
        this.ctx.lineTo(endX, endY);
        this.ctx.lineCap = "butt";
        this.ctx.stroke();
    }

    arrowPreview(startX: number, startY: number, endX: number, endY: number, color: string) {

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // drawing the arrow head
        const angle = Math.atan2(endY - startY, endX - startX);
        const headLength = 10; // length of arrow left/right line
        const headAngle = Math.PI / 6; // 30 degree

        //
        const leftAngle = angle - headAngle;
        const rightAngle = angle + headAngle;
        const leftX = endX - headLength * Math.cos(leftAngle);
        const leftY = endY - headLength * Math.sin(leftAngle);
        const rightX = endX - headLength * Math.cos(rightAngle);
        const rightY = endY - headLength * Math.sin(rightAngle);

        // draw the head
        this.ctx.beginPath();
        this.ctx.moveTo(leftX, leftY);
        this.ctx.lineTo(endX, endY);
        this.ctx.moveTo(rightX, rightY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    textInputBoxPreview(startX: number, startY: number, width: number, height: number, color: string) {
        this.ctx.strokeRect(startX, startY, width, height);
    }
}

