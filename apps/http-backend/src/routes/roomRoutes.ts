import { Router } from "express";
import { addNewRoom, deleteRoom, updateRoomName, getRoomContent } from "../controller/roomController.js";

const router:Router = Router();

router.post("/add", addNewRoom);
router.post("/updateName", updateRoomName);
router.delete("/delete/:id", deleteRoom);
router.get("/content", getRoomContent)

export default router;