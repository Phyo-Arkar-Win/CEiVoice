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
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(false);
  const [expandedRecommendationIds, setExpandedRecommendationIds] = useState([]);


  useEffect(() => {
    (async () => {
      await fetchAssignees();
      await fetchScopes();
      await fetchDraftTickets();
      await fetchRecommendations();
    })();
  }, []);

  // Fetch assignees from backend
  const fetchAssignees = async () => {
    try {
      const res = await api.get("/admin/assignees");
      const list = res.data.data || res.data;
      setAssignees(list);
      return list;
    } catch (err) {
      console.error("Error fetching assignees:", err);
      return [];
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
        issue: ticket.issue,
        summary: ticket.summary,
        category: ticket.category,
        resolution_path: ticket.resolution_path,
        deadline: ticket.deadline,

        assignee: ticket.assignee
        ? ticket.assignee
        : undefined,
      };

      // remove undefined values so only changed fields are sent
      Object.keys(updates).forEach(
        (key) => updates[key] === undefined && delete updates[key]
      );

      await api.patch(`/tickets/${encodeURIComponent(ticket._id)}`, updates);

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
        assignee: ticket.assignees?.[0]?.name || ticket.suggested_assignee || "",
      }));

      setTickets(formatted);
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get("/tickets/drafts/mergeRecommendations");
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error("Error fetching AI recommendations:", err);
      setRecommendationsError(true);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Toggle checkbox
  const toggleCheck = (index) => {
    toggleTicketSelection(tickets[index]._id);
  };

  const toggleTicketSelection = (ticketId) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket._id === ticketId
          ? { ...ticket, checked: !ticket.checked }
          : ticket
      )
    );
  };

  // Expand ticket
  const toggleExpand = (index) => {
    const updated = [...tickets];
    updated[index].expanded = !updated[index].expanded;
    setTickets(updated);
  };

  const toggleRecommendationExpand = (ticketId) => {
    setExpandedRecommendationIds((currentIds) =>
      currentIds.includes(ticketId)
        ? currentIds.filter((id) => id !== ticketId)
        : [...currentIds, ticketId]
    );
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
      console.log("I'm in")
      const res = await api.put(`/tickets/${encodeURIComponent(ticketId)}`, {
        title: ticket.title,
        summary: ticket.summary,
        category: ticket.category,
        resolution_path: ticket.resolution_path,
        deadline: ticket.deadline,
        assignees: ticket.assignee,
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

        <section className="bg-orange-50 border border-orange-200 rounded-2xl shadow-sm p-4 md:p-6 mb-4 w-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                AI assistant
              </p>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Recommendations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Related drafts that may be handled together.
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">✦</span>
          </div>

          {recommendationsLoading && (
            <p className="text-sm text-gray-600">Checking your draft tickets...</p>
          )}

          {!recommendationsLoading && recommendationsError && (
            <p className="text-sm text-red-700">
              Recommendations are temporarily unavailable.
            </p>
          )}

          {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
            <p className="text-sm text-gray-600">
              No related draft tickets found right now.
            </p>
          )}

          {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
            <div className="space-y-3">
              {recommendations.map(({ ticket, relatedTickets, mergedTicket }) => {
                const recommendedTickets = [ticket, ...relatedTickets];

                return (
                <div key={ticket._id} className="bg-white border border-orange-100 rounded-xl p-3 md:p-4">
                  <div className="space-y-3">
                    {recommendedTickets.map((recommendedTicket, index) => {
                      const recommendationId = String(recommendedTicket._id);
                      const draftTicket = tickets.find(
                        (currentTicket) => String(currentTicket._id) === recommendationId
                      );
                      const isExpanded = expandedRecommendationIds.includes(recommendationId);

                      return (
                        <div key={recommendationId} className="border-b border-orange-100 last:border-b-0 pb-3 last:pb-0">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={draftTicket?.checked || false}
                              onChange={() => toggleTicketSelection(recommendedTicket._id)}
                              className="w-5 h-5 flex-shrink-0 mt-1"
                              aria-label={`Select ${recommendedTicket.title || "ticket"} for merging`}
                            />
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleRecommendationExpand(recommendationId)}
                                className="font-semibold text-left text-gray-900 hover:text-orange-600 break-words"
                              >
                                {recommendedTicket.title || "Untitled ticket"}
                              </button>
                            </div>
                            {index > 0 && (
                              <span className="text-orange-700 font-semibold text-sm whitespace-nowrap">
                                {Math.round((recommendedTicket.similarityScore || 0) * 100)}% match
                              </span>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="ml-8 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="md:col-span-2">
                                <p className="font-semibold">Issue</p>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                                  {recommendedTicket.issue || "No issue provided"}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">Summary</p>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                                  {recommendedTicket.summary || "No summary provided"}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">Category</p>
                                <p className="mt-1 text-gray-700 break-words">
                                  {recommendedTicket.category || "No category provided"}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="font-semibold">Resolution Path</p>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                                  {Array.isArray(recommendedTicket.resolution_path)
                                    ? recommendedTicket.resolution_path.join("\n")
                                    : recommendedTicket.resolution_path || "No resolution path provided"}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">Email</p>
                                <p className="mt-1 text-gray-700 break-words">
                                  {recommendedTicket.email || "No email provided"}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">Deadline</p>
                                <p className="mt-1 text-gray-700">
                                  {recommendedTicket.deadline
                                    ? new Date(recommendedTicket.deadline).toLocaleDateString()
                                    : "No deadline provided"}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">Assignee</p>
                                <p className="mt-1 text-gray-700 break-words">
                                  {recommendedTicket.assignee || "No assignee provided"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {mergedTicket && (
                    <div className="mt-4 border-t border-orange-100 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                        Suggested merged draft
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 break-words">
                        {mergedTicket.title || "Untitled recommendation"}
                      </p>
                      <p className="mt-2 text-sm text-gray-700 break-words">
                        {mergedTicket.issue || "No issue summary provided"}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 break-words">
                        {mergedTicket.summary || "No summary provided"}
                      </p>
                      {Array.isArray(mergedTicket.resolution_path) && (
                        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                          {mergedTicket.resolution_path.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </section>

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

                  {/* Issue - Full Width */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="font-semibold block mb-1">Issue</label>
                    <textarea
                      value={ticket.issue || ""}
                      onChange={(e) =>
                        handleChange(index, "issue", e.target.value)
                      }
                      className="w-full h-28 border border-orange-400 rounded-xl px-4 py-2 resize-none"
                      placeholder="User's issue"
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
                      value={ticket.assignee || ""}
                      onChange={(e) =>
                        handleChange(index, "assignee", e.target.value)
                      }
                      className="w-full border border-orange-400 rounded-full px-4 py-2"
                    >
                      <option value="">Select Assignee</option>

                      {assignees.map((person) => (
                        <option key={person._id} value={person.name}>
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
                      suggestedAssignee: res.data.suggestedAssignee,
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
              {merging ? "Merging..." : "+ Merge Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}