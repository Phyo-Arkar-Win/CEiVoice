import Ticket from '../models/ticket.js';

export const getDashboardData = async (req, res) => {
    const userRole = req.user.role;

    // get data for ** Assignee **
    if (userRole == 'assignee') {
        try {
            const assigneeId = req.user.id;

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
                assignees: { $in: [assigneeId] },
                status: { $in: activeStatus },
            });

            // tickets near deadline
            const nearDeadlineTickets = await Ticket.countDocuments({
                assignees: { $in: [assigneeId] },
                status: { $in: activeStatus },
                deadline: { $gte: todayStart, $lte: threeDaysLater },
            });

            // tickets due today
            const dueTodayTickets = await Ticket.countDocuments({
                assignees: { $in: [assigneeId] },
                status: { $in: activeStatus },
                deadline: { $gte: todayStart, $lte: todayEnd },
            });

            // overdue tickets
            const overdueTickets = await Ticket.countDocuments({
                assignees: { $in: [assigneeId] },
                status: { $in: activeStatus },
                deadline: { $lt: todayStart },
            });

            const tickets = await Ticket.find({
                assignees: { $in: [assigneeId] },
                status: { $in: activeStatus },
            });

            res.status(200).json({
                stats: {
                    activeTickets,
                    nearDeadlineTickets,
                    dueTodayTickets,
                    overdueTickets,
                },
                tickets,
            });
        } catch (error) {
            res.status(500).json({
                message: `Error fetching dashboard data: ${error.message}`,
            });
        }
    }

    // get data for ** Admin **
    else if (userRole == 'admin') {
        try {
            // period from dropdown, default to 3 days
            const period = Number(req.query.period) || 3;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);

            // total tickets created in the period
            const ticketsCreated = await Ticket.countDocuments({
                createdAt: { $gte: startDate },
            });

            // total active tickets
            const activeTickets = await Ticket.countDocuments({
                status: { $in: ['New', 'Solving'] },
                createdAt: { $gte: startDate },
            });

            // average resolution time for tickets in the period
            const solvedTickets = await Ticket.find({
                status: 'Solved',
                updatedAt: { $gte: startDate },
            });

            let totalResolutionTime = 0;
            solvedTickets.forEach((solvedTicket) => {
                const resolutionTime =
                    new Date(solvedTicket.updatedAt) -
                    new Date(solvedTicket.createdAt);
                totalResolutionTime += resolutionTime;
            });
            const avgResolutionTimeMs =
                solvedTickets.length > 0
                    ? totalResolutionTime / solvedTickets.length
                    : 0;
            const totalMinutes = Math.floor(avgResolutionTimeMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const avgResolutionTime = `${hours}h ${minutes}m`;

            // top category
            const topCategory = await Ticket.aggregate([
                {
                    $match: {
                        // filter ticketes created in the period
                        createdAt: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        // group by category and count
                        _id: '$category',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { count: -1 }, // sort by count desc
                },
                {
                    $limit: 1, // return the top category
                },
            ]);

            const topCategoryResult = topCategory[0] || { _id: null, count: 0 };
            const topCategoryName = topCategoryResult._id;
            const topCategoryCount = topCategoryResult.count;

            // tickets count by Category and current Status for chart
            const ticketsByCategory = await Ticket.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }, // filter tickets created in the period
                    },
                },
                {
                    $group: {
                        _id: '$category', // group by category
                        count: { $sum: 1 }, // count total tickets in each category
                    },
                },
                {
                    $sort: { count: -1 }, // sort by count desc, from highest to lowest
                },
            ]);

            const ticketsByStatus = await Ticket.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]);

            res.status(200).json({
                ticketsCreated,
                activeTickets,
                avgResolutionTime,
                topCategory: {
                    name: topCategoryName,
                    count: topCategoryCount,
                },
                ticketsByCategory,
                ticketsByStatus,
            });
        } catch (error) {
            res.status(500).json({
                message: `Error fetching dashboard data: ${error.message}`,
            });
        }
    }
};

// Merged into ** getDashboardData** function

// export const getAssigneeDashboardData = async (req, res) => {
//     try {
//         const assigneeId = req.user.id;

//         const todayStart = new Date();
//         todayStart.setHours(0, 0, 0, 0);

//         const todayEnd = new Date();
//         todayEnd.setHours(23, 59, 59, 999);

//         const threeDaysLater = new Date(todayStart);
//         threeDaysLater.setDate(threeDaysLater.getDate() + 3);
//         threeDaysLater.setHours(23, 59, 59, 999);

//         const activeStatus = ['New', 'Solving'];

//         // active tickets
//         const activeTickets = await Ticket.countDocuments({
//             assignees: { $in: [assigneeId] },
//             status: { $in: activeStatus },
//         });

//         // tickets near deadline
//         const nearDeadlineTickets = await Ticket.countDocuments({
//             assignees: { $in: [assigneeId] },
//             status: { $in: activeStatus },
//             deadline: { $gte: todayStart, $lte: threeDaysLater },
//         });

//         // tickets due today
//         const dueTodayTickets = await Ticket.countDocuments({
//             assignees: { $in: [assigneeId] },
//             status: { $in: activeStatus },
//             deadline: { $gte: todayStart, $lte: todayEnd },
//         });

//         // overdue tickets
//         const overdueTickets = await Ticket.countDocuments({
//             assignees: { $in: [assigneeId] },
//             status: { $in: activeStatus },
//             deadline: { $lt: todayStart },
//         });

//         const tickets = await Ticket.find({
//             assignees: { $in: [assigneeId] },
//             status: { $in: activeStatus },
//         });

//         res.status(200).json({
//             stats: {
//                 activeTickets,
//                 nearDeadlineTickets,
//                 dueTodayTickets,
//                 overdueTickets,
//             },
//             tickets,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error fetching dashboard data: ${error.message}`,
//         });
//     }
// };

// export const getAdminDashboardData = async (req, res) => {
//     try {
//         // period from dropdown, default to 3 days
//         const period = Number(req.query.period) || 3;
//         const startDate = new Date();
//         startDate.setDate(startDate.getDate() - period);

//         // total tickets created in the period
//         const ticketsCreated = await Ticket.countDocuments({
//             createdAt: { $gte: startDate },
//         });

//         // total active tickets
//         const activeTickets = await Ticket.countDocuments({
//             status: { $in: ['New', 'Solving'] },
//             createdAt: { $gte: startDate },
//         });

//         // average resolution time for tickets in the period
//         const solvedTickets = await Ticket.find({
//             status: 'Solved',
//             updatedAt: { $gte: startDate },
//         });

//         let totalResolutionTime = 0;
//         solvedTickets.forEach((solvedTicket) => {
//             const resolutionTime =
//                 new Date(solvedTicket.updatedAt) -
//                 new Date(solvedTicket.createdAt);
//             totalResolutionTime += resolutionTime;
//         });
//         const avgResolutionTimeMs =
//             solvedTickets.length > 0
//                 ? totalResolutionTime / solvedTickets.length
//                 : 0;
//         const totalMinutes = Math.floor(avgResolutionTimeMs / (1000 * 60));
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
//         const avgResolutionTime = `${hours}h ${minutes}m`;

//         // top category
//         const topCategory = await Ticket.aggregate([
//             {
//                 $match: {
//                     // filter ticketes created in the period
//                     createdAt: { $gte: startDate },
//                 },
//             },
//             {
//                 $group: {
//                     // group by category and count
//                     _id: '$category',
//                     count: { $sum: 1 },
//                 },
//             },
//             {
//                 $sort: { count: -1 }, // sort by count desc
//             },
//             {
//                 $limit: 1, // return the top category
//             },
//         ]);

//         const topCategoryResult = topCategory[0] || { _id: null, count: 0 };
//         const topCategoryName = topCategoryResult._id;
//         const topCategoryCount = topCategoryResult.count;

//         // tickets count by Category and current Status for chart
//         const ticketsByCategory = await Ticket.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: startDate }, // filter tickets created in the period
//                 },
//             },
//             {
//                 $group: {
//                     _id: '$category', // group by category
//                     count: { $sum: 1 }, // count total tickets in each category
//                 },
//             },
//             {
//                 $sort: { count: -1 }, // sort by count desc, from highest to lowest
//             },
//         ]);

//         const ticketsByStatus = await Ticket.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: startDate },
//                 },
//             },
//             {
//                 $group: {
//                     _id: '$status',
//                     count: { $sum: 1 },
//                 },
//             },
//         ]);

//         res.status(200).json({
//             ticketsCreated,
//             activeTickets,
//             avgResolutionTime,
//             topCategory: {
//                 name: topCategoryName,
//                 count: topCategoryCount,
//             },
//             ticketsByCategory,
//             ticketsByStatus,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error fetching dashboard data: ${error.message}`,
//         });
//     }
// };

// Moved to ticket controller
// export const getUserTickets = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const tickets = await Ticket
//             .find({ $or: [{ followers: { $in: [userId] } }, { creator: userId }] })
//             .sort({ createdAt: -1 });
//         res.status(200).json({ tickets });
//     } catch (error) {
//         res.status(500).json({ message: `Error fetching user tickets: ${error.message}` });
//     }
// }
