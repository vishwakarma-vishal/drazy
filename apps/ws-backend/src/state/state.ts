import { WebSocket } from "ws";

interface UserI {
    userId: string;
    ws: WebSocket;
    rooms: Set<string>;
}

interface pendingShapeI {
    id?: string;
    ops: { updates?: {} }[];
}

// userId → UserI
const users: Map<string, UserI> = new Map();
// roomId → Set<userId>
const rooms: Map<string, Set<string>> = new Map();

// for real time broadcasting with persistance DB
// tempId → { id?: string, ops: any[] }
const pendingShapeOps = new Map<string, pendingShapeI>();

// getter & normal functions to access the current state value
export const state = {
    get users() { return users; },
    get rooms() { return rooms; },
    get pendingShapeOps() { return pendingShapeOps; },

    getUser(userId: string) { return users.get(userId) },
    getRoom(roomId: string) { return rooms.get(roomId) },
}