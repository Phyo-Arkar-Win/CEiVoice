import { Router } from "express";
import validateSignup from "../middleware/validateSignup.js";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/", validateSignup, authController.signup);

export default router;