import { WebSocket } from "ws";
import { state } from "../state/state";
import { removeFromDB, storeInDB } from "./dbService";
import { broadcastMessage } from "./wsService";
import { batchManager } from "./batchManager";
import { logger } from "../utils/logger";

const handleShape = (ws: WebSocket, parsedData: any) => {
    logger.info("appService", "handleShape", "Shape payload received:", parsedData);

    const { id, tempId, action, roomId, shape } = parsedData;

    if (action === "create") {
        // brodcast immediately
        broadcastMessage(ws, roomId, parsedData, false);

        // initialize pending ops for this tempId
        state.pendingShapeOps.set(tempId, { ops: [] });

        // async DB save
        saveInDBAndConfirm(ws, roomId, tempId, shape);
    }

    else if (action === "update") {
        // broadcast immediately
        broadcastMessage(ws, roomId, parsedData, false);

        const shapeId = id; // id only available for confirm shapes

        if (shapeId) {
            // shape is confirmed, we can update DB directly
            const type = shape?.type;
            if (!type) {
                logger.warn("appService", "handleShape", "Missing shape type for update, parsedData:", parsedData)
                return;
            }
            batchManager.enqueue(shapeId, type, shape);
        } else if (tempId && state.pendingShapeOps.has(tempId)) {
            // shape not confirmed, push into the pending ops
            const entry = state.pendingShapeOps.get(tempId);
            entry?.ops.push(parsedData.shape);
        } else {
            logger.warn("appService", "handleShape", "Update received from Unknown tempId:", tempId);
        }
    }

    else if (action === "delete") {
        // broadcast immediately
        broadcastMessage(ws, roomId, parsedData, false);

        const shapeId = id;

        if (shapeId) {
            const type = shape?.type;
            if (!type) {
                logger.warn("appService", "handleShape", "Missing shape type for delete, parsedData:", parsedData)
                return;
            }
            batchManager.dequeue(shapeId, type);
            removeFromDB(shapeId, shape);
        } else if (tempId && state.pendingShapeOps.has(tempId)) {
            // shape not confirmed, empty pending ops
            const entry = state.pendingShapeOps.get(tempId);
            if (entry) {
                entry.deleted = true;
                entry.ops = [];
            }
        } else {
            logger.warn("appService", "handleShape", "Delete received from Unknown tempId", tempId);
        }
    }
}

const saveInDBAndConfirm = async (ws: WebSocket, roomId: string, tempId: string, shapePayload: any) => {
    // store in db
    const id = await storeInDB(roomId, shapePayload, tempId);
    if (!id) {
        state.pendingShapeOps.delete(tempId);
        return;
    }

    // replay chached events (move, resize, delete)
    const shapeId = id;

    const pendingEntry = state.pendingShapeOps.get(tempId);

    // Before sending confirmation
    if (!pendingEntry || pendingEntry.deleted) {
        logger.info("appService", "saveAndConfirmShape", "Skipping confirm — shape deleted before confirm broadcast", { tempId });

        state.pendingShapeOps.delete(tempId);
        await removeFromDB(shapeId, shapePayload);
        return;
    }

    if (pendingEntry) {
        pendingEntry.id = shapeId;

        // updates to DB
        pendingEntry.ops.forEach(op => {
            const type = op?.type;

            if (!type) {
                logger.warn("appService", "saveInDBAndConfirm", "Missing shape type for pending shape, update op:", op);
                return;
            }

            batchManager.enqueue(shapeId, type, op)
        });

        // clear pending ops
        state.pendingShapeOps.delete(tempId);
    }

    // send confirmation message
    const payload = {
        type: "shape",
        action: "confirm",
        tempId: tempId,
        id: shapeId,
    }

    broadcastMessage(ws, roomId, payload, true);
}

export { handleShape, saveInDBAndConfirm };