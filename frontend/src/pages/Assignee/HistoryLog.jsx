import React, { useEffect, useState } from "react";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "../../api/axios";

export default function Assignee_Historylog() {
  const [expanded, setExpanded] = useState(false);

  const [statusLogs, setStatusLogs] = useState([]);
  const [assigneeLogs, setAssigneeLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/assignee/history");

        const formattedStatus = res.data.statusHistoryLog.map((log) => ({
          ticketId: log.ticket?.toString() || "-",
          datetime: new Date(log.timestamp).toLocaleString(),
          change: `${log.fromStatus} → ${log.toStatus}`,
          by: log.fromAssignee?.name || "System",
        }));

        const formattedAssignee = res.data.assigneeHistoryLog.map((log) => ({
          ticketId: log.ticket?.toString() || "-",
          datetime: new Date(log.timestamp).toLocaleString(),
          change: `${log.fromAssignee?.name || "None"} → ${
            log.toAssignee?.name || "None"
          }`,
          by: "Admin",
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
    <div className="bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <AssigneeNavbar
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* Main Content */}
      <main
        className={`min-h-screen p-4 md:p-10 transition-all duration-300 ${
          expanded ? "ml-64" : "ml-20"
        }`}
      >
        <h1 className="text-xl md:text-2xl font-semibold mb-6">
          History Log
        </h1>

        <div className="grid grid-cols-1 gap-8">
          {/* STATUS HISTORY */}
          <div className="bg-gray-100 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Status Change
            </h2>

            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Ticket ID</th>
                    <th className="px-4 py-3 text-left">Date/Time</th>
                    <th className="px-4 py-3 text-left">Old Status</th>
                    <th className="px-4 py-3 text-left">New Status</th>
                    <th className="px-4 py-3 text-left">By</th>
                  </tr>
                </thead>

                <tbody>
                  {statusLogs.length > 0 ? (
                    statusLogs.map((log, index) => {
                      const [oldStatus, newStatus] = log.change.split(" → ");

                      return (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">{log.ticketId}</td>
                          <td className="px-4 py-3">{log.datetime}</td>

                          <td className="px-4 py-3">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {oldStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {newStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3">{log.by}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6">
                        No status logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ASSIGNEE HISTORY */}
          <div className="bg-gray-100 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Assignee Change
            </h2>

            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Ticket ID</th>
                    <th className="px-4 py-3 text-left">Date/Time</th>
                    <th className="px-4 py-3 text-left">Old Assignee</th>
                    <th className="px-4 py-3 text-left">New Assignee</th>
                    <th className="px-4 py-3 text-left">By</th>
                  </tr>
                </thead>

                <tbody>
                  {assigneeLogs.length > 0 ? (
                    assigneeLogs.map((log, index) => {
                      const [oldAssignee, newAssignee] =
                        log.change.split(" → ");

                      return (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">{log.ticketId}</td>
                          <td className="px-4 py-3">{log.datetime}</td>

                          <td className="px-4 py-3">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {oldAssignee}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {newAssignee}
                            </span>
                          </td>

                          <td className="px-4 py-3">{log.by}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6">
                        No assignee logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
