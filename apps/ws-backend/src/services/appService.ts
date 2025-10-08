import { WebSocket } from "ws";
import { state } from "../state/state";
import { storeInDB } from "./dbService";
import { broadcastMessage } from "./wsService";
import { batchManager } from "./batchManager";

const handleShape = (ws: WebSocket, parsedData: any) => {
    const { action, roomId } = parsedData;

    if (action === "create") {
        // brodcast immediately
        broadcastMessage(ws, roomId, parsedData, false);

        // initialize pending ops for this tempId
        state.pendingShapeOps.set(parsedData.shape.tempId, { ops: [] });

        // async DB save
        saveInDBAndConfirm(ws, roomId, parsedData.shape);
    }

    else if (action === "update") {
        // broadcast immediately
        broadcastMessage(ws, roomId, parsedData, false);

        const shapeId = parsedData.id;
        const tempId = parsedData.tempId;

        if (shapeId) {
            // shape is confirmed, we can update DB directly
            const type = parsedData.updates?.type;
            if (!type) {
                console.warn("Missing shape type for update:", parsedData);
                return;
            }
            batchManager.enqueue(shapeId, type, parsedData.updates);
        } else if (tempId && state.pendingShapeOps.has(tempId)) {
            // shape not confirmed, push into the pending ops
            const entry = state.pendingShapeOps.get(tempId);
            entry?.ops.push(parsedData);
        } else {
            console.log("Update received from Unknown tempId", tempId);
        }
    }
}

const saveInDBAndConfirm = async (ws: WebSocket, roomId: string, shape: any) => {
    // store in db
    const response = await storeInDB(roomId, shape);
    if (!response) return;

    // replay chached events (move, resize, delete)
    const shapeId = response.id;

    const pendingEntry = state.pendingShapeOps.get(shape.tempId);

    if (pendingEntry) {
        pendingEntry.id = shapeId;

        // updates to DB
        pendingEntry.ops.forEach(op => {
            const type = op.updates?.type;

            if (!type) {
                console.log("Missing shape type for pending shape update: ", op);
                return;
            }

            batchManager.enqueue(shapeId, type, op.updates)
        });

        // clear pending ops
        state.pendingShapeOps.delete(shape.tempId);
    }

    // send confirmation message
    const payload = {
        type: "shape",
        action: "confirm",
        tempId: shape.tempId,
        id: shapeId,
    }

    broadcastMessage(ws, roomId, payload, true);
}

export { handleShape, saveInDBAndConfirm };