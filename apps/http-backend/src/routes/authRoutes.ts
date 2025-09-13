import { Router } from "express";
import { signInController, singUpController } from "../controller/authController.js";
const router: Router = Router();

router.post("/signin", signInController);
router.post("/signup", singUpController);

export default router;
