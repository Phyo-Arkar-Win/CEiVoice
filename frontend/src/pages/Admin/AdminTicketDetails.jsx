// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/api/axios";
import { useAuth } from "../../context/AuthContext";

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

  // ── Ticket Data State ──────────────────────────────────────────────────────
  const [ticket, setTicket] = useState(initialTicket);
  const [followersCount, setFollowersCount] = useState(0);
  

  // ── Comment State ──────────────────────────────────────────────────────────
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  // ── UI State ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  // ── Current User Info ──────────────────────────────────────────────────────
  const { user } = useAuth();
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
        const response = await api.get(`/tickets/${ticketId}`);
        const ticketData = response.data.ticket;


        if (!ticketData) {
          setErrorMessage("Ticket details request returned no ticket.");
          return;
        }

        setTicket(ticketData);

        // Merge API-level comments with embedded ticket.comments
        const apiPublic = Array.isArray(response.data.publicComments) ? response.data.publicComments : [];
        const apiInternal = Array.isArray(response.data.internalComments) ? response.data.internalComments : [];

        const embedded = Array.isArray(ticketData.comments) ? ticketData.comments : [];
        const embeddedPublic = embedded.filter((c) => c.type === "Public" || c.visibility === "Public");
        const embeddedInternal = embedded.filter((c) => c.type === "Internal" || c.visibility === "Internal");

        setPublicComments([...apiPublic, ...embeddedPublic].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));
        setInternalComments([...apiInternal, ...embeddedInternal].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)));

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

  /** Show public or internal comments based on the active tab. */
  const filteredComments = activeTab === "Public" ? publicComments : internalComments;

  // Creator display – fall back to the email prefix if the user object isn't populated
  const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
  const creatorText = getUserLabel(ticket?.creator, creatorFallback);

  const followersText = `${followersCount} user${followersCount !== 1 ? 's' : ''}`;

  const assigneesText = (Array.isArray(ticket?.assignees) && ticket.assignees.length > 0 && typeof ticket.assignees[0] === 'object')
    ? ticket.assignees.map((a) => a?.name || a?.email || 'Unknown').join(', ')
    : (ticket?.suggested_assignee || '-');

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
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* ── Sidebar Navigation ──────────────────────────────────────────────── */}
      <AdminNavbar />

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div className="flex-1 transition-all duration-300 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/tickets")}
            className="text-orange-500 text-lg hover:text-orange-600 mb-2"
          >
            ← Back
          </button>

          <h1 className="text-xl font-semibold text-center mb-6">
            {ticket?.title || ticket?._id || "Ticket"}
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

              {/* ── Ticket Details ──────────────────────────────────────────── */}
              <div className="text-sm space-y-2">
                {details.map((item) => (
                  <p key={item.label}>
                    <span className="font-semibold">{item.label}:</span> {item.value}
                  </p>
                ))}
              </div>

              {/* Issue description */}
              <div className="mt-6">
                <p className="text-sm">
                  <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                </p>
              </div>

              {/* ── Comments Section ────────────────────────────────────────── */}
              <div className="border-t border-gray-300 mt-8 pt-6">
                <h2 className="text-lg font-semibold mb-3">Comments</h2>

                {/* Tab buttons: Public / Internal */}
                <div className="flex gap-2">
                  {COMMENT_TABS.map((tab) => (
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
                    <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} comments yet.</p>
                  ) : (
                    filteredComments.map((comment, index) => {
                      const sender = getCommentSender(comment);
                      const role = comment?.user?.role || comment?.role || comment?.senderRole || "Unknown";

                      // Align own comments to the right, others to the left
                      const isAdmin =
                        sender.toLowerCase() === String(userEmail).toLowerCase() ||
                        sender.toLowerCase() === String(user?.name || "").toLowerCase();

                      return (
                        <div
                          key={comment?._id || comment?.id || index}
                          className={`mb-3 flex ${isAdmin ? "justify-end" : "justify-start"}`}
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
