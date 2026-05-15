import { Router } from "express";
import { validateLogin, validateSignup } from "../middlewares/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", validateLogin, authController.login);
router.post("/signup", validateSignup, authController.signup);
router.post("/google", authController.googleLogin);


export default router;