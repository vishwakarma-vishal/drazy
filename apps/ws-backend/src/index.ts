import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const WS_PORT = process.env.WS_PORT;

const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on("listening", () => {
    console.log("ws server is running...");
});

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
        ws.send("pong");
    })
});