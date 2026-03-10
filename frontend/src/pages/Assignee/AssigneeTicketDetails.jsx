import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
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

export default function Assignee_Ticket_Details() {
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();
  const ticketId = routeTicketId || location.state?.ticketId || "";
  const initialTicket = location.state?.ticket || null;

  const [collapsed, setCollapsed] = useState(false);

  const [ticket, setTicket] = useState(initialTicket);
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);
  const [status, setStatus] = useState("New");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "assignee@gmail.com";

  const getUserLabel = (value, fallback = "-") => {
    if (!value) return fallback;
    if (typeof value === "string") {
      return isMongoId(value) ? fallback : value;
    }
    return value?.email || value?.name || fallback;
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

  const getCommentRole = (comment) =>
    comment?.role || comment?.senderRole || (commentType === "Internal" ? "Assignee" : "User");

  useEffect(() => {
    const fetchTicketAndComments = async () => {
      if (!ticketId) {
        setErrorMessage("Missing ticket id. Open this page from the assignee dashboard with a valid database ticket id.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");
        const response = await api.get(`/assignee/ticketDetailsAsAdminOrAssignee/${ticketId}`);
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
        setStatus(ticketData.status || "New");
        setCommentError("");

        const firstAssignee = ticketData.assignees?.[0];
        const assigneeLabel = getAssigneeLabel(firstAssignee);
        setSelectedAssignee(assigneeLabel || "");
      } catch (error) {
        console.error("Error fetching ticket and comments:", error);
        const backendMessage = error?.response?.data?.message;
        setErrorMessage(
          backendMessage ||
            (isMongoId(ticketId)
              ? "Failed to load ticket details."
              : "Failed to load ticket details. The current route/state ticket id does not match the backend findById contract.")
        );
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketAndComments();
    }
  }, [ticketId]);

  const assigneeOptions = useMemo(() => {
    if (!Array.isArray(ticket?.assignees)) return [];
    return ticket.assignees.map(getAssigneeLabel).filter(Boolean);
  }, [ticket]);

  const filteredComments = activeTab === "Public" ? publicComments : internalComments;

  const formatDeadline = (deadline) => {
    if (!deadline) return "-";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;
    return date.toLocaleDateString();
  };

  const followersText = Array.isArray(ticket?.followers)
    ? `${ticket.followers.length} users`
    : `${ticket?.followers ?? 0} users`;

  const creatorFallback = ticket?.email ? ticket.email.split("@")[0] : "-";
  const creatorText = getUserLabel(ticket?.creator, creatorFallback);

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
  const commentTabs = ["Public", "Internal"];

  const handleSaveTicket = async () => {
    setSaveMessage("");

    if (!ticket?._id) {
      setSaveMessage("Cannot save because the ticket was not loaded from a valid backend record.");
      return;
    }

    setSaving(true);
    try {
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              status,
              assignees: selectedAssignee ? [selectedAssignee] : prev.assignees,
            }
          : prev
      );
      setSaveMessage("Updated locally only.");
    } finally {
      setSaving(false);
    }
  };

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

      const newComment = {
        ...response.data.comment,
        user: response.data.comment?.user || {
          email: response.data.email || userEmail,
          name: response.data.name || user?.name,
        },
        role: response.data.role || user?.role || "assignee",
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
      <AssigneeNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 p-4 md:p-6 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <button
            onClick={() => navigate("/assignee_dashboard")}
            className="text-orange-500 text-lg hover:text-orange-600 mb-2"
          >
            ← Back
          </button>

          <h1 className="text-xl font-semibold text-center mb-6">{ticket?.title || ticket?._id || "Ticket-001"}</h1>

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
                  <label className="font-semibold text-sm block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-400 rounded-md px-3 py-1 text-sm max-w-[200px]"
                  >
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm">
                  <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                </p>
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="font-semibold text-sm">Reassign to</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="border border-gray-400 rounded-md px-3 py-1 text-sm min-w-[200px]"
                  >
                    {assigneeOptions.map((assignee, index) => (
                      <option key={`${assignee}-${index}`} value={assignee}>
                        {assignee}
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

              {saveMessage ? (
                <p className="mt-3 text-sm text-amber-700">{saveMessage}</p>
              ) : null}

              <div className="border-t border-gray-300 mt-8 pt-6">
                <h2 className="text-lg font-semibold mb-3">Comments</h2>

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

                <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">
                  {filteredComments.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No {activeTab.toLowerCase()} comments yet.
                    </p>
                  ) : (
                    filteredComments.map((comment, index) => {
                      const sender = getCommentSender(comment);
                      const role = getCommentRole(comment);

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
                              {comment?.comment}
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
