import { Router } from "express";
import { getHistoryLogs } from "../controllers/history-log.controller.js";

const router = Router();

router.get("/", getHistoryLogs);


export default router;