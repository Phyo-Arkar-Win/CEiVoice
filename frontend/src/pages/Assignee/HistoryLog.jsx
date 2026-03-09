import React, { useState, useEffect } from "react";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "../../api/axios";

export default function Assignee_Historylog() {

  const [collapsed, setCollapsed] = useState(false);

  const [statusLogs, setStatusLogs] = useState([
    {
      ticketId: "Ticket-001",
      datetime: "2:22 / 4/3/2026",
      change: "Solving to Solved",
      by: "Linn Hein Htet",
    },
    {
      ticketId: "Ticket-002",
      datetime: "10:15 / 4/3/2026",
      change: "Pending to Solving",
      by: "Phyo Arkar Win",
    },
    {
      ticketId: "Ticket-003",
      datetime: "11:40 / 4/3/2026",
      change: "Open to Pending",
      by: "Admin67",
    },
  ]);

  const [assigneeLogs, setAssigneeLogs] = useState([
    {
      ticketId: "Ticket-001",
      datetime: "2:22 / 4/3/2026",
      change: "Linn Hein Htet to Phyo Arkar Win",
      by: "Admin67",
    },
  ]);

  useEffect(() => {

    const fetchLogs = async () => {
      try {

        const res = await api.get("/tickets/history");

        setStatusLogs(res.data.statusLogs);
        setAssigneeLogs(res.data.assigneeLogs);

      } catch (error) {

        console.log("Backend not ready yet");

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

        {/* STATUS HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-6 mb-8 overflow-x-auto">

          <h2 className="text-xl font-semibold mb-4">Status</h2>

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left py-2">Ticket ID</th>
                <th className="text-left">Date/Time</th>
                <th className="text-left">Old Status - New Status</th>
                <th className="text-left">By</th>
              </tr>
            </thead>

            <tbody>

              {statusLogs.map((log, index) => (

                <tr key={index} className="border-t hover:bg-gray-50">

                  <td className="py-3">{log.ticketId}</td>
                  <td>{log.datetime}</td>
                  <td>{log.change}</td>
                  <td>{log.by}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ASSIGNEE HISTORY */}
        <div className="bg-gray-100 rounded-xl shadow p-6 overflow-x-auto">

          <h2 className="text-xl font-semibold mb-4">Assignee</h2>

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left py-2">Ticket ID</th>
                <th className="text-left">Date/Time</th>
                <th className="text-left">Old Assignee - New Assignee</th>
                <th className="text-left">By</th>
              </tr>
            </thead>

            <tbody>

              {assigneeLogs.map((log, index) => (

                <tr key={index} className="border-t hover:bg-gray-50">

                  <td className="py-3">{log.ticketId}</td>
                  <td>{log.datetime}</td>
                  <td>{log.change}</td>
                  <td>{log.by}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}