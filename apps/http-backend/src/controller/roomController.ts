import type { Request, Response } from "express";
import { extendedRequest } from "../middleware/auth.js";
import { client } from "@repo/db";
import { logger } from "../utils/logger.js";

const addNewRoom = async (req: extendedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { slug } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const createdRoom = await client.room.create({
            data: {
                slug,
                adminId: userId
            }
        });

        res.status(201).json({
            success: true,
            message: "Room is created successfully.",
            slug: createdRoom.slug,
            roomId: createdRoom.id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

const getRoomContent = async (req: extendedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const room = await client.room.findUnique({
            where: { id }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room doesn't exist."
            })
        }

        const roomContent = await client.chat.findMany({
            select: {
                rectangle: true,
                ellipse: true,
                line: true,
                arrow: true,
                text: true,
                stroke: true
            },
            where: {
                roomId: room.id
            }
        })

        res.status(200).json({
            success: true,
            message: "Room content fetched successfully.",
            content: roomContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

const updateRoomName = async (req: extendedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { newSlug } = req.body;

        const room = await client.room.findUnique({
            where: { id }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room doesn't exist."
            })
        }

        if (room.adminId != userId) {
            logger.warn("roomController", "updateRoomName", "Unauthorized user try to change room name, userId:", userId);
            return res.status(401).json({
                success: false,
                message: "Permission denied."
            })
        }

        await client.room.update({
            data: {
                slug: newSlug
            },
            where: {
                id: room.id
            }
        })

        res.status(200).json({
            success: true,
            message: "Room name updated successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

const deleteRoom = async (req: extendedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const room = await client.room.findUnique({
            where: { id }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room doesn't exist."
            })
        }

        if (room.adminId != userId) {
            logger.warn("roomController", "deleteRoom", "Unauthorized user try to delete room, userId:", userId);
            return res.status(401).json({
                success: false,
                message: "Permission denied."
            })
        }

        await client.room.delete({
            where: {
                id: room.id
            }
        })

        res.status(200).json({
            success: true,
            message: "Room deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

export { addNewRoom, deleteRoom, updateRoomName, getRoomContent };