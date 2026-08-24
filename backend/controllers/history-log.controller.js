import HistoryLog from "../models/history-log.js";

export const getHistoryLogs = async (req, res) => {
    try {
        const userId = req.user._id;

        const statusHistoryLog = await HistoryLog.find({
            action: "StatusChange",
            assignee: userId,
        }).populate("ticket", "title issue").lean();

        const assigneeHistoryLog = await HistoryLog.find({
            action: "AssigneeChange",
            $or: [
                { preAssignee: userId },
                { newAssignee: userId },
            ],
        }).populate("ticket", "title issue").populate("preAssignee newAssignee", "name email").lean();

        const compatibleAssigneeLogs = assigneeHistoryLog.map((log) => ({
            ...log,
            fromAssignee: log.preAssignee,
            toAssignee: log.newAssignee,
        }));

        res.status(200).json({
            statusHistoryLog,
            assigneeHistoryLog: compatibleAssigneeLogs,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

