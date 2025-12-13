import { ShapeTypes } from "../constants/common";
import { devLogger } from "../utils/logger";
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
        devLogger.info("ShapeFactory", "createShapeFromPayload", "payload received", payload);
        const { id, tempId, shape } = payload;

        switch (shape.type) {
            case ShapeTypes.RECTANGLE:
                return new Rectangle(id, tempId, "pending", shape.startX, shape.startY, shape.width, shape.height, shape.color);
            case ShapeTypes.ELLIPSE:
                return new Ellipse(id, tempId, "pending", shape.startX, shape.startY, shape.radiusX, shape.radiusY, shape.color);
            case ShapeTypes.LINE:
                return new Line(id, tempId, "pending", shape.startX, shape.startY, shape.endX, shape.endY, shape.color);
            case ShapeTypes.ARROW:
                return new Arrow(id, tempId, "pending", shape.startX, shape.startY, shape.endX, shape.endY, shape.color);
            case ShapeTypes.PEN:
                return new Pen(id, tempId, "pending", shape.points, shape.color);
            case ShapeTypes.TEXT:
                return new TextShape(id, tempId, "pending", shape.startX, shape.startY, shape.text, shape.fontSize, shape.color, shape.maxWidth, this.ctx);
            default:
                devLogger.warn("ShapeFactory", "createShapeFromPayload", "Unknown shape received from websocket, shape payload", payload);
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

