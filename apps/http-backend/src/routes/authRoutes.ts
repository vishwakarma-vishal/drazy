import { Router } from "express";
import { signInController, signUpController } from "../controller/authController.js";
const router: Router = Router();

router.post("/signin", signInController);
router.post("/signup", signUpController);

export default router;
