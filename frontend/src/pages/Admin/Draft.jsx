import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/api/axios";

export default function Draft() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchDraftTickets();
    fetchAssignees();
    fetchScopes();
  }, []);

  // Fetch assignees from backend
  const fetchAssignees = async () => {
    try {
      const res = await api.get("/admin/assignees");
      setAssignees(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching assignees:", err);
    }
  };

  // Fetch scopes (for category dropdown) from backend
  const fetchScopes = async () => {
    try {
      const res = await api.get("/scopes");
      setScopes(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching scopes:", err);
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

        assignees: ticket.assignee?._id 
        ? [ticket.assignee._id] 
        : undefined,
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

      <div className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto">
        <h1 className="text-xl md:text-3xl font-bold mb-4">Draft Tickets</h1>

        <div className="bg-gray-100 rounded-2xl shadow p-4 md:p-6 mb-4 w-full">
          {tickets.map((ticket, index) => (
            <div
              key={ticket._id}
              className="border-b border-gray-300 py-3 md:py-4 last:border-b-0"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div className="flex items-start md:items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ticket.checked}
                    onChange={() => toggleCheck(index)}
                    className="w-5 h-5 flex-shrink-0 mt-1 md:mt-0"
                  />

                  <button
                    onClick={() => toggleExpand(index)}
                    className="font-semibold text-left text-sm md:text-base hover:text-orange-600 break-words line-clamp-2 md:line-clamp-none"
                  >
                    {ticket.title || "Untitled Ticket"}
                  </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 pl-8 md:pl-0">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="flex-1 md:flex-none bg-gray-300 px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-gray-400 text-sm md:text-base transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => updateTicket(ticket)}
                    className="flex-1 md:flex-none bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-orange-600 text-sm md:text-base transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {ticket.expanded && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                  {/* Title - Full Width */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="font-semibold block mb-1">Title</label>
                    <input
                      value={ticket.title || ""}
                      onChange={(e) =>
                        handleChange(index, "title", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    />
                  </div>

                  {/* Category - Dropdown from scopes */}
                  <div>
                    <label className="font-semibold block mb-1">Category</label>
                    <select
                      value={ticket.category || ""}
                      onChange={(e) =>
                        handleChange(index, "category", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    >
                      <option value="">Select Category</option>
                      {scopes.map((scope) => (
                        <option key={scope._id || scope.name} value={scope.name}>
                          {scope.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email - Plain text input beside Category */}
                  <div>
                    <label className="font-semibold block mb-1">Email</label>
                    <input
                      type="email"
                      value={ticket.email || ""}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                      placeholder="Ticket email"
                    />
                  </div>

                  {/* Summary & Resolution Path Side-by-Side on Desktop */}
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
                      value={ticket.assignee?._id || ticket.assignee || ""}
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

        <div className="bg-gray-100 rounded-2xl shadow p-4 md:p-5 mt-4 md:mt-6">
          <h2 className="text-lg md:text-xl font-bold mb-3">Merge Selected Requests</h2>

          <div className="hidden md:grid grid-cols-2 font-semibold mb-2">
            <span>Ticket ID</span>
            <span>Title</span>
          </div>

          <div className="flex flex-col space-y-3 md:space-y-1 md:block">
            {tickets
              .filter((ticket) => ticket.checked)
              .map((ticket) => (
                <div key={ticket._id} className="flex flex-col md:grid md:grid-cols-2 text-sm bg-white md:bg-transparent p-3 md:p-0 rounded border border-gray-200 md:border-none">
                  <span className="font-semibold text-gray-500 md:text-gray-900 md:font-normal mb-1 md:mb-0">{ticket._id}</span>
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
                  console.log(tickets)
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