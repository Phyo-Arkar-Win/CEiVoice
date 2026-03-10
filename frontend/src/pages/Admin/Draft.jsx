import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/api/axios";

export default function Draft() {

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchDraftTickets();
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      const res = await api.get("/admin/assignee");
      setAssignees(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching assignees:", err);
    }
  };

  const fetchDraftTickets = async () => {
    try {
      const res = await api.get("/tickets/drafts");

      const formatted = res.data.map((ticket) => ({
        ...ticket,
        checked: false,
        expanded: false,
        assignee: ticket.assignees?.[0]?._id || "",
      }));

      setTickets(formatted);

    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };

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

  const updateTicket = async (ticket) => {

    try {

      const updates = {
        title: ticket.title,
        summary: ticket.summary,
        category: ticket.category,
        resolution_path: ticket.resolution_path,
        deadline: ticket.deadline,
        assignees: ticket.assignee ? [ticket.assignee] : undefined,
      };

      Object.keys(updates).forEach(
        (key) => updates[key] === undefined && delete updates[key]
      );

      await api.patch(`/tickets/${ticket._id}`, updates);

      alert("Draft updated successfully");

      fetchDraftTickets();

    } catch (err) {

      console.error("Update error:", err);

    }
  };

  const submitTicket = async (ticket) => {

    try {

      const res = await api.put(`/tickets/${ticket._id}/submit`, {
        title: ticket.title,
        summary: ticket.summary,
        category: ticket.category,
        resolution_path: ticket.resolution_path,
        deadline: ticket.deadline,
        assignees: [ticket.assignee],
      });

      alert(res.data.message);

      fetchDraftTickets();

    } catch (err) {

      console.error("Submit error:", err);

    }
  };

  return (

    <div className="flex flex-col md:flex-row min-h-screen bg-gray-200">

      <AdminNavbar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Draft Tickets
        </h1>


        {/* ================== DRAFT LIST ================== */}

        <div className="bg-gray-100 rounded-2xl shadow p-4 mb-6">

          {tickets.map((ticket, index) => (

            <div
              key={ticket._id}
              className="border-b border-gray-300 py-4 last:border-b-0"
            >

              {/* HEADER */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={ticket.checked}
                    onChange={() => toggleCheck(index)}
                    className="w-5 h-5"
                  />

                  <button
                    onClick={() => toggleExpand(index)}
                    className="font-semibold hover:text-orange-600 text-left"
                  >
                    {ticket.title}
                  </button>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => toggleExpand(index)}
                    className="bg-gray-300 px-3 py-2 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => updateTicket(ticket)}
                    className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 text-sm"
                  >
                    Save
                  </button>

                </div>

              </div>


              {/* EXPANDED FORM */}

              {ticket.expanded && (

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="font-semibold block mb-1">Title</label>
                    <input
                      value={ticket.title || ""}
                      onChange={(e) =>
                        handleChange(index, "title", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <input
                      value={ticket.category || ""}
                      onChange={(e) =>
                        handleChange(index, "category", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Summary</label>
                    <textarea
                      value={ticket.summary || ""}
                      onChange={(e) =>
                        handleChange(index, "summary", e.target.value)
                      }
                      className="w-full h-28 border border-orange-400 rounded-xl px-4 py-2 resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">
                      Resolution Path
                    </label>
                    <textarea
                      value={ticket.resolution_path || ""}
                      onChange={(e) =>
                        handleChange(index,"resolution_path", e.target.value)
                      }
                      className="w-full h-28 border border-orange-400 rounded-xl px-4 py-2 resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Deadline</label>
                    <input
                      type="date"
                      value={ticket.deadline || ""}
                      onChange={(e) =>
                        handleChange(index, "deadline", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Assignee</label>

                    <select
                      value={ticket.assignee}
                      onChange={(e) =>
                        handleChange(index, "assignee", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    >

                      <option value="">Select Assignee</option>

                      {assignees.map((person) => (
                        <option key={person._id} value={person._id}>
                          {person.name}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>


        {/* ================== MERGE SECTION ================== */}

        <div className="bg-gray-100 rounded-2xl shadow p-5">

          <h2 className="text-xl font-bold mb-4">
            Merge Selected Requests
          </h2>

          <div className="grid grid-cols-2 font-semibold mb-2">
            <span>Ticket ID</span>
            <span>Title</span>
          </div>

          <div className="space-y-1 text-sm">

            {tickets
              .filter((ticket) => ticket.checked)
              .map((ticket) => (

                <div key={ticket._id} className="grid grid-cols-2">
                  <span className="truncate">{ticket._id}</span>
                  <span className="truncate">{ticket.title || "-"}</span>
                </div>

              ))}

          </div>


          <div className="flex justify-end mt-6">

            <button
              disabled={merging}
              onClick={async () => {

                const selectedTickets = tickets.filter(ticket => ticket.checked);

                if (selectedTickets.length < 2) {
                  alert("Select at least 2 tickets to merge.");
                  return;
                }

                try {

                  setMerging(true);

                  const res = await api.post("/tickets/merge/selection", {
                    tickets: selectedTickets
                  });

                  navigate("/drafts/merge", {
                    state: {
                      mergedTicket: res.data.mergedTicket,
                      tickets: selectedTickets
                    }
                  });

                } catch (err) {

                  console.error("Merge selection error:", err);

                } finally {

                  setMerging(false);

                }

              }}
              className={`px-5 py-2 rounded text-white 
              ${merging ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}
            >

              {merging ? "Merging..." : "+ Merge"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}