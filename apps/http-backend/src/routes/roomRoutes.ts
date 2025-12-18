import { Router } from "express";
import { addNewRoom, deleteRoom, updateRoomName, getRoomContent, getCurrentUserRooms } from "../controller/roomController.js";
import { auth } from "../middleware/auth.js";

const router: Router = Router();

router.post("/", auth, addNewRoom);        
router.get("/", auth, getCurrentUserRooms);  
router.get("/:id", auth, getRoomContent);  
router.put("/:id", auth, updateRoomName);  
router.delete("/:id", auth, deleteRoom);  


export default router;