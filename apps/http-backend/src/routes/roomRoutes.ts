import { Router } from "express";
import { addNewRoom, deleteRoom, updateRoomName, getRoomContent } from "../controller/roomController.js";
import { verify } from "../middleware/auth.js";

const router:Router = Router();

router.post("/add", verify, addNewRoom);
router.post("/:slug", verify, updateRoomName);
router.delete("/:slug", verify, deleteRoom);
router.get("/:slug", verify, getRoomContent)

export default router;