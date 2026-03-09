import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import { FaSearch } from "react-icons/fa";
import api from "@/api/axios";

export default function Assignee_Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    nearDeadline: 0,
    dueToday: 0,
    pastDue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/assignee/dashboard");
        setTickets(Array.isArray(response.data?.tickets) ? response.data.tickets : []);
        setStats({
          active: response.data?.stats?.activeTickets ?? 0,
          nearDeadline: response.data?.stats?.nearDeadlineTickets ?? 0,
          dueToday: response.data?.stats?.dueTodayTickets ?? 0,
          pastDue: response.data?.stats?.overdueTickets ?? 0,
        });
      } catch (error) {
        console.error("Error fetching assignee dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDeadline = (deadline) => {
    if (!deadline) return "-";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <AssigneeNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className={`${collapsed ? "ml-20" : "ml-64"} p-8 transition-all duration-300`}>

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
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    No active tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const routeTicketId = ticket?._id || ticket?.id;

                  return (
                    <tr key={routeTicketId} className="border-b hover:bg-gray-50">
                      <td className="p-3">{ticket?.id || ticket?._id}</td>
                      <td className="p-3">{ticket?.title || "-"}</td>
                      <td className="p-3">{ticket?.status || "-"}</td>
                      <td className="p-3">{formatDeadline(ticket?.deadline)}</td>

                      <td className="p-3 text-blue-600 cursor-pointer">
                        {ticket?.status || "Solving"}
                      </td>

                      <td className="p-3">
                        <FaSearch
                          onClick={() =>
                            navigate(
                              `/assignee_ticket_details/${encodeURIComponent(routeTicketId)}`,
                              {
                                state: { ticketId: routeTicketId, ticket },
                              }
                            )
                          }
                          className="cursor-pointer text-gray-700"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}
