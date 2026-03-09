import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import UserNavbar from "@/components/UserNavbar";
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

export default function UserTicketDetails() {
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();
  const ticketId = decodeURIComponent(routeTicketId || location.state?.ticketId || "");
  const initialTicket = location.state?.ticket || null;

  const [ticket, setTicket] = useState(initialTicket);
  const [publicComments, setPublicComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "user@gmail.com";

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
    { label: "Creator", value: creatorText },
    { label: "Followers", value: followersText },
    { label: "Assignees", value: assigneesText },
  ];

  const handleSubmitComment = async () => {
    const message = commentText.trim();
    if (!message) return;

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const response = await api.post("/user/submitComment", {
        ticketId: ticket?._id || ticketId,
        commentText: message,
      });

      const newComment = {
        ...response.data.comment,
        user: response.data.comment?.user || {
          email: userEmail,
          name: user?.name,
        },
        role: response.data.role || user?.role || "user",
        visibility: "Public",
      };

      setPublicComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentError(error?.response?.data?.message || "Failed to submit comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <UserNavbar />

      <div className="max-w-5xl mx-auto mt-6 px-4 pb-8">
        <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <button
              onClick={() => navigate("/track")}
              className="text-orange-500 text-sm hover:text-orange-600 mb-3"
            >
              ← Back
            </button>

            <h1 className="text-xl font-semibold mb-4">
              {ticket?.id || ticket?._id || "Ticket-001"}
            </h1>

            {loading ? (
              <p className="text-gray-600 text-sm">Loading ticket...</p>
            ) : (
              <>
                {errorMessage ? (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                  {details.map((item) => (
                    <p key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.value}
                    </p>
                  ))}

                  <p className="md:col-span-2">
                    <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-gray-300 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Comments</h2>
              <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-700">
                Public only
              </span>
            </div>

            <div className="border border-orange-400 bg-gray-100 rounded-xl p-4 h-[240px] overflow-y-auto">
              {publicComments.length === 0 ? (
                <p className="text-gray-500 text-sm">No public comments yet.</p>
              ) : (
                publicComments.map((comment, index) => {
                  const sender = getCommentSender(comment);
                  const role = comment?.role || comment?.senderRole || "User";
                  const isUser =
                    sender.toLowerCase() === String(userEmail).toLowerCase() ||
                    sender.toLowerCase() === String(user?.name || "").toLowerCase();

                  return (
                    <div
                      key={comment?._id || comment?.id || index}
                      className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[65%]">
                        <p className="text-xs text-gray-700 mb-1">
                          {sender} | {role}
                        </p>
                        <div className="bg-gray-300 rounded px-3 py-2 text-sm">
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

            <div className="mt-4 flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter the comment to post it"
                className="flex-1 border border-orange-400 rounded-l-lg px-3 py-2 text-sm outline-none"
              />

              <button
                onClick={handleSubmitComment}
                disabled={commentSubmitting || !ticket}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-r-lg text-sm"
              >
                {commentSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
