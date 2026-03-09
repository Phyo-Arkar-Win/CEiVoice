import { Router } from "express";
import getHistoryLogs from "../controllers/historyLog.controller.js";

const router = Router();

router.get("/", getHistoryLogs);


export default router;