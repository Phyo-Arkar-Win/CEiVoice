import { Router } from "express";
import handleIssueSubmission from "../controllers/issueSubmission.controller.js";

const router = Router();

router.post("/", handleIssueSubmission);

export default router;