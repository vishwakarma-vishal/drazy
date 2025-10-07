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

// for real time broadcasting with persistance DB
// tempId → { id?: string, ops: any[] }
export const pendingShapeOps = new Map<string, { id?: string, ops: any[] }>();


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

const brodcastMessage = async (ws: WebSocket, roomId: string, payload: any) => {
    const userIds = rooms.get(roomId);

    userIds?.forEach((user) => {
        if (users.get(user)?.ws != ws) {
            users.get(user)?.ws.send(JSON.stringify(payload));
        }
    })
}

const saveInDBAndConfirm = async (ws: WebSocket, roomId: string, shape: any) => {
    // store in db
    let response;

    if (shape.type === "RECTANGLE") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "rectangle", // discriminator
                rectangle: {
                    create: {
                        startX: shape.startX,
                        startY: shape.startY,
                        width: shape.width,
                        height: shape.height,
                        color: shape.color,
                    }
                }
            },
            include: {
                rectangle: true,
            }
        });
    } else if (shape.type === "ELLIPSE") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "12",
                ellipse: {
                    create: {
                        startX: shape.startX,
                        startY: shape.startY,
                        radiusX: shape.radiusX,
                        radiusY: shape.radiusY,
                        color: shape.color
                    }
                }
            }
        })
    } else if (shape.type === "LINE") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                line: {
                    create: {
                        startX: shape.startX,
                        startY: shape.startY,
                        endX: shape.endX,
                        endY: shape.endY,
                        color: shape.color
                    }
                }
            }
        });
    } else if (shape.type === "ARROW") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                arrow: {
                    create: {
                        startX: shape.startX,
                        startY: shape.startY,
                        endX: shape.endX,
                        endY: shape.endY,
                        color: shape.color
                    }
                }
            }
        });
    } else if (shape.type === "PEN") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                stroke: {
                    create: {
                        points: JSON.stringify(shape.points),
                        color: shape.color
                    }
                }
            }
        })
    } else if (shape.type === "TEXT") {
        response = await client.chat.create({
            data: {
                roomId,
                shapeId: "123",
                text: {
                    create: {
                        startX: shape.startX,
                        startY: shape.startY,
                        text: shape.text,
                        fontSize: shape.fontSize,
                        maxWidth: shape.maxWidth,
                        color: shape.color
                    }
                }
            }
        });
    }

    if (!response) return;

    // send confirmation
    const userIds = rooms.get(roomId);

    console.log("response ->", response);

    const shapeId = response.id;

    const payload = {
        type: "shape",
        action: "confirm",
        tempId: shape.tempId,
        id: shapeId,
    }

    // replay the cached events
    const pendingEntry = pendingShapeOps.get(shape.tempId);

    if (pendingEntry) {
        pendingEntry.id = shapeId;

        // replay any chached updates to DB
        pendingEntry.ops.forEach(op => {
            updateInDB(shapeId, op.updates);
        });

        // clear pending ops
        pendingShapeOps.delete(shape.tempId);
    }

    userIds?.forEach((user) => {
        if (users.get(user)?.ws) {
            users.get(user)?.ws.send(JSON.stringify(payload));
        }
    });
}

const updateInDB = async (id: string, updates: any) => {
    console.log("id, updates", id, updates);
    if (updates.type === "RECTANGLE") {
        await client.rectangle.update({
            where: {
                id: String(id),
            },
            data:
            {
                startX: updates.startX,
                startY: updates.startY,
                width: updates.width,
                height: updates.height,
                color: updates.color,

            }
        });
    }
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

export { addUser, joinRoom, leaveRoom, deleteUser, brodcastMessage, saveInDBAndConfirm, updateInDB };