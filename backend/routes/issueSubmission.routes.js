import { Router } from "express";
import handleIssueSubmission from "../controllers/issueSubmission.controller.js";
import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/", authController.protect, handleIssueSubmission);

export default router;