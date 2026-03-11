// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "@/api/axios";

// ─── Component ───────────────────────────────────────────────────────────────
export default function Assignee_Ticket_Details() {
  // ── Navigation & Route Params ──────────────────────────────────────────────
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();
  const finalTicketId = routeTicketId || location.state?.ticketId || "";
  const initialTicket = location.state?.ticket || null;

  // ── UI State ───────────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  // ── Ticket Data State ──────────────────────────────────────────────────────
  const [ticket, setTicket] = useState(initialTicket);
  const [status, setStatus] = useState("New");
  const [savedStatus, setSavedStatus] = useState("New"); // Tracks the last-saved status for transition rules
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [allAssignees, setAllAssignees] = useState([]); // All assignees from DB (for reassign dropdown)
  const [followersCount, setFollowersCount] = useState(0);

  // ── Comment State ──────────────────────────────────────────────────────────
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  // ── Current User Info ──────────────────────────────────────────────────────
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "assignee@gmail.com";

  // ─── Helper Functions ──────────────────────────────────────────────────────

  /** Returns a display label for a user value (object, string, or null). */
  const getUserLabel = (value, fallback = "-") => {
    if (!value) return fallback;
    if (typeof value === "object") return value?.name || value?.email || fallback;
    return String(value);
  };

  /** Extracts the sender display name from a comment object. */
  const getCommentSender = (comment) => {
    const commentUser = comment?.user;

    if (commentUser && typeof commentUser === "object") {
      if (commentUser.name) return commentUser.name;
      if (commentUser.email) return commentUser.email;
    }

    if (typeof commentUser === "string") return commentUser;

    return comment?.email || comment?.senderEmail || comment?.name || "Unknown user";
  };

  /** Extracts the role label from a comment object. */
  const getCommentRole = (comment) =>
    comment?.user?.role || comment?.role || comment?.senderRole || "Unknown";

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  /** Fetches ticket details, all assignees, and comments on mount. */
  useEffect(() => {
    const fetchTicketAndComments = async () => {

  if (!finalTicketId) {
    setErrorMessage("Missing ticket id.");
    setLoading(false);
    return;
  }

  try {

    const response = await api.get(`/assignee/ticketDetails/${finalTicketId}`);

    const ticketData = response.data.ticket;

        setTicket(ticketData);

        // Store all assignees from DB for the reassign dropdown
        const assigneesFromDb = Array.isArray(response.data.assignees) ? response.data.assignees : [];
        setAllAssignees(assigneesFromDb);

        // Resolve names on unpopulated ticket assignees (when populate returns plain IDs)
        if (assigneesFromDb.length && Array.isArray(ticketData.assignees)) {
          ticketData.assignees = ticketData.assignees.map((a) => {
            if (typeof a === 'string' || (a && !a.name && !a.email)) {
              const id = typeof a === 'string' ? a : a._id;
              const found = assigneesFromDb.find((u) => String(u._id) === String(id));
              return found || a;
            }
            return a;
          });
          setTicket({ ...ticketData });
        }

        // Merge API-level comments with embedded ticket.comments
        const apiPublic = Array.isArray(response.data.publicComments) ? response.data.publicComments : [];
        const apiInternal = Array.isArray(response.data.internalComments) ? response.data.internalComments : [];

        const embedded = Array.isArray(ticketData.comments) ? ticketData.comments : [];
        const embeddedPublic = embedded.filter((c) => c.type === "Public" || c.visibility === "Public");
        const embeddedInternal = embedded.filter((c) => c.type === "Internal" || c.visibility === "Internal");

        setPublicComments([...apiPublic, ...embeddedPublic].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));
        setInternalComments([...apiInternal, ...embeddedInternal].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));

        // Sync status and follower count from backend
        setStatus(ticketData.status || "New");
        setSavedStatus(ticketData.status || "New");
        setFollowersCount(response.data.followersCount ?? 0);
        setCommentError("");
      } catch (error) {
        console.error("Error fetching ticket and comments:", error);
        setErrorMessage(error?.response?.data?.message || "Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };

    console.log(finalTicketId)
    if (finalTicketId) {
      fetchTicketAndComments();
    }
  }, [finalTicketId]);

  // ─── Computed / Derived Values ─────────────────────────────────────────────

  /** Map all DB assignees into dropdown-friendly options. */
  const assigneeOptions = useMemo(() => {
    if (!allAssignees.length) return [];
    return allAssignees.map((a) => ({ _id: a._id, label: a.name || a.email || 'Unknown' }));
  }, [allAssignees]);

  /** Show public or internal comments based on the active tab. */
  const filteredComments = activeTab === "Public" ? publicComments : internalComments;

  /** Formats a deadline date string for display. */
  const formatDeadline = (deadline) => {
    if (!deadline) return "-";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleDateString();
  };

  // Creator display – fall back to the email prefix if the user object isn't populated
  const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
  const creatorText = getUserLabel(ticket?.creator, creatorFallback);

  // Assignees and followers text for the detail panel
  const assigneesText = Array.isArray(ticket?.assignees)
    ? ticket.assignees.map((a) => a?.name || a?.email || 'Unknown').join(", ")
    : "-";

  /** Key-value pairs rendered in the ticket info section. */
  const details = [
    { label: "Title", value: ticket?.title || "-" },
    { label: "Category", value: ticket?.category || "-" },
    { label: "Deadline", value: formatDeadline(ticket?.deadline) },
    { label: "Followers", value: `${followersCount} user${followersCount !== 1 ? 's' : ''}` },
    { label: "Creator", value: creatorText },
    { label: "Assignees", value: assigneesText },
  ];

  const commentTabs = ["Public", "Internal"];

  // ─── Event Handlers ────────────────────────────────────────────────────────

  /** Saves the current status and optional reassignment to the backend. */
  const handleSaveTicket = async () => {
    setSaveMessage("");

    if (!ticket?._id) {
      setSaveMessage("Cannot save because the ticket was not loaded from a valid backend record.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ticketId: ticket._id,
        status,
      };

      // Only include reassignment if the assignee dropdown was changed
      if (selectedAssignee) {
        payload.reassignedAssigneeId = selectedAssignee;
      }

      const response = await api.post("/assignee/saveTicket", payload);
      const updatedTicket = response.data.ticket;

      if (updatedTicket) {
        setTicket(updatedTicket);
        setStatus(updatedTicket.status || status);
        setSavedStatus(updatedTicket.status || status);
      }

      setSaveMessage("Ticket updated successfully.");
    } catch (error) {
      console.error("Error saving ticket:", error);
      setSaveMessage(error?.response?.data?.message || "Failed to save ticket.");
    } finally {
      setSaving(false);
    }
  };

  /** Posts a new public or internal comment on this ticket. */
  const handleSubmitComment = async () => {
    const message = commentText.trim();
    if (!message) return;

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const response = await api.post("/assignee/submitComment", {
        ticketId: ticket?._id || ticketId,
        commentText: message,
        visibility: commentType,
      });

      // Build the new comment object for optimistic UI update
      const newComment = {
        ...response.data.comment,
        user: {
          email: userEmail,
          name: response.data.name || user?.name,
        },
        role: response.data.role || user?.role || "assignee",
        visibility: commentType,
      };

      if (commentType === "Public") {
        setPublicComments((prev) => [...prev, newComment]);
      } else {
        setInternalComments((prev) => [...prev, newComment]);
      }

      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentError(error?.response?.data?.message || "Failed to submit comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };


  // ─── JSX Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ── Sidebar Navigation ──────────────────────────────────────────────── */}
      <AssigneeNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div
        className={`flex-1 transition-all duration-300 p-4 md:p-6 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/assignee_dashboard")}
            className="text-orange-500 text-lg hover:text-orange-600 mb-2"
          >
            ← Back
          </button>

          <h1 className="text-xl font-semibold text-center mb-6">
            {ticket?.title || ticket?._id || "Ticket-001"}
          </h1>

          {loading ? (
            <p className="text-gray-600 text-center text-sm">Loading ticket...</p>
          ) : (
            <>
              {/* Error banner */}
              {errorMessage && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* ── Ticket Details + Status ─────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detail fields (title, category, deadline, etc.) */}
                <div className="lg:col-span-2 text-sm space-y-2">
                  {details.map((item) => (
                    <p key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.value}
                    </p>
                  ))}
                </div>

                {/* Status dropdown with transition rules:
                    New    → New, Solving, Solved, Failed
                    Solving → Solving, Solved, Failed
                    Solved / Failed → locked (disabled) */}
                <div>
                  <label className="font-semibold text-sm block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={savedStatus === 'Solved' || savedStatus === 'Failed'}
                    className="w-full border border-gray-400 rounded-md px-3 py-1 text-sm max-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savedStatus === 'New' && (
                      <>
                        <option value="New">New</option>
                        <option value="Solving">Solving</option>
                        <option value="Solved">Solved</option>
                        <option value="Failed">Failed</option>
                      </>
                    )}
                    {savedStatus === 'Solving' && (
                      <>
                        <option value="Solving">Solving</option>
                        <option value="Solved">Solved</option>
                        <option value="Failed">Failed</option>
                      </>
                    )}
                    {(savedStatus === 'Solved' || savedStatus === 'Failed') && (
                      <option value={savedStatus}>{savedStatus}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Issue description */}
              <div className="mt-6">
                <p className="text-sm">
                  <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                </p>
              </div>

              {/* ── Reassign & Save ─────────────────────────────────────────── */}
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="font-semibold text-sm">Reassign to</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="border border-gray-400 rounded-md px-3 py-1 text-sm min-w-[200px]"
                  >
                    <option value="">Select assignee</option>
                    {assigneeOptions.map((assignee) => (
                      <option key={assignee._id} value={assignee._id}>
                        {assignee.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveTicket}
                  disabled={saving || !ticket}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1 rounded-md text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Save feedback message */}
              {saveMessage && (
                <p className="mt-3 text-sm text-amber-700">{saveMessage}</p>
              )}

              {/* ── Comments Section ────────────────────────────────────────── */}
              <div className="border-t border-gray-300 mt-8 pt-6">
                <h2 className="text-lg font-semibold mb-3">Comments</h2>

                {/* Tab buttons: Public / Internal */}
                <div className="flex gap-2">
                  {commentTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 text-sm rounded-t border ${
                        activeTab === tab
                          ? "bg-white border-orange-500"
                          : "bg-gray-200 border-gray-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Comment list */}
                <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">
                  {filteredComments.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No {activeTab.toLowerCase()} comments yet.
                    </p>
                  ) : (
                    filteredComments.map((comment, index) => {
                      const sender = getCommentSender(comment);
                      const role = getCommentRole(comment);

                      // Align own comments to the right, others to the left
                      const isAssignee =
                        sender.toLowerCase() === String(userEmail).toLowerCase() ||
                        sender.toLowerCase() === String(user?.name || "").toLowerCase();

                      return (
                        <div
                          key={comment?._id || index}
                          className={`mb-3 flex ${isAssignee ? "justify-end" : "justify-start"}`}
                        >
                          <div className="max-w-[70%]">
                            <p className="text-xs text-gray-600 mb-1">
                              {sender} | {role}
                            </p>
                            <div className="bg-gray-200 rounded-md px-3 py-1 text-sm">
                              {comment?.comment || comment?.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment error message */}
                {commentError && (
                  <p className="mt-3 text-sm text-red-600">{commentError}</p>
                )}

                {/* Comment input bar: text input + visibility selector + submit */}
                <div className="mt-4 flex">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter the comment to post it"
                    className="flex-1 border border-orange-400 rounded-l-md px-4 py-2 text-sm outline-none"
                  />

                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value)}
                    className="border-y border-l border-gray-300 px-3 text-sm"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Public">Public</option>
                  </select>

                  <button
                    onClick={handleSubmitComment}
                    disabled={commentSubmitting || !ticket}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-r-md text-sm"
                  >
                    {commentSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
