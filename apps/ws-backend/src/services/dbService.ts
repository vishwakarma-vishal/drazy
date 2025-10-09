import { client } from "@repo/db";

const checkRoomStatus = async (roomId: string): Promise<boolean> => {
    try {
        const room = await client.room.findFirst({
            where: {
                id: roomId
            }
        });

        if (room) return true;
        return false;
    } catch (error) {
        console.log("Error while checking for room status, error:", error);
        return false;
    }
}

const storeInDB = async (roomId: string, shapePayload: any): Promise<string | null> => {
    let tableName: string = "";
    let data;

    const { type, startX, startY, width, height, radiusX, radiusY, endX, endY, points, text, fontSize, maxWidth, color } = shapePayload;
    switch (type) {
        case "RECTANGLE":
            tableName = "rectangle";
            data = { startX, startY, width, height, color }
            break;
        case "ELLIPSE":
            tableName = "ellipse";
            data = { startX, startY, radiusX, radiusY, color };
            break;
        case "LINE":
            tableName = "line";
            data = { startX, startY, endX, endY, color };
            break;
        case "ARROW":
            tableName = "arrow";
            data = { startX, startY, endX, endY, color };
            break;
        case "PEN":
            tableName = "stroke";
            data = {
                points: JSON.stringify(points),
                color
            }
            break;
        case "TEXT":
            tableName = "text";
            data = {
                startX, startY, text, fontSize, maxWidth, color
            }
            break;
        default:
            console.warn("Unknown shape type received, shape:", shapePayload);
            break;
    }

    if (!tableName || !data) return null;

    // save to DB
    let response = null;
    try {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: tableName, // discriminator
                [tableName]: {
                    create: data
                }
            },
            include: {
                [tableName]: true
            }
        });

        return response.id;
    } catch (error) {
        console.log("Error while storing in the DB, error:", error);
        return null;
    }
}

export { checkRoomStatus, storeInDB };

