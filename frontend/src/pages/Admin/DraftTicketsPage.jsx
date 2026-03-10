import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";

export default function DraftTicketsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([
    {
      id: "Ticket-001",
      title: "Mouse Not Working",
      category: "Hardware issue",
      summary: "",
      resolutionPath: "",
      checked: false,
    },
    {
      id: "Ticket-002",
      title: "USB Not Working",
      category: "Hardware issue",
      summary: "",
      resolutionPath: "",
      checked: false,
    },
  ]);

  const toggleCheck = (index) => {
    const updated = [...tickets];
    updated[index].checked = !updated[index].checked;
    setTickets(updated);
  };

  const handleMergeNavigate = () => {
    const selectedTickets = tickets.filter((ticket) => ticket.checked);

    if (selectedTickets.length < 2) {
      alert("Please select at least 2 tickets to merge.");
      return;
    }

    navigate("/admin/drafts/merge", {
      state: {
        mergedTickets: selectedTickets,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-200">
      <AdminNavbar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Draft Tickets</h1>

        <div className="bg-gray-100 rounded-xl shadow p-6 mb-6">
          {tickets.map((ticket, index) => (
            <div key={ticket.id} className="mb-6 border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ticket.checked}
                    onChange={() => toggleCheck(index)}
                  />
                  <span>{ticket.id}</span>
                </div>

                <div className="flex gap-3">
                  <button className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">
                    Edit
                  </button>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600">
                    Save
                  </button>
                </div>
              </div>

              {ticket.checked && (
                <div className="border rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Title</label>
                    <input
                      type="text"
                      value={ticket.title}
                      readOnly
                      className="w-full border border-orange-400 rounded-full px-4 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <input
                      type="text"
                      value={ticket.category}
                      readOnly
                      className="w-full border border-orange-400 rounded-full px-4 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Summary</label>
                    <textarea
                      value={ticket.summary}
                      readOnly
                      className="w-full h-24 border border-orange-400 rounded-xl px-4 py-2 bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">
                      Resolution Path
                    </label>
                    <textarea
                      value={ticket.resolutionPath}
                      readOnly
                      className="w-full h-24 border border-orange-400 rounded-xl px-4 py-2 bg-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Merge Selected Requests</h2>

          <div className="bg-orange-100 border border-orange-200 p-4 rounded mb-4 text-sm">
            <p>AI has suggested merging similar requests.</p>
            <p>
              Suggestion: Merge selected tickets into a single draft ticket for
              quicker processing.
            </p>
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left py-2">Ticket ID</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {tickets
                .filter((ticket) => ticket.checked)
                .map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="py-2">{ticket.id}</td>
                    <td className="py-2">{ticket.title}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <button
              onClick={handleMergeNavigate}
              className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600"
            >
              + Merge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}