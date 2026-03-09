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
  <div className="bg-gray-200 min-h-screen">

    {/* Sidebar */}
    <AssigneeNavbar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />

    {/* Main Content */}
    <div
      className={`transition-all duration-300 p-10 ${
        collapsed ? "ml-20" : "ml-64"
      }`}
    >

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-6">
        History Log
      </h1>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-8">

        {/* STATUS HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-6 overflow-x-auto">

          <h2 className="text-xl font-semibold mb-4">Status Change</h2>

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left py-2">Ticket ID</th>
                <th className="text-left">Date/Time</th>
                <th className="text-left">Old Status</th>
                <th className="text-left">New Status</th>
                <th className="text-left">By</th>
              </tr>
            </thead>

            <tbody>

              {statusLogs.map((log, index) => {

                const [oldStatus, newStatus] = log.change.split(" to ");

                return (

                  <tr key={index} className="border-t hover:bg-gray-50">

                    <td className="py-3">{log.ticketId}</td>
                    <td>{log.datetime}</td>
                    <td>{oldStatus}</td>
                    <td>{newStatus}</td>
                    <td>{log.by}</td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

        {/* ASSIGNEE HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-6 overflow-x-auto">

          <h2 className="text-xl font-semibold mb-4">Assignee Change</h2>

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left py-2">Ticket ID</th>
                <th className="text-left">Date/Time</th>
                <th className="text-left">Old Assignee</th>
                <th className="text-left">New Assignee</th>
                <th className="text-left">By</th>
              </tr>
            </thead>

            <tbody>

              {assigneeLogs.map((log, index) => {

                const [oldAssignee, newAssignee] = log.change.split(" to ");

                return (

                  <tr key={index} className="border-t hover:bg-gray-50">

                    <td className="py-3">{log.ticketId}</td>
                    <td>{log.datetime}</td>
                    <td>{oldAssignee}</td>
                    <td>{newAssignee}</td>
                    <td>{log.by}</td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  </div>
);
}