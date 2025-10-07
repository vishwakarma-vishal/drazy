import { WebSocket } from "ws";
import { state } from "../state/state";

const broadcastMessage = (ws: WebSocket, roomId: string, payload: any, toAll: boolean) => {
    const userIds = state.getRoom(roomId);

    userIds?.forEach((userId) => {
        const user = state.getUser(userId);
        if (!user) return;

        if ((toAll && user.ws === ws) || (!toAll && user.ws !== ws)) {
            try {
                user.ws.send(JSON.stringify(payload));
            } catch (error) {
                console.log(`Failed to send message to ${userId}`, error);
            }
        }
    });
}

export { broadcastMessage };