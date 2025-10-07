import { JwtPayload, decode } from "jsonwebtoken";
import { BaseShape } from "./shapes/BaseShape";
import { Rectangle } from "./shapes/Rectangle";

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
        console.error("Error while generating the tempId", error);
        return null;
    }
}

export function confirmStatusAndUpdateId(shapes: BaseShape[], payload: any): boolean {
    try {
        const { id, tempId } = payload;

        const found: Rectangle | undefined = shapes.find(
            s => (s instanceof Rectangle) && String(s.tempId) === String(tempId)
        ) as Rectangle | undefined;

        const shape = found ?? null;

        if (!shape) return false;

        shape.status = "confirmed";
        shape.id = id;
        // console.log("After confirmation shape snapshot ->", JSON.parse(JSON.stringify(shape)));

        return true;
    } catch (error) {
        console.log("Error while confirming the status, ", error);
        return false;
    }
}

export function updateShapeWithId(shapes: BaseShape[], payload: any) {
    const {id, tempId} = payload;
    const { startX, startY, width, height, color } = payload.updates;

    // check id first then the tempId
    const found: Rectangle | undefined = shapes.find(
        s => (s instanceof Rectangle) && (String(s.id) === String(id) || (tempId && String(s.tempId) === String(tempId))) 
    ) as Rectangle | undefined;

    const shape = found ?? null;

    if (!shape) return;

    if (!shape.id && id) {
        shape.id = id;
    }

    // shape.status = status;
    shape.startX = startX;
    shape.startY = startY;
    shape.width = width;
    shape.height = height;
    shape.setColor(color);
}

