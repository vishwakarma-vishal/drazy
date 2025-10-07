import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { addUser, brodcastMessage, deleteUser, joinRoom, leaveRoom, pendingShapeOps, saveInDBAndConfirm, updateInDB } from "./state";
import { validateUser } from "./utils";

const WS_PORT = process.env.WS_PORT;
const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on("listening", () => {
    console.log("ws server is running on port -> ", WS_PORT);
});

wss.on("connection", (ws, request) => {
    ws.on("error", console.error);

    // only authorized user can join the ws server
    const userId = validateUser(request);
    if (!userId) {
        ws.close(4002, "Invalid or expired token");
        return;
    }

    // join server (add in state)
    addUser(userId, ws);

    ws.on("message", (data) => {
        const parsedData = JSON.parse(data.toString());

        // console.log("parsed ", parsedData);

        if (parsedData.type === "join") {
            joinRoom(ws, userId, parsedData.roomId);
        }

        if (parsedData.type === "shape") {

            if (parsedData.action === "create") {
                // brodcast immediately
                brodcastMessage(ws, parsedData.roomId, parsedData);

                // initialize pending ops for this tempId
                pendingShapeOps.set(parsedData.shape.tempId, { ops: [] });

                // async DB save
                saveInDBAndConfirm(ws, parsedData.roomId, parsedData.shape);
            }

            if (parsedData.action === "update") {
                // broadcast immediately
                brodcastMessage(ws, parsedData.roomId, parsedData);

                const shapeId = parsedData.id;
                const tempId = parsedData.tempId;

                if (shapeId) {
                    // shape is confirmed, we can update DB directly
                    updateInDB(shapeId, parsedData.updates);
                } else if (tempId && pendingShapeOps.has(tempId)) {
                    // shape not confirmed, push into the pending ops
                    const entry = pendingShapeOps.get(tempId);
                    entry?.ops.push(parsedData);
                } else {
                    console.log("Update received from Unknown tempId", tempId);
                }
            }
        }

        if (parsedData.type === "leave") {
            leaveRoom(userId, parsedData.roomId)
        }
    });

    ws.on("close", () => {
        deleteUser(userId);
    })
});

