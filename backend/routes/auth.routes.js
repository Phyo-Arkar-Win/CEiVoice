import { Router } from "express";
import { validateLogin, validateSignup, protect } from "../middlewares/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", validateLogin, authController.login);
router.post("/signup", validateSignup, authController.signup);
router.post("/google", authController.googleLogin);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;