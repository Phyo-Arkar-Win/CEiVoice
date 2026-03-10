import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import { FaSearch } from "react-icons/fa";
import api from "../../api/axios";

export default function Assignee_Dashboard() {

  const navigate = useNavigate();
  // const [ expanded, setExpanded ] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    nearDeadline: 0,
    dueToday: 0,
    pastDue: 0,
  });

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await api.get("/assignee/dashboard");

        const data = res.data;

        // set statistics
        setStats({
          active: data.stats.activeTickets,
          nearDeadline: data.stats.nearDeadlineTickets,
          dueToday: data.stats.dueTodayTickets,
          pastDue: data.stats.overdueTickets
        });

        // set tickets
        setTickets(data.tickets);

      } catch (error) {
        console.log(error);
      }

    };

    fetchDashboard();

  }, []);

  return (
  <div className="flex bg-gray-100 min-h-screen">

    {/* Sidebar */}
    <AssigneeNavbar />

    {/* Main Content */}
    <div className="flex-1 p-8 overflow-hidden">

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
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b hover:bg-gray-50">

                <td className="p-3">{ticket._id}</td>
                <td className="p-3">{ticket.title}</td>
                <td className="p-3">{ticket.status}</td>

                <td className="p-3">
                  {ticket.deadline
                    ? new Date(ticket.deadline).toLocaleDateString()
                    : "No deadline"}
                </td>

                <td className="p-3 text-blue-600 cursor-pointer">
                  Solving
                </td>

                <td className="p-3">
                  <FaSearch
                    onClick={() =>
                      navigate(
                        `/assignee_ticket_details/${encodeURIComponent(ticket._id)}`,
                        { state: { ticketId: ticket._id } }
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