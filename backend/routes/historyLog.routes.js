import {Router} from "express";
import HistoryLog from "../models/historyLog.js";
import getHistoryLogs from "../controllers/historyLog.controller.js";

const router = Router();

router.get("/", getHistoryLogs);


export default router;