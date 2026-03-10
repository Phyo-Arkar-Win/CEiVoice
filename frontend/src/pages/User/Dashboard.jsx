import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "@/components/userNavbar";
import api from "../../api/axios";
import { Search } from "lucide-react";

export default function Dashboard() {

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);

  // FETCH USER TICKETS
  const fetchTickets = async () => {

    try {

      const res = await api.get("/tickets/user");

      setTickets(res.data);

    } catch (error) {

      console.log("Backend not ready yet");

      // mock data for now
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

      <div className="p-10">

        {/* WELCOME CARD */}
        <div className="bg-gray-100 rounded-xl shadow p-8 mb-8">

          <h1 className="text-2xl font-semibold mb-2">
            Welcome to CEi Voice
          </h1>

          <p className="text-gray-700 mb-6">
            Submit feedback, requests, or track your tickets easily.
          </p>

          <button 
            onClick={() => navigate("/submit")}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium transition-colors cursor-pointer"
          >
            Submit Request
          </button>

        </div>

        {/* TICKETS CARD */}
        <div className="bg-gray-100 rounded-xl shadow p-8">

          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Your Tickets
          </h2>

          <table className="w-full">

            <thead>

              <tr className="text-left border-b">

                <th className="py-3">ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>View</th>

              </tr>

            </thead>

            <tbody>

              {tickets.map((ticket, index) => (

                <tr key={index} className="border-t">

                  <td className="py-4">{ticket.id}</td>

                  <td>{ticket.title}</td>

                  <td>{ticket.status}</td>

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

  );
}