import { WebSocket } from "ws";

// state managment
interface UserI {
    userId: string,
    ws: WebSocket,
    rooms: Set<string>
}

// userId → UserI
const users = new Map<string, UserI>();
// roomId → Set<userId>
const rooms = new Map<string, Set<string>>();

const addUser = (userId: string, ws: WebSocket) => {
    users.set(userId, {
        userId,
        ws,
        rooms: new Set()
    })
}

const joinRoom = (userId: string, roomId: string) => {
    const currUser = users.get(userId);
    if (!currUser) return;
    // add room to user
    currUser.rooms.add(roomId);

    // add user to room
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId)?.add(userId);
}

const leaveRoom = (userId: string, roomId: string) => {
    const user = users.get(userId);
    if (!user) return;
    user.rooms.delete(roomId);

    const room = rooms.get(roomId);
    room?.delete(userId);

    // clean empty room
    if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId);
    }
}

const deleteUser = (userId: string) => {
    const user = users.get(userId);
    if (!user) return;

    // remove from all rooms
    for (const roomId of user.rooms) {
        rooms.get(roomId)?.delete(userId);

        if (rooms.get(roomId)?.size === 0) {
            rooms.delete(roomId);
        }
    }

    // delete user
    users.delete(userId);
}

const brodcastMessage = (ws: WebSocket, roomId: string, message: string) => {
    const userIds = rooms.get(roomId);

    userIds?.forEach((user) => {
        if (users.get(user)?.ws != ws) {
            users.get(user)?.ws.send(message);
        }
    })
}

export { addUser, joinRoom, leaveRoom, deleteUser, brodcastMessage };