import React, { useState, useEffect } from "react";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "../../api/axios";

export default function Assignee_Historylog() {

  const [collapsed, setCollapsed] = useState(false);

  const [statusLogs, setStatusLogs] = useState([]);
  const [assigneeLogs, setAssigneeLogs] = useState([]);

  useEffect(() => {

    const fetchLogs = async () => {
      try {

        const res = await api.get("/tickets/history");

        // FORMAT STATUS LOGS
        const formattedStatus = res.data.statusHistoryLog.map((log) => ({
          ticketId: log.ticket?._id || "Unknown",
          datetime: new Date(log.timestamp).toLocaleString(),
          change: `${log.fromStatus} → ${log.toStatus}`,
          by: log.fromAssignee?.name || "System"
        }));

        // FORMAT ASSIGNEE LOGS
        const formattedAssignee = res.data.assigneeHistoryLog.map((log) => ({
          ticketId: log.ticket?._id || "Unknown",
          datetime: new Date(log.timestamp).toLocaleString(),
          change: `${log.fromAssignee?.name || "None"} → ${log.toAssignee?.name || "None"}`,
          by: "Admin"
        }));

        setStatusLogs(formattedStatus);
        setAssigneeLogs(formattedAssignee);

      } catch (error) {

        console.log(error);

      }
    };

    fetchLogs();

  }, []);

  return (
  <div className="flex bg-gray-100 min-h-screen">

    {/* Sidebar */}
    <AssigneeNavbar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />

    {/* Main Content */}
    <div className="flex-1 p-4 md:p-10 min-w-0 overflow-hidden">

      {/* PAGE TITLE */}
      <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
        History Log
      </h1>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">

        {/* STATUS HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-4 md:p-6 w-full flex flex-col">

          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Status Change</h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 w-full bg-white">
            <table className="w-full text-left min-w-[600px]">

              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-sm md:text-base text-gray-700">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Ticket ID</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Date/Time</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Old Status</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">New Status</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">By</th>
                </tr>
              </thead>

              <tbody>

                {statusLogs.length > 0 ? (
                  statusLogs.map((log, index) => {

                    const [oldStatus, newStatus] = log.change.split(" to ");

                    return (

                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">

                        <td className="py-3 px-4 text-xs md:text-sm font-medium whitespace-nowrap">{log.ticketId}</td>
                        <td className="py-3 px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{log.datetime}</td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">{oldStatus}</span>
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">{newStatus}</span>
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">{log.by}</td>

                      </tr>

                    );

                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-sm text-gray-500">
                      No status logs found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>

        </div>

        {/* ASSIGNEE HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-4 md:p-6 w-full flex flex-col">

          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Assignee Change</h2>

          <div className="overflow-x-auto rounded-lg border border-gray-200 w-full bg-white">
            <table className="w-full text-left min-w-[600px]">

              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-sm md:text-base text-gray-700">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Ticket ID</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Date/Time</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Old Assignee</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">New Assignee</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">By</th>
                </tr>
              </thead>

              <tbody>

                {assigneeLogs.length > 0 ? (
                  assigneeLogs.map((log, index) => {

                    const [oldAssignee, newAssignee] = log.change.split(" to ");

                    return (

                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">

                        <td className="py-3 px-4 text-xs md:text-sm font-medium whitespace-nowrap">{log.ticketId}</td>
                        <td className="py-3 px-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{log.datetime}</td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                           <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">{oldAssignee || "None"}</span>
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm whitespace-nowrap">
                           <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">{newAssignee || "None"}</span>
                        </td>
                        <td className="py-3 px-4 text-xs md:text-sm text-gray-800 whitespace-nowrap">{log.by}</td>

                      </tr>

                    );

                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-sm text-gray-500">
                      No assignee logs found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>

        </div>

      </div>

    </div>

  </div>
);
}