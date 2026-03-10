import React, { useEffect, useState } from "react";
import UserNavbar from "../../components/UserNavbar";
import api from "../../api/axios";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  // ================= FETCH USER TICKETS =================

  const fetchTickets = async () => {

    try {

      const res = await api.get("/tickets/user");

      // handle different backend formats
      setTickets(res.data.data || res.data);

    } catch (error) {

      console.log("Backend not ready yet");

      // mock data
      setTickets([
        {
          id: "Ticket-001",
          title: "My mouse is not working",
          status: "Solving"
        }
      ]);
    }

  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (

    <div className="min-h-screen bg-gray-200">

      <UserNavbar />

      <div className="p-4 md:p-8 lg:p-10">

        {/* ================= WELCOME CARD ================= */}

        <div className="bg-gray-100 rounded-xl shadow p-6 md:p-8 mb-8">

          <h1 className="text-xl md:text-2xl font-semibold mb-2">
            Welcome to CEi Voice
          </h1>

          <p className="text-gray-700 mb-6">
            Submit feedback, requests, or track your tickets easily.
          </p>

          <button
            onClick={() => navigate("/submit")}
            className="bg-orange-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg hover:bg-orange-700"
          >
            Submit Request
          </button>

        </div>

        {/* ================= TICKETS CARD ================= */}

        <div className="bg-gray-100 rounded-xl shadow p-6 md:p-8">

          <h2 className="text-lg md:text-xl font-semibold mb-6">
            Your Tickets
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px]">

              <thead>

                <tr className="text-left border-b text-gray-700">

                  <th className="py-3">ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>View</th>

                </tr>

              </thead>

              <tbody>

                {tickets.map((ticket, index) => (

                  <tr key={index} className="border-t">

                    <td className="py-4">
                      {ticket.id}
                    </td>

                    <td>
                      {ticket.title}
                    </td>

                    <td>
                      <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-600">
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      <button className="hover:text-orange-600">
                        <Search size={20}/>
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );
}