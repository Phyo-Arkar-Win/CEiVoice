import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "@/api/axios";

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || "").trim());

const getAssigneeLabel = (assignee) => {
  if (!assignee) return "";
  if (typeof assignee === "string") {
    return isMongoId(assignee) ? "Unknown assignee" : assignee;
  }
  if (assignee?.name) return assignee.name;
  if (assignee?.email) return assignee.email.split("@")[0];
  return "Unknown assignee";
};

const COMMENT_TABS = ["Public", "Internal"];

export default function AdminTicketDetails() {
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();
  const ticketId = decodeURIComponent(routeTicketId || location.state?.ticketId || "");
  const initialTicket = location.state?.ticket || null;

  const [ticket, setTicket] = useState(initialTicket);
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "admin@gmail.com";

  const getUserLabel = (value, fallback = "-") => {
    if (!value) return fallback;
    if (typeof value === "string") {
      return isMongoId(value) ? fallback : value;
    }
    return value?.name || value?.email || fallback;
  };

  const getCommentSender = (comment) => {
    const commentUser = comment?.user;

    if (commentUser && typeof commentUser === "object") {
      if (commentUser.name) return commentUser.name;
      if (commentUser.email) return commentUser.email;
    }

    if (typeof commentUser === "string" && !isMongoId(commentUser)) {
      return commentUser;
    }

    return comment?.email || comment?.senderEmail || comment?.name || "Unknown user";
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "-";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchTicketAndComments = async () => {
      if (!ticketId) {
        setErrorMessage("Missing ticket id.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        const response = await api.get(`/assignee/ticketDetailsAsAdminOrAssignee/${encodeURIComponent(ticketId)}`);
        const ticketData = response.data.ticket;

        if (!ticketData) {
          setErrorMessage(
            isMongoId(ticketId)
              ? "Ticket details request returned no ticket."
              : "This page is receiving a display ticket id instead of the database _id required by the backend."
          );
          return;
        }

        setTicket(ticketData);
        setPublicComments(Array.isArray(response.data.publicComments) ? response.data.publicComments : []);
        setInternalComments(Array.isArray(response.data.internalComments) ? response.data.internalComments : []);
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

  const assigneeOptions = useMemo(() => {
    if (!Array.isArray(ticket?.assignees)) return [];
    return ticket.assignees.map(getAssigneeLabel).filter(Boolean);
  }, [ticket]);

  const filteredComments = activeTab === "Public" ? publicComments : internalComments;

  const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
  const creatorText = getUserLabel(ticket?.creator, creatorFallback);

  const followersText = Array.isArray(ticket?.followers)
    ? `${ticket.followers.length} users`
    : `${ticket?.followers ?? 0} users`;

  const assigneesText = Array.isArray(ticket?.assignees)
    ? ticket.assignees.map(getAssigneeLabel).filter(Boolean).join(", ")
    : "-";

  const details = [
    { label: "Title", value: ticket?.title || "-" },
    { label: "Category", value: ticket?.category || "-" },
    { label: "Deadline", value: formatDeadline(ticket?.deadline) },
    { label: "Followers", value: followersText },
    { label: "Creator", value: creatorText },
    { label: "Assignees", value: assigneesText },
  ];

  const handleSubmitComment = async () => {
    const message = commentText.trim();
    if (!message) return;

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const response = await api.post("/admin/commentAsAdminOrAssignee", {
        ticketId: ticket?._id || ticketId,
        commentText: message,
        visibility: commentType,
      });

      const newComment = {
        ...response.data.comment,
        user: response.data.comment?.user || {
          email: userEmail,
          name: user?.name,
        },
        role: response.data.role || user?.role || "admin",
        visibility: commentType,
      };

      if (commentType === "Public") {
        setPublicComments((prev) => [newComment, ...prev]);
      } else {
        setInternalComments((prev) => [newComment, ...prev]);
      }

      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentError(error?.response?.data?.message || "Failed to submit comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminNavbar />

      <div className="flex-1 transition-all duration-300 p-4 md:p-6">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <button
            onClick={() => navigate("/tickets")}
            className="text-orange-500 text-lg hover:text-orange-600 mb-2"
          >
            ← Back
          </button>

          <h1 className="text-xl font-semibold text-center mb-6">{ticket?.id || ticket?._id || "Ticket"}</h1>

          {loading ? (
            <p className="text-gray-600 text-center text-sm">Loading ticket...</p>
          ) : (
            <>
              {errorMessage ? (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 text-sm space-y-2">
                  {details.map((item) => (
                    <p key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.value}
                    </p>
                  ))}
                </div>

                <div>
                  <label className="font-semibold text-sm block mb-1">Reassign to</label>
                  <select
                    value=""
                    readOnly
                    className="w-full border border-gray-400 rounded-md px-3 py-1 text-sm max-w-[220px]"
                  >
                    <option>{assigneeOptions[0] || "No assignee"}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm">
                  <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                </p>
              </div>

              <div className="border-t border-gray-300 mt-8 pt-6">
                <h2 className="text-lg font-semibold mb-3">Comments</h2>

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

                <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">
                  {filteredComments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} comments yet.</p>
                  ) : (
                    filteredComments.map((comment, index) => {
                      const sender = getCommentSender(comment);
                      const role = comment?.role || comment?.senderRole || "Admin";
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

                {commentError ? (
                  <p className="mt-3 text-sm text-red-600">{commentError}</p>
                ) : null}

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
