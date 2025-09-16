import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { addUser, brodcastMessage, deleteUser, joinRoom, leaveRoom } from "./state";
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

        if (parsedData.type === "chat") {
            brodcastMessage(ws, parsedData.roomId, parsedData.message)
        }

        if (parsedData.type === "leave") {
            leaveRoom(userId, parsedData.roomId)
        }
    });

    ws.on("close", () => {
        deleteUser(userId);
    })
});

