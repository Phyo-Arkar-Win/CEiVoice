import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";

export default function Draft() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([
    {
      id: "Ticket-001",
      title: "",
      category: "",
      deadline: "",
      summary: "",
      resolutionPath: "",
      checked: false,
      expanded: false,
    },
    {
      id: "Ticket-002",
      title: "",
      category: "",
      deadline: "",
      summary: "",
      resolutionPath: "",
      checked: false,
      expanded: false,
    },
  ]);

  const toggleCheck = (index) => {
    const updated = [...tickets];
    updated[index].checked = !updated[index].checked;
    setTickets(updated);
  };

  const toggleExpand = (index) => {
    const updated = [...tickets];
    updated[index].expanded = !updated[index].expanded;
    setTickets(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  const handleMerge = () => {
    const selectedTickets = tickets.filter((ticket) => ticket.checked);

    if (selectedTickets.length < 2) {
      alert("Please select at least 2 tickets to merge.");
      return;
    }

    navigate("/admin/drafts/merge", {
      state: { mergedTickets: selectedTickets },
    });
  };

  return (
    <div className="h-screen flex bg-gray-200 overflow-hidden">
      <AdminNavbar />

      <div className="flex-1 p-8 overflow-hidden">
        <h1 className="text-2xl font-bold mb-6">Draft Tickets</h1>

        <div className="bg-gray-100 rounded-xl shadow p-6 mb-6 overflow-y-auto max-h-[420px]">
          {tickets.map((ticket, index) => (
            <div key={ticket.id} className="mb-6 border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <input
                    type="checkbox"
                    checked={ticket.checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleCheck(index);
                    }}
                    className="w-4 h-4"
                  />
                  <span>{ticket.id}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                  >
                    Edit
                  </button>

                  <button className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600">
                    Save
                  </button>
                </div>
              </div>

              {ticket.expanded && (
                <div className="border border-gray-500 rounded-2xl p-4 grid grid-cols-2 gap-6 max-h-[420px] overflow-y-auto">
                  <div>
                    <label className="font-semibold block mb-1">Title</label>
                    <input
                      type="text"
                      value={ticket.title}
                      onChange={(e) =>
                        handleChange(index, "title", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <input
                      type="text"
                      value={ticket.category}
                      onChange={(e) =>
                        handleChange(index, "category", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Deadline</label>
                    <input
                      type="datetime-local"
                      value={ticket.deadline}
                      onChange={(e) =>
                        handleChange(index, "deadline", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2 bg-white"
                    />
                  </div>

                  <div></div>

                  <div>
                    <label className="font-semibold block mb-1">Summary</label>
                    <textarea
                      value={ticket.summary}
                      onChange={(e) =>
                        handleChange(index, "summary", e.target.value)
                      }
                      className="w-full h-28 border border-orange-400 rounded-2xl px-4 py-2 bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">
                      Resolution Path
                    </label>
                    <textarea
                      value={ticket.resolutionPath}
                      onChange={(e) =>
                        handleChange(index, "resolutionPath", e.target.value)
                      }
                      className="w-full h-28 border border-orange-400 rounded-2xl px-4 py-2 bg-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl shadow p-6 overflow-y-auto max-h-[260px]">
          <h2 className="text-2xl font-bold mb-6">Merge Selected Requests</h2>

          <div className="bg-orange-100 border border-orange-300 p-4 mb-8 w-fit">
            <p className="mb-2">AI has suggested merging similar requests.</p>
            <p>
              Suggestion: Merge selected tickets into a single draft ticket for
              quicker processing
            </p>
          </div>

          <div className="grid grid-cols-2 font-semibold mb-4 px-4">
            <span>Ticket ID</span>
            <span>Description</span>
          </div>

          <div className="space-y-3 px-4 min-h-[80px]">
            {tickets
              .filter((ticket) => ticket.checked)
              .map((ticket) => (
                <div key={ticket.id} className="grid grid-cols-2 text-sm">
                  <span>{ticket.id}</span>
                  <span>{ticket.title || "-"}</span>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleMerge}
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