import { state } from "./state";
import { WebSocket } from "ws";
import { checkRoomStatus } from "../services/dbService";

const joinRoom = async (userId: string, roomId: string) => {
    const isRoomExist = await checkRoomStatus(roomId);
    if (!isRoomExist) return { success: false, message: "Room not found" };

    const currUser = state.getUser(userId);
    if (!currUser) return;
    // add room to user
    currUser.rooms.add(roomId);

    // add user to room
    if (!state.rooms.has(roomId)) state.rooms.set(roomId, new Set());
    state.getRoom(roomId)?.add(userId);

    return { success: true };
}

const leaveRoom = (userId: string, roomId: string) => {
    const user = state.getUser(userId);
    if (!user) return;
    user.rooms.delete(roomId);

    const room = state.getRoom(roomId);
    room?.delete(userId);

    cleanupEmptyRoom(roomId);
}

const addUser = (userId: string, ws: WebSocket) => {
    state.users.set(userId, {
        userId,
        ws,
        rooms: new Set()
    });
}

const removeUser = (userId: string) => {
    const user = state.getUser(userId);
    if (!user) return;

    // remove from all rooms
    for (const roomId of user.rooms) {
        state.getRoom(roomId)?.delete(userId);

        cleanupEmptyRoom(roomId);
    }

    // delete user
    state.users.delete(userId);
}

const cleanupEmptyRoom = (roomId: string) => {
    if (state.getRoom(roomId)?.size === 0) {
        state.rooms.delete(roomId);
    }
}

export {
    joinRoom,
    leaveRoom,
    addUser,
    removeUser
}
