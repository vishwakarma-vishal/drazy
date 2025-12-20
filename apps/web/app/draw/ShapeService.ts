
import { BaseShape } from "./shapes/BaseShape";
import { Rectangle } from "./shapes/Rectangle";
import { Line } from "./shapes/Line";
import { Pen } from "./shapes/Pen";
import { Ellipse } from "./shapes/Ellipse";
import { Arrow } from "./shapes/Arrow";
import { TextShape } from "./shapes/TextShape";
import { devLogger } from "../utils/logger";

export const convertData = (initialData: any, ctx: CanvasRenderingContext2D) => {

    try {
        const data = initialData;

        let shapes: BaseShape[] = [];

        shapes = data.map((item: any) => {
            if (item.rectangle) {
                const prop = item.rectangle;
                return new Rectangle(prop.id, prop.tempId, "confirmed", prop.startX, prop.startY, prop.width, prop.height, prop.color);
            }
            else if (item.ellipse) {
                const prop = item.ellipse;
                return new Ellipse(prop.id, prop.tempId, "confirmed", prop.startX, prop.startY, prop.radiusX, prop.radiusY, prop.color);
            }
            else if (item.line) {
                const prop = item.line;
                return new Line(prop.id, prop.tempId, "confirmed", prop.startX, prop.startY, prop.endX, prop.endY, prop.color);
            }
            else if (item.arrow) {
                const prop = item.arrow;
                return new Arrow(prop.id, prop.tempId, "confirmed", prop.startX, prop.startY, prop.endX, prop.endY, prop.color);
            }
            // for pen (stroke)
            else if (item.stroke) {
                const prop = item.stroke;
                return new Pen(prop.id, prop.tempId, "confirmed", prop.points, prop.color);
            }
            else if (item.text) {
                const prop = item.text;
                return new TextShape(prop.id, prop.tempId, "confirmed", prop.startX, prop.startY, prop.text, prop.fontSize, prop.color, prop.maxWidth, ctx);
            }
            else {
                devLogger.warn("ShapeService", "convertData", "Unknown shape received, skipping item", item);
            }
        });

        return shapes;
    } catch (error) {
        devLogger.error("ShapeService", "convertData", "Something went wrong", error);
        return [];
    }
}
