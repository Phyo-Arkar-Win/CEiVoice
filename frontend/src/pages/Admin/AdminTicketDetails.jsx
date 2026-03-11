// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/api/axios";

// ─── Constants ───────────────────────────────────────────────────────────────
const COMMENT_TABS = ["Public", "Internal"];

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminTicketDetails() {
  // ── Navigation & Route Params ──────────────────────────────────────────────
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();
  const ticketId = decodeURIComponent(routeTicketId || location.state?.ticketId || "");
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
  const [savedStatus, setSavedStatus] = useState("New");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [allAssignees, setAllAssignees] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);

  // ── Comment State ──────────────────────────────────────────────────────────
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  // ── Current User Info ──────────────────────────────────────────────────────
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "admin@gmail.com";

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

  /** Formats a deadline date string for display. */
  const formatDeadline = (deadline) => {
    if (!deadline) return "-";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleDateString();
  };

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  /** Fetches ticket details and comments on mount. */
  useEffect(() => {
    const fetchTicketAndComments = async () => {
      if (!ticketId) {
        setErrorMessage("Missing ticket id.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        const response = await api.get(`/admin/ticketDetails/${encodeURIComponent(ticketId)}`);
        const ticketData = response.data.ticket;

        if (!ticketData) {
          setErrorMessage("Ticket details request returned no ticket.");
          return;
        }

        setTicket(ticketData);

        // Store all assignees from DB for the reassign dropdown
        const assigneesFromDb = Array.isArray(response.data.assignees) ? response.data.assignees : [];
        setAllAssignees(assigneesFromDb);

        // Merge API-level comments with embedded ticket.comments
        const apiPublic = Array.isArray(response.data.publicComments) ? response.data.publicComments : [];
        const apiInternal = Array.isArray(response.data.internalComments) ? response.data.internalComments : [];

        const embedded = Array.isArray(ticketData.comments) ? ticketData.comments : [];
        const embeddedPublic = embedded.filter((c) => c.type === "Public" || c.visibility === "Public");
        const embeddedInternal = embedded.filter((c) => c.type === "Internal" || c.visibility === "Internal");

        setPublicComments([...apiPublic, ...embeddedPublic].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));
        setInternalComments([...apiInternal, ...embeddedInternal].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));

        // Sync status from backend
        setStatus(ticketData.status || "New");
        setSavedStatus(ticketData.status || "New");

        // Follower count comes from a raw .lean() query to avoid populate issues
        setFollowersCount(response.data.followersCount ?? 0);
        setCommentError("");
      } catch (error) {
        console.error("Error fetching ticket and comments:", error);
        setErrorMessage(error?.response?.data?.message || "Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndComments();
  }, [ticketId]);

  // ─── Computed / Derived Values ─────────────────────────────────────────────

  /** Map all DB assignees into dropdown-friendly options. */
  const assigneeOptions = useMemo(() => {
    if (!allAssignees.length) return [];
    return allAssignees.map((a) => ({ _id: a._id, label: a.name || a.email || 'Unknown' }));
  }, [allAssignees]);

  /** Show public or internal comments based on the active tab. */
  const filteredComments = activeTab === "Public" ? publicComments : internalComments;

  // Creator display – fall back to the email prefix if the user object isn't populated
  const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
  const creatorText = getUserLabel(ticket?.creator, creatorFallback);

  const followersText = `${followersCount} user${followersCount !== 1 ? 's' : ''}`;

  const assigneesText = Array.isArray(ticket?.assignees)
    ? ticket.assignees.map((a) => a?.name || a?.email || 'Unknown').join(", ")
    : "-";

  /** Key-value pairs rendered in the ticket info section. */
  const details = [
    { label: "Title", value: ticket?.title || "-" },
    { label: "Category", value: ticket?.category || "-" },
    { label: "Deadline", value: formatDeadline(ticket?.deadline) },
    { label: "Followers", value: followersText },
    { label: "Creator", value: creatorText },
    { label: "Assignees", value: assigneesText },
  ];

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

      const response = await api.post("/admin/saveTicket", payload);
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
      const response = await api.post("/admin/submitComment", {
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
        role: response.data.role || user?.role || "admin",
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
    <div className="h-screen overflow-hidden">
      <div className="flex bg-gray-200 min-h-screen">
        {/* ── Sidebar Navigation ──────────────────────────────────────────────── */}
        <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* ── Main Content Area ───────────────────────────────────────────────── */}
        <div
          className={`flex-1 transition-all duration-300 p-4 md:p-10 min-w-0 overflow-hidden ${collapsed ? "md:ml-1" : "md:ml-7"
            }`}
        >
          <div className="h-[calc(100vh-100px)] overflow-y-auto pr-2">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
                <button
                  onClick={() => navigate("/tickets")}
                  className="text-orange-500 font-medium hover:text-orange-600 self-start sm:self-auto"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-semibold break-words">
                  {ticket?.title || ticket?._id || "Ticket"}
                </h1>
              </div>

              {loading ? (
                <p className="text-gray-600 text-center text-sm">Loading ticket...</p>
              ) : (
                <div>
                  {/* Error banner */}
                  {errorMessage && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  {/* ── Ticket Details + Panel ─────────────────────────────────── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Detail fields (title, category, deadline, etc.) */}
                    <div className="md:col-span-2 text-sm space-y-2">
                      {details.map((item) => (
                        <p key={item.label} className="break-words">
                          <span className="font-semibold">{item.label}:</span> {item.value}
                        </p>
                      ))}
                    </div>

                    {/* Status dropdown panel */}
                    <div className="flex flex-col">
                      <label className="font-semibold text-sm block mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={savedStatus === 'Solved' || savedStatus === 'Failed'}
                        className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm md:max-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="New">New</option>
                        <option value="Solving">Solving</option>
                        <option value="Solved">Solved</option>
                        <option value="Failed">Failed</option>
                        <option value="Draft">Draft</option>
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
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      <div className="flex-1 w-full">
                        <label className="font-semibold text-sm block mb-1.5">Reassign to</label>
                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-white"
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
                        className="w-full sm:w-auto mt-2 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 h-[38px]"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
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
                      {COMMENT_TABS.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 text-sm rounded-t border ${activeTab === tab
                              ? "bg-white border-orange-500"
                              : "bg-gray-200 border-gray-300 transition-colors"
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Comment list */}
                    <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">
                      {filteredComments.length === 0 ? (
                        <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} comments yet.</p>
                      ) : (
                        filteredComments.map((comment, index) => {
                          const sender = getCommentSender(comment);
                          const role = comment?.user?.role || comment?.role || comment?.senderRole || "Unknown";

                          const isMe =
                            sender.toLowerCase() === String(userEmail).toLowerCase() ||
                            sender.toLowerCase() === String(user?.name || "").toLowerCase();

                          return (
                            <div
                              key={comment?._id || comment?.id || index}
                              className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}
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

                    {/* Comment input bar */}
                    <div className="mt-5">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Enter comment..."
                          className="flex-1 border border-gray-400 focus:border-orange-500 rounded-md px-4 py-2 text-sm outline-none w-full transition-colors"
                        />
                        <div className="flex flex-row gap-3">
                          <select
                            value={commentType}
                            onChange={(e) => setCommentType(e.target.value)}
                            className="w-1/2 sm:w-auto border border-gray-400 rounded-md px-3 py-2 text-sm bg-white outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="Internal">Internal</option>
                            <option value="Public">Public</option>
                          </select>
                          <button
                            onClick={handleSubmitComment}
                            disabled={commentSubmitting || !ticket}
                            className="w-1/2 sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                          >
                            {commentSubmitting ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
