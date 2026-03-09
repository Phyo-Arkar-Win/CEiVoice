import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "@/api/axios";

export default function Assignee_Ticket_Details() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId: routeTicketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("New");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const ticketId =
    routeTicketId ||
    new URLSearchParams(location.search).get("ticketId") ||
    location.state?.ticketId ||
    "Ticket-001";

  const fallbackTicket = {
    title: "My mouse not working",
    category: "IT Support",
    deadline: "March 3, 2026",
    followers: 3,
    creator: "test@gmail.com",
    assignees: ["test@gmail.com"],
    issue:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lacus nisi, sodales et justo nec, lacinia semper sapien. Cras aliquet lectus magna, quis porttitor velit interdum non.",
    status: "New",
    comments: [
      {
        id: "c1",
        message: "I cannot use mouse.",
        type: "Public",
        senderEmail: "someone@gmail.com",
        senderRole: "Follower",
      },
      {
        id: "c2",
        message: "Plug it in again.",
        type: "Public",
        senderEmail: "someone@gmail.com",
        senderRole: "Assignee",
      },
    ],
  };

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/tickets/${ticketId}`);
        const data = res?.data?.ticket || res?.data || fallbackTicket;

        setTicket(data);
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setStatus(data.status || "New");

        const firstAssignee = Array.isArray(data.assignees) ? data.assignees[0] : "";
        setSelectedAssignee(
          typeof firstAssignee === "string"
            ? firstAssignee
            : firstAssignee?.email || firstAssignee?.name || ""
        );
      } catch (err) {
        setTicket(fallbackTicket);
        setComments(fallbackTicket.comments);
        setStatus(fallbackTicket.status);
        setSelectedAssignee(fallbackTicket.assignees[0]);
        setError(err?.response?.data?.message || "Using sample ticket data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const assigneeOptions = useMemo(() => {
    if (!ticket?.assignees || !Array.isArray(ticket.assignees)) return [];
    return ticket.assignees.map((assignee) => {
      if (typeof assignee === "string") return assignee;
      return assignee?.email || assignee?.name || "";
    });
  }, [ticket]);

  const filteredComments = comments.filter(
    (comment) => (comment?.type || "Public").toLowerCase() === activeTab.toLowerCase()
  );

  const followersText = Array.isArray(ticket?.followers)
    ? `${ticket.followers.length} users`
    : `${ticket?.followers ?? 0} users`;

  const creatorText =
    typeof ticket?.creator === "string"
      ? ticket.creator
      : ticket?.creator?.email || ticket?.creator?.name || "-";

  const assigneesText = Array.isArray(ticket?.assignees)
    ? ticket.assignees
        .map((assignee) => (typeof assignee === "string" ? assignee : assignee?.email || assignee?.name || ""))
        .filter(Boolean)
        .join(", ")
    : "-";

  const handleSaveTicket = async () => {
    setSaving(true);
    try {
      await api.put(`/api/tickets/${ticketId}`, {
        status,
        assignee: selectedAssignee,
      });
    } catch (_err) {
      // Keep UI functional even when backend update fails.
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const payload = {
      message: commentText.trim(),
      type: commentType,
    };

    try {
      const res = await api.post(`/api/tickets/${ticketId}/comments`, payload);
      const newComment = res?.data?.comment || {
        ...payload,
        senderEmail: user?.email || "assignee@gmail.com",
        senderRole: "Assignee",
        id: `temp-${Date.now()}`,
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (_err) {
      const optimisticComment = {
        ...payload,
        senderEmail: user?.email || "assignee@gmail.com",
        senderRole: "Assignee",
        id: `temp-${Date.now()}`,
      };
      setComments((prev) => [...prev, optimisticComment]);
      setCommentText("");
    } finally {
      setSubmittingComment(false);
    }
  };

return (
  <div className="min-h-screen flex bg-gray-100">
    <AssigneeNavbar />

    <div className="flex-1 p-4 md:p-6">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">

        <button
          onClick={() => navigate("/assignee_dashboard")}
          className="text-orange-500 text-lg hover:text-orange-600 mb-2"
        >
          ← Back
        </button>

        <h1 className="text-xl font-semibold text-center mb-6">{ticketId}</h1>

        {loading ? (
          <p className="text-gray-600 text-center text-sm">Loading ticket...</p>
        ) : (
          <>
            {error && (
              <p className="text-sm text-gray-500 mb-4">{error}</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 text-sm space-y-2">

                <p>
                  <span className="font-semibold">Title:</span> {ticket?.title || "-"}
                </p>

                <p>
                  <span className="font-semibold">Category:</span> {ticket?.category || "-"}
                </p>

                <p>
                  <span className="font-semibold">Deadline:</span> {ticket?.deadline || "-"}
                </p>

                <p>
                  <span className="font-semibold">Followers:</span> {followersText}
                </p>

                <p>
                  <span className="font-semibold">Creator:</span> {creatorText}
                </p>

                <p>
                  <span className="font-semibold">Assignees:</span> {assigneesText}
                </p>

              </div>

              <div>

                <label className="font-semibold text-sm block mb-1">
                  Status
                </label>

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

                <label className="font-semibold text-sm">
                  Reassign to
                </label>

                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="border border-gray-400 rounded-md px-3 py-1 text-sm min-w-[200px]"
                >
                  <option value="">Select Assignee</option>

                  {assigneeOptions.map((assignee, index) => (
                    <option key={`${assignee}-${index}`} value={assignee}>
                      {assignee}
                    </option>
                  ))}

                </select>

              </div>

              <button
                onClick={handleSaveTicket}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1 rounded-md text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>

            </div>

            <div className="border-t border-gray-300 mt-8 pt-6">

              <h2 className="text-lg font-semibold mb-3">Comments</h2>

              <div className="flex gap-2">

                <button
                  onClick={() => setActiveTab("Public")}
                  className={`px-3 py-1 text-sm rounded-t border ${
                    activeTab === "Public"
                      ? "bg-white border-orange-500"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  Public
                </button>

                <button
                  onClick={() => setActiveTab("Internal")}
                  className={`px-3 py-1 text-sm rounded-t border ${
                    activeTab === "Internal"
                      ? "bg-white border-orange-500"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  Internal
                </button>

              </div>

              <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">

                {filteredComments.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No {activeTab.toLowerCase()} comments yet.
                  </p>
                ) : (
                  filteredComments.map((comment, index) => {

                    const role =
                      comment?.senderRole || comment?.role || "Follower";

                    const sender =
                      comment?.senderEmail ||
                      comment?.email ||
                      "someone@gmail.com";

                    const isAssignee =
                      String(role).toLowerCase() === "assignee" ||
                      sender.toLowerCase() ===
                        String(user?.email || "").toLowerCase();

                    return (
                      <div
                        key={comment?.id || index}
                        className={`mb-3 flex ${
                          isAssignee ? "justify-end" : "justify-start"
                        }`}
                      >

                        <div className={`max-w-[70%]`}>

                          <p className="text-xs text-gray-600 mb-1">
                            {sender} | {role}
                          </p>

                          <div className="bg-gray-200 rounded-md px-3 py-1 text-sm">
                            {comment?.message}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>

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
                  disabled={submittingComment}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-r-md text-sm disabled:opacity-60"
                >
                  {submittingComment ? "Submitting..." : "Submit"}
                </button>

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  </div>
);





  return (
    <div className="min-h-screen flex bg-gray-100">
      <AssigneeNavbar />

      <div className="flex-1 p-5 md:p-6">
        <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-sm p-6 md:p-8">
          <button
            onClick={() => navigate("/assignee_dashboard")}
            className="text-orange-500 text-4xl hover:text-orange-600 transition mb-2"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-semibold text-center mb-8">{ticketId}</h1>

          {loading ? (
            <p className="text-gray-600 text-center">Loading ticket...</p>
          ) : (
            <>
              {error ? <p className="text-sm text-gray-500 mb-4">{error}</p> : null}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 text-2xl space-y-2.5 leading-tight">
                  <p>
                    <span className="font-semibold">Title:</span> {ticket?.title || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span> {ticket?.category || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Deadline:</span> {ticket?.deadline || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Followers:</span> {followersText}
                  </p>
                  <p>
                    <span className="font-semibold">Creator:</span> {creatorText}
                  </p>
                  <p>
                    <span className="font-semibold">Assignees:</span> {assigneesText}
                  </p>
                </div>

                <div className="lg:col-span-1">
                  <label className="font-semibold text-2xl block mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-500 rounded-xl px-4 py-2 text-xl leading-none outline-none max-w-[230px]"
                  >
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-2xl leading-tight">
                  <span className="font-semibold">Issue:</span> {ticket?.issue || "-"}
                </p>
              </div>

              <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="font-semibold text-2xl">Reassign to</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="border border-gray-500 rounded-xl px-4 py-2 text-xl leading-none outline-none min-w-[230px]"
                  >
                    <option value="">Select Assignee</option>
                    {assigneeOptions.map((assignee, index) => (
                      <option key={`${assignee}-${index}`} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveTicket}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-2 rounded-xl text-xl w-fit disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              <div className="border-t border-gray-300 mt-8 pt-6">
                <h2 className="text-4xl font-semibold mb-4">Comments</h2>

                <div className="flex gap-2 mb-0">
                  <button
                    onClick={() => setActiveTab("Public")}
                    className={`px-4 py-1 rounded-t-lg border text-lg leading-none ${
                      activeTab === "Public"
                        ? "bg-white border-orange-500 text-black"
                        : "bg-gray-200 border-gray-300 text-gray-700"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setActiveTab("Internal")}
                    className={`px-4 py-1 rounded-t-lg border text-lg leading-none ${
                      activeTab === "Internal"
                        ? "bg-white border-orange-500 text-black"
                        : "bg-gray-200 border-gray-300 text-gray-700"
                    }`}
                  >
                    Internal
                  </button>
                </div>

                <div className="border border-gray-300 bg-white rounded-b-xl rounded-tr-xl p-4 h-[280px] overflow-y-auto">
                  {filteredComments.length === 0 ? (
                    <p className="text-gray-500 text-lg">No {activeTab.toLowerCase()} comments yet.</p>
                  ) : (
                    filteredComments.map((comment, index) => {
                      const role = comment?.senderRole || comment?.role || "Follower";
                      const sender = comment?.senderEmail || comment?.email || "Someone@gmail.com";
                      const isAssignee =
                        String(role).toLowerCase() === "assignee" ||
                        sender.toLowerCase() === String(user?.email || "").toLowerCase();

                      return (
                        <div
                          key={comment?.id || index}
                          className={`mb-4 flex ${isAssignee ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${isAssignee ? "text-right" : "text-left"}`}>
                            <p className="text-lg mb-1">
                              {sender} | {role}
                            </p>
                            <div className="inline-block bg-gray-200 rounded-md px-4 py-2 text-2xl leading-none">
                              {comment?.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 flex flex-col lg:flex-row gap-0">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter the comment to post it"
                    className="flex-1 border border-orange-400 rounded-l-xl lg:rounded-r-none rounded-r-xl px-5 py-3 text-xl outline-none"
                  />

                  <div className="flex">
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value)}
                      className="border-y border-l border-gray-300 px-4 py-3 text-xl outline-none min-w-[140px]"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Public">Public</option>
                    </select>

                    <button
                      onClick={handleSubmitComment}
                      disabled={submittingComment}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-r-xl text-xl disabled:opacity-60"
                    >
                      {submittingComment ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
