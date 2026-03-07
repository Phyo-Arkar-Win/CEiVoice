import Ticket from '../models/ticket.js';

const getAssigneeDashboardData = async (req, res) => {
    try {
        const assigneeId = req.user._id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const threeDaysLater = new Date(todayStart);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        threeDaysLater.setHours(23, 59, 59, 999);

        const activeStatus = ['New', 'Solving'];

        // active tickets
        const activeTickets = await Ticket.countDocuments({
            assignees: assigneeId,
            status: { $in: activeStatus }
        })

        // tickets near deadline
        const nearDeadlineTickets = await Ticket.countDocuments({
            assignees: assigneeId,
            status: { $in: activeStatus },
            deadline: { $gte: todayStart, $lte: threeDaysLater }
        })

        // tickets due today
        const dueTodayTickets = await Ticket.countDocuments({
            assignees: assigneeId,
            status: { $in: activeStatus },
            deadline: { $gte: todayStart, $lte: todayEnd }
        })

        // overdue tickets
         const overdueTickets = await Ticket.countDocuments({
            assignees: assigneeId,
            status: { $in: activeStatus },
            deadline: { $lt: todayStart }
        })

        const tickets = await Ticket.find({ assignees: assigneeId, status: { $in: activeStatus } });

        res.status(200).json({
            stats: {
                activeTickets,
                nearDeadlineTickets,
                dueTodayTickets,
                overdueTickets
            },
            tickets
        });
    } catch (error) {
        res.status(500).json({ message: `Error fetching dashboard data: ${error.message}` });
    }
}

export { getAssigneeDashboardData };