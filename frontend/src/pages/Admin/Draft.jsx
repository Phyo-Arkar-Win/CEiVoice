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

  // Fetch assignees from backend
  const fetchAssignees = async () => {
  try {
    const res = await api.get("/admin/assignee");
    setAssignees(res.data.data || res.data);
  } catch (err) {
    console.error("Error fetching assignees:", err);
  }
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

    // remove undefined values so only changed fields are sent
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    await api.patch(`/tickets/${ticket._id}`, updates);

    alert("Draft updated successfully");
    fetchDraftTickets(); // refresh list

  } catch (err) {
    console.error("Update error:", err);
  }
};

  // Fetch Draft Tickets
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

  // Toggle checkbox
  const toggleCheck = (index) => {
    const updated = [...tickets];
    updated[index].checked = !updated[index].checked;
    setTickets(updated);
  };

  // Expand ticket
  const toggleExpand = (index) => {
    const updated = [...tickets];
    updated[index].expanded = !updated[index].expanded;
    setTickets(updated);
  };

  // Handle form change
  const handleChange = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  // Submit Draft Ticket
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

  // Merge Tickets
  const handleMerge = async () => {
    const selected = tickets
      .filter((ticket) => ticket.checked)
      .map((ticket) => ticket._id);

    if (selected.length < 2) {
      alert("Select at least 2 tickets to merge.");
      return;
    }

    try {
      const res = await api.put("/tickets/merge", {
        ticketIds: selected,
      });

      alert(res.data.message);
      fetchDraftTickets();
    } catch (err) {
      console.error("Merge error:", err);
    }
  };

  return (
    <div className="h-screen flex bg-gray-200 overflow-hidden">
      <AdminNavbar />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Draft Tickets</h1>

        <div className="bg-gray-100 rounded-2xl shadow p-4 mb-4">
          {tickets.map((ticket, index) => (
            <div
              key={ticket._id}
              className="border-b border-gray-300 py-2 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ticket.checked}
                    onChange={() => toggleCheck(index)}
                    className="w-5 h-5"
                  />

                  <button
                    onClick={() => toggleExpand(index)}
                    className="font-semibold hover:text-orange-600"
                  >
                    {ticket.title}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => updateTicket(ticket)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                  >
                    Save
                  </button>
                </div>
              </div>

              {ticket.expanded && (
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">

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

        <div className="bg-gray-100 rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-3">Merge Selected Requests</h2>

          <div className="grid grid-cols-2 font-semibold mb-2">
            <span>Ticket ID</span>
            <span>Title</span>
          </div>

          <div className="space-y-1">
            {tickets
              .filter((ticket) => ticket.checked)
              .map((ticket) => (
                <div key={ticket._id} className="grid grid-cols-2 text-sm">
                  <span>{ticket._id}</span>
                  <span>{ticket.title || "-"}</span>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-4">
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
  className={`px-4 py-2 rounded text-white cursor-pointer 
  ${merging ? "bg-gray-400" : "bg-orange-600"}`}
>
  {merging ? "Merging..." : "+ Merge"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}