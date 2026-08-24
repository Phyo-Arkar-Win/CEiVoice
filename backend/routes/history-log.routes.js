import { Router } from "express";
import { getHistoryLogs } from "../controllers/history-log.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, restrictTo('assignee'), getHistoryLogs);


export default router;