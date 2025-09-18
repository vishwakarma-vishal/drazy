import { client } from "@repo/db";
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
    });
}

const joinRoom = async (ws: WebSocket, userId: string, roomId: string) => {
    // check is room is created or not
    const room = await client.room.findFirst({
        where: {
            id: roomId
        }
    });

    if (!room) {
        ws.send(JSON.stringify({
            success: false,
            message: "Room not found"
        }));
        return;
    };

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

const brodcastMessage = async (ws: WebSocket, roomId: string, message: any) => {
    const userIds = rooms.get(roomId);

    // store in db
    if (message.type === "RECTANGLE") {
        await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                rectangle: {
                    create: {
                        startX: message.startX,
                        startY: message.startY,
                        width: message.width,
                        height: message.height,
                        color: message.color,
                    }
                }
            }
        });
    } else if(message.type === "CIRCLE") {
        await client.chat.create({
            data: {
                roomId,
                shapeId: "12",
                circle: {
                    create: {
                        startX: message.startX,
                        startY: message.startY,
                        radius: message.radius,
                        color: message.color
                    }
                }
            }
        })
    } else if(message.type === "LINE") {
        await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                line: {
                    create: {
                        startX: message.startX,
                        startY: message.startY,
                        endX: message.endX,
                        endY: message.endY,
                        color: message.color
                    }
                }
            }
        });
    }

    userIds?.forEach((user) => {
        if (users.get(user)?.ws != ws) {
            users.get(user)?.ws.send(JSON.stringify(message));
        }
    })
}

// helper functions (use to debug)
const printUser = () => {
    console.log("Current user -> ")
    users.forEach((user) => console.log(user));
}

const printRoom = () => {
    console.log("Current room -> ");
    rooms.forEach((room) => console.log(room));
}

export { addUser, joinRoom, leaveRoom, deleteUser, brodcastMessage };