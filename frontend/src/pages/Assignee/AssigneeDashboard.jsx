import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import { FaSearch } from "react-icons/fa";
import api from "../../api/axios";

export default function Assignee_Dashboard() {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);

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

        setStats({
          active: data.stats.activeTickets,
          nearDeadline: data.stats.nearDeadlineTickets,
          dueToday: data.stats.dueTodayTickets,
          pastDue: data.stats.overdueTickets,
        });

        setTickets(data.tickets);

      } catch (error) {
        console.log(error);
      }
    };

    fetchDashboard();
  }, []);


  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Sidebar */}
      <AssigneeNavbar
        expanded={expanded}
        setExpanded={setExpanded}
      />


      {/* Main Content */}
      <div
        className={`
          min-h-screen
          p-4
          md:p-8
          transition-all
          duration-300
          ${expanded ? "ml-64" : "ml-20"}
        `}
      >

        {/* Statistics */}
        <div className="bg-white shadow rounded-xl p-4 md:p-6 mb-6">

          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Statistics
          </h2>


          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 text-sm md:text-lg">


            <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-100">
              <p className="text-orange-700 font-medium text-xs md:text-sm">
                Active
              </p>

              <p className="font-bold text-xl md:text-2xl text-orange-900">
                {stats.active}
              </p>
            </div>


            <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
              <p className="text-blue-700 font-medium text-xs md:text-sm">
                Near Deadline
              </p>

              <p className="font-bold text-xl md:text-2xl text-blue-900">
                {stats.nearDeadline}
              </p>
            </div>


            <div className="bg-red-50 p-3 md:p-4 rounded-lg border border-red-100">
              <p className="text-red-700 font-medium text-xs md:text-sm">
                Due Today
              </p>

              <p className="font-bold text-xl md:text-2xl text-red-900">
                {stats.dueToday}
              </p>
            </div>


            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 font-medium text-xs md:text-sm">
                Past Due
              </p>

              <p className="font-bold text-xl md:text-2xl text-gray-800">
                {stats.pastDue}
              </p>
            </div>


          </div>

        </div>



        {/* Ticket Table */}
        <div className="bg-white shadow rounded-xl p-4 md:p-6 w-full">


          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
            Assignee Dashboard
          </h2>


          <div className="overflow-x-auto rounded-lg border border-gray-200">


            <table className="w-full min-w-[700px] text-left">

              <thead className="bg-gray-50">

                <tr className="border-b text-gray-600 text-sm md:text-base">

                  <th className="p-3 md:p-4">
                    Ticket ID
                  </th>

                  <th className="p-3 md:p-4">
                    Title
                  </th>

                  <th className="p-3 md:p-4">
                    Status
                  </th>

                  <th className="p-3 md:p-4">
                    Deadline
                  </th>

                  <th className="p-3 md:p-4 text-center">
                    View
                  </th>

                </tr>

              </thead>



              <tbody>

                {tickets.length > 0 ? (

                  tickets.map((ticket) => (

                    <tr
                      key={ticket._id}
                      className="border-b hover:bg-orange-50 transition"
                    >


                      <td className="p-3 md:p-4 text-xs md:text-sm whitespace-nowrap">
                        {ticket._id}
                      </td>



                      <td className="p-3 md:p-4 text-xs md:text-sm min-w-[200px]">
                        {ticket.title}
                      </td>



                      <td className="p-3 md:p-4 text-xs md:text-sm">

                        <span
                          className={`
                            px-2
                            py-1
                            rounded-full
                            text-xs
                            font-semibold

                            ${
                              ticket.status === "Solving"
                                ? "bg-amber-100 text-amber-800"
                                : ticket.status === "New"
                                ? "bg-sky-100 text-sky-800"
                                : ticket.status === "Solved"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "Draft"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-blue-100 text-blue-800"
                            }
                          `}
                        >
                          {ticket.status}
                        </span>

                      </td>



                      <td className="p-3 md:p-4 text-xs md:text-sm">

                        {
                          ticket.deadline
                          ? new Date(ticket.deadline).toLocaleDateString()
                          : "No deadline"
                        }

                      </td>




                      <td className="p-3 md:p-4 text-center">

                        <button
                          onClick={() =>
                            navigate(
                              `/assignee_ticket_details/${encodeURIComponent(ticket._id)}`,
                              {
                                state: {
                                  ticketId: ticket._id
                                }
                              }
                            )
                          }

                          className="
                            p-2
                            bg-gray-100
                            hover:bg-gray-200
                            hover:text-orange-600
                            rounded-full
                            transition
                          "
                        >

                          <FaSearch size={14}/>

                        </button>

                      </td>



                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="p-6 text-center text-gray-500"
                    >
                      No tickets found.
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