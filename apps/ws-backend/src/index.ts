import { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import jwt, { JwtPayload } from "jsonwebtoken";
import { addUser, brodcastMessage, joinRoom } from "./state";

const WS_PORT = process.env.WS_PORT;
const wss = new WebSocketServer({ port: Number(WS_PORT) });

wss.on("listening", () => {
    console.log("ws server is running...");
});

wss.on("connection", (ws, request) => {
    ws.on("error", console.error);

    // only authorized user can join the ws server
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
        ws.close(4001, "Missing token");
        return;
    }

    const userId = validateUser(token);
    if (!userId) {
        ws.close(4002, "Invalid or expired token");
        return;
    }

    // join web socket server (add in state)
    addUser(userId, ws);

    ws.on("message", (data) => {
        const parsedData = JSON.parse(data.toString());
        
        console.log("parsed ", parsedData);

        if (parsedData.type === "join") {
            joinRoom(userId, parsedData.roomId);
        }

        if (parsedData.type === "chat") {
            brodcastMessage(parsedData.roomId, parsedData.message)
        }
    })
});

interface MyJwtToken extends JwtPayload {
  data?: {
    id: string;
  };
}

const validateUser = (token: string) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

        const decode = jwt.verify(token, JWT_SECRET) as MyJwtToken;
        return decode.data?.id;
    } catch(error) {
        console.log("Jwt vefification failed with error ->", error);
        return null;
    }
}