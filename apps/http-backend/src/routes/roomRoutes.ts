import { Router } from "express";
import { addNewRoom, deleteRoom, updateRoomName, getRoomContent } from "../controller/roomController.js";
import { auth } from "../middleware/auth.js";

const router:Router = Router();

router.post("/add", auth, addNewRoom);
router.post("/:id", auth, updateRoomName);
router.delete("/:id", auth, deleteRoom);
router.get("/:id", auth, getRoomContent)

export default router;