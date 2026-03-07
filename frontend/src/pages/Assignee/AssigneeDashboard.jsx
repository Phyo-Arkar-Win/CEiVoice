import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import { FaSearch } from "react-icons/fa";

export default function Assignee_Dashboard() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);

  const [tickets] = useState([
    {
      id: "Ticket-001",
      title: "My mouse not working",
      status: "Assigned",
      deadline: "3/3/2026",
    },
    {
      id: "Ticket-002",
      title: "My mouse not working",
      status: "Assigned",
      deadline: "4/3/2026",
    },
    {
      id: "Ticket-003",
      title: "My mouse not working",
      status: "Assigned",
      deadline: "5/3/2026",
    },
  ]);

  const stats = {
    active: 8,
    nearDeadline: 3,
    dueToday: 1,
    pastDue: 0,
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <AssigneeNavbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 p-8 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Statistics */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>

          <div className="flex gap-12 text-lg flex-wrap">
            <p><span className="font-semibold">Active:</span> {stats.active}</p>
            <p><span className="font-semibold">Near Deadline:</span> {stats.nearDeadline}</p>
            <p><span className="font-semibold">Due Today:</span> {stats.dueToday}</p>
            <p><span className="font-semibold">Past Due:</span> {stats.pastDue}</p>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-6">Assignee Dashboard</h2>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Action</th>
                <th className="p-3">View</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{ticket.id}</td>
                  <td className="p-3">{ticket.title}</td>
                  <td className="p-3">{ticket.status}</td>
                  <td className="p-3">{ticket.deadline}</td>

                  <td className="p-3 text-blue-600 cursor-pointer">
                    Solving
                  </td>

                  <td className="p-3">
                    <FaSearch
                      onClick={() =>
                        navigate(
                          `/assignee_ticket_details/${encodeURIComponent(ticket.id)}`,
                          {
                            state: { ticketId: ticket.id },
                          }
                        )
                      }
                      className="cursor-pointer text-gray-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}