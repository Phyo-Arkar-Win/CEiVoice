import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import { FaSearch } from "react-icons/fa";
import api from "../../api/axios";

export default function Tickets() {

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTickets = async () => {
      try {

        const res = await api.get("/admin/tickets");

        setTickets(res.data.tickets || res.data || []); // handle both { tickets: [...] } and [...] formats

      } catch (error) {

        console.error("Error loading tickets:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

  }, []);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">

        <h1 className="text-2xl font-semibold mb-6">All Tickets</h1>

        <div className="bg-white shadow rounded-xl p-6">

          <div className="overflow-x-auto rounded-lg border border-gray-200">

            <table className="w-full text-left min-w-[700px]">

              <thead className="bg-gray-50">
                <tr className="border-b text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Ticket ID</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold text-center">View</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>

                ) : tickets.length > 0 ? (

                  tickets.map((ticket) => (

                    <tr
                      key={ticket._id}
                      className="border-b hover:bg-orange-50 transition-colors duration-150"
                    >

                      <td className="p-4 text-sm text-gray-800 font-medium">
                        {ticket._id}
                      </td>

                      <td className="p-4 text-sm text-gray-800">
                        {ticket.title}
                      </td>

                      <td className="p-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${
                              ticket.status === "Solving"
                                ? "bg-amber-100 text-amber-800"
                                : ticket.status === "New"
                                ? "bg-sky-100 text-sky-800"
                                : ticket.status === "Solved"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {ticket.deadline
                          ? new Date(ticket.deadline).toLocaleDateString()
                          : "No deadline"}
                      </td>

                      <td className="p-4 text-center">

                        <button
  onClick={() =>
    navigate(`/admin_ticket_details/${encodeURIComponent(ticket._id)}`, {
      state: { ticketId: ticket._id, ticket },
    })
  }
  className="p-2 bg-gray-100 hover:bg-gray-200 hover:text-orange-600 text-gray-700 rounded-full transition"
>
  <FaSearch size={14} />
</button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}