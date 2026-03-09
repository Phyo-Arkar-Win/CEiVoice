import HistoryLog from "../models/historyLog.js";

const getHistoryLogs = async (req, res) => {
    try {   
        let user = req.user;
        
        let statusHistoryLog = await HistoryLog.find({ 
            action: "StatusChange" ,   
            $or: [
                { fromAssignee:  user },
                { toAssignee: user }
            ]
        });
        let assigneeHistoryLog = await HistoryLog.find({ 
            action: "AssigneeChange" ,   
            $or: [
                { fromAssignee:  user },
                { toAssignee: user }
            ]
        }   );
        res.status(200).json({ statusHistoryLog, assigneeHistoryLog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default getHistoryLogs;