import { Router } from "express";
import validateLogin from "../middleware/validateLogin.js";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/", validateLogin, authController.login);

export default router;