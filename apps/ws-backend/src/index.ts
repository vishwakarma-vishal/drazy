import { WebSocketServer } from "ws";
import { validateUser } from "./utils/validate.js";
import { addUser, joinRoom, leaveRoom, removeUser } from "./state/manage.js";
import { handleIntialData, handleShape } from "./services/appService.js";

import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
    override: process.env.NODE_ENV !== "production"
});

const WS_PORT = process.env.WS_PORT;

if (!WS_PORT) {
    throw new Error("WS_PORT is not defined in .env");
}

const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on("listening", () => {
    console.log("WS server is running on port:", WS_PORT);
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

    // manage messages
    ws.on("message", (data) => {
        const parsedData = JSON.parse(data.toString());

        if (parsedData.type === "join") {
            const response = joinRoom(userId, parsedData.roomId);
            ws.send(JSON.stringify(response));
            handleIntialData(ws, parsedData.roomId);
        }

        else if (parsedData.type === "leave") {
            leaveRoom(userId, parsedData.roomId)
        }

        else if (parsedData.type === "shape") {
            handleShape(ws, parsedData);
        }
    });

    ws.on("close", () => {
        removeUser(userId);
    })
});

