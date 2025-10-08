import { client } from "@repo/db";
import { batchManager } from "./batchManager";

const checkRoomStatus = async (roomId: string): Promise<boolean> => {
    try {
        const room = await client.room.findFirst({
            where: {
                id: roomId
            }
        });

        if (room) return true;
        return false;
    } catch (error) {
        console.log("Error while checking for room status, error:", error);
        return false;
    }
}

const storeInDB = async (roomId: string, shape: any) => {
    let response = null;

    try {
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
                    shapeId: "ellipse",
                    ellipse: {
                        create: {
                            startX: shape.startX,
                            startY: shape.startY,
                            radiusX: shape.radiusX,
                            radiusY: shape.radiusY,
                            color: shape.color
                        }
                    }
                },
                include: {
                    ellipse: true,
                }
            })
        } else if (shape.type === "LINE") {
            response = await client.chat.create({
                data: {
                    roomId,
                    shapeId: "line",
                    line: {
                        create: {
                            startX: shape.startX,
                            startY: shape.startY,
                            endX: shape.endX,
                            endY: shape.endY,
                            color: shape.color
                        }
                    }
                },
                include: {
                    line: true,
                }
            });
        } else if (shape.type === "ARROW") {
            response = await client.chat.create({
                data: {
                    roomId,
                    shapeId: "arrow",
                    arrow: {
                        create: {
                            startX: shape.startX,
                            startY: shape.startY,
                            endX: shape.endX,
                            endY: shape.endY,
                            color: shape.color
                        }
                    }
                },
                include: {
                    arrow: true,
                }
            });
        } else if (shape.type === "PEN") {
            response = await client.chat.create({
                data: {
                    roomId,
                    shapeId: "stroke",
                    stroke: {
                        create: {
                            points: JSON.stringify(shape.points),
                            color: shape.color
                        }
                    }
                },
                include: {
                    stroke: true,
                }
            })
        } else if (shape.type === "TEXT") {
            response = await client.chat.create({
                data: {
                    roomId,
                    shapeId: "text",
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
                },
                include: {
                    text: true,
                }
            });
        }
    } catch (error) {
        console.log("Error while storing in the DB, error:", error);
    }

    return response;
}

export { checkRoomStatus, storeInDB };

