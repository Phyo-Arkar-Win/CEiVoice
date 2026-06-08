import { Router } from "express";
import { validateLogin, validateSignup, protect } from "../middlewares/auth.middleware.js";
import { loginRateLimit } from "../middlewares/rateLimiter.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", loginRateLimit, validateLogin, authController.login);
router.post("/signup", loginRateLimit, validateSignup, authController.signup);
router.post("/google", loginRateLimit, authController.googleLogin);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;