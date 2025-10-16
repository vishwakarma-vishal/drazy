import { JwtPayload, decode } from "jsonwebtoken";
import { BaseShape } from "./shapes/BaseShape";
import { Rectangle } from "./shapes/Rectangle";
import { Ellipse } from "./shapes/Ellipse";
import { Line } from "./shapes/Line";
import { Arrow } from "./shapes/Arrow";
import { Pen } from "./shapes/Pen";
import { TextShape } from "./shapes/TextShape";
import { devLogger } from "../utils/logger";

interface myJsonPayload extends JwtPayload {
    id: string
}

let shapeCounter = 0;
let lastTimestamp = 0;

export function generateTempId(): string | null {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const decodedToken: myJsonPayload = decode(token) as myJsonPayload;
        const clientId = decodedToken.id;

        // reseting the count every milisecond rare but did it for the cleaner tempId 
        // (rare sinario but future prof if we ever allowed bot/script to create shapes on user behalf)
        const currTimeStamp = Date.now();
        if (currTimeStamp !== lastTimestamp) {
            shapeCounter = 0;
            lastTimestamp = currTimeStamp;
        } else {
            shapeCounter += 1;
        }

        return `${clientId}-${currTimeStamp}-${shapeCounter}`;
    } catch (error) {
        devLogger.error("Helper", "generateTempId", "Error while generating the tempId", error);
        return null;
    }
}

export function confirmStatusAndUpdateId(shapes: BaseShape[], payload: any): boolean {
    try {
        const { id, tempId } = payload;

        const found: BaseShape | undefined = shapes.find(
            s => String(s.getTempId()) === String(tempId)
        );

        const shape = found ?? null;

        if (!shape) return false;

        shape.setId(id);
        shape.setStatus("confirmed");
        // devLogger.info("Helper", "confirmStatusAndUpdateId", "After confirmation shape snapshot", JSON.parse(JSON.stringify(shape)));

        return true;
    } catch (error) {
        devLogger.error("Helper", "confirmStatusAndUpdateId", "Error while confirming the status and id", error);
        return false;
    }
}

export function updateShapeWithId(shapes: BaseShape[], payload: any) {
    devLogger.info("Helper", "updateShapeWithId", "Received payload", payload);

    const { id, tempId } = payload;
    const { startX, startY, width, height, radiusX, radiusY, endX, endY, points, text, fontSize, maxWidth, fontFamily, color } = payload.shape;

    // check id first then the tempId
    const found: BaseShape | undefined = shapes.find(
        s => ((String(s.getId()) === String(id)) || (tempId && String(s.getTempId()) === String(tempId)))
    );

    devLogger.info("Helper", "updateShapeWithId", "Matching shape with id/tempId", found);

    const shape = found ?? null;

    if (!shape) return;

    if (!shape.getId() && id) {
        shape.setId(id);
    }

    if (shape instanceof Rectangle) {
        shape.startX = startX;
        shape.startY = startY;
        shape.width = width;
        shape.height = height;
    }

    else if (shape instanceof Ellipse) {
        shape.startX = startX;
        shape.startY = startY;
        shape.radiusX = radiusX;
        shape.radiusY = radiusY;
    }

    else if (shape instanceof Line) {
        shape.startX = startX;
        shape.startY = startY;
        shape.endX = endX;
        shape.endY = endY;
    }

    else if (shape instanceof Arrow) {
        shape.startX = startX;
        shape.startY = startY;
        shape.endX = endX;
        shape.endY = endY;
    }

    else if (shape instanceof Pen) {
        shape.points = points;
    }

    else if (shape instanceof TextShape) {
        shape.startX = startX;
        shape.startY = startY;
        shape.text = text;
        shape.fontSize = fontSize;
        shape.maxWidth = maxWidth;
        if (fontFamily) shape.fontFamily = fontFamily;
    }

    shape.setColor(color);
}

