import type { Request, Response } from "express";

const getRoomContent = (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            message: "Room content fetched successfully.",
            roomId: "123"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
        return;
    }
}

const addNewRoom = (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            message: "Room is created successfully.",
            roomId: "123"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
        return;
    }
}

const deleteRoom = (req: Request, res: Response) => {
    try {  

        res.status(200).json({
            success: true,
            message: "Room is deleted successfully.",
            roomId: "123"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
        return;
    }
}

const updateRoomName = (req: Request, res: Response) => {
    try {

        res.status(200).json({
            success: true,
            message: "Room name is updated successfully.",
            roomId: "123"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
        return;
    }
}

export { addNewRoom, deleteRoom, updateRoomName, getRoomContent };