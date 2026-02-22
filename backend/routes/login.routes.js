import { Router } from "express";
import validateLogin from "../middleware/validateLogin.js";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/", validateLogin, authController.login);
router.post("/google", authController.googleLogin);

export default router;