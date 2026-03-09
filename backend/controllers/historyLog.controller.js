import HistoryLog from "../models/historyLog.js";

const getHistoryLogs = async (req, res) => {
    try {
        let statusHistoryLog = await HistoryLog.find({ action: "StatusChange" });
        let assigneeHistoryLog = await HistoryLog.find({ action: "AssigneeChange" });
        res.status(200).json({ statusHistoryLog, assigneeHistoryLog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default getHistoryLogs;