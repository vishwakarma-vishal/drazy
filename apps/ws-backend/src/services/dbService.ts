import { client } from "@repo/db";
import { logger } from "../utils/logger";
import { state } from "../state/state";

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
        logger.error("dbService", "checkRoomStatus", "Error while checking for room status, error:", error)
        return false;
    }
}

const storeInDB = async (roomId: string, shapePayload: any, tempId: string): Promise<string | null> => {
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
            logger.warn("dbService", "storeInDB", "Unknown shape type received, shape:", shapePayload)
            break;
    }

    if (!tableName || !data) return null;

    try {
        // before save - deletion arrived (if yes abort)
        const entry = tempId ? state.pendingShapeOps.get(tempId) : null;

        if (!entry || entry.deleted) {
            logger.info("dbService", "storeInDB", `Skipping create — shape already deleted before save`, { tempId });
            return null;
        }

        // store in the DB
        const created = await client.chat.create({
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

        // after save - deletion arrive mid-insert (remove)
        const latest = tempId ? state.pendingShapeOps.get(tempId) : null;

        if (!latest || latest.deleted) {
            logger.info("dbService", "storeInDB", `Rolling back create — shape deleted while saving`, { tempId });
            await removeFromDB(created.id);
            state.pendingShapeOps.delete(tempId);
            return null;
        }

        return created.id;
    } catch (error) {
        logger.error("dbService", "storeInDB", "Error while storing in the DB, error:", error)
        return null;
    }
}

const removeFromDB = async (id: string): Promise<boolean> => {
    try {
        await client.chat.delete({ where: { id } });

        return true;
    } catch (error) {
        logger.error("dbService", "removeFromDB", "Error while deleting from the DB, error:", error)
        return false;
    }
}

export { checkRoomStatus, storeInDB, removeFromDB };

