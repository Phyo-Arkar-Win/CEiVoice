import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";

const FALLBACK_TICKET = {
  id: "Ticket-001",
  title: "My dog's not working",
  category: "IT Support",
  deadline: "March 3, 2026",
  followers: 3,
  creator: "test@gmail.com",
  assignees: ["test@gmail.com", "kfc@gmail.com", "niiga@gmail.com"],
  issue:
    "Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin Admin ",
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
      message: "Put it inside the chicken.",
      type: "Public",
      senderEmail: "someone@gmail.com",
      senderRole: "Assignee",
    },
  ],
};

const COMMENT_TABS = ["Public", "Internal"];

const getAssigneeLabel = (assignee) =>
  typeof assignee === "string" ? assignee : assignee?.email || assignee?.name || "";

const getUserLabel = (value, fallback = "-") =>
  typeof value === "string" ? value : value?.email || value?.name || fallback;

export default function AdminTicketDetails() {
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "admin@gmail.com";

  useEffect(() => {
    setTicket(FALLBACK_TICKET);
    setComments(Array.isArray(FALLBACK_TICKET.comments) ? FALLBACK_TICKET.comments : []);
    setLoading(false);
  }, []);

  const filteredComments = comments.filter(
    (comment) => (comment?.type || "Public").toLowerCase() === activeTab.toLowerCase()
  );

  const followersText = Array.isArray(ticket?.followers)
    ? `${ticket.followers.length} users`
    : `${ticket?.followers ?? 0} users`;

  const creatorText = getUserLabel(ticket?.creator);

  const assigneesText = Array.isArray(ticket?.assignees)
    ? ticket.assignees.map(getAssigneeLabel).filter(Boolean).join(", ")
    : "-";

  const details = [
    { label: "Title", value: ticket?.title || "-" },
    { label: "Category", value: ticket?.category || "-" },
    { label: "Deadline", value: ticket?.deadline || "-" },
    { label: "Followers", value: followersText },
    { label: "Creator", value: creatorText },
    { label: "Assignees", value: assigneesText },
  ];

  const handleSubmitComment = () => {
    const message = commentText.trim();
    if (!message) return;

    const newComment = {
      message,
      type: commentType,
      senderEmail: userEmail,
      senderRole: "Admin",
      id: `temp-${Date.now()}`,
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
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

          <h1 className="text-xl font-semibold text-center mb-6">{ticket?.id || "Ticket"}</h1>

          {loading ? (
            <p className="text-gray-600 text-center text-sm">Loading ticket...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 text-sm space-y-2">
                  {details.map((item) => (
                    <p key={item.label}>
                      <span className="font-semibold">{item.label}:</span> {item.value}
                    </p>
                  ))}
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
                      const role = comment?.senderRole || comment?.role || "Follower";
                      const sender = comment?.senderEmail || comment?.email || "someone@gmail.com";
                      const isAdmin =
                        String(role).toLowerCase() === "admin" ||
                        sender.toLowerCase() === String(userEmail).toLowerCase();

                      return (
                        <div
                          key={comment?.id || index}
                          className={`mb-3 flex ${isAdmin ? "justify-end" : "justify-start"}`}
                        >
                          <div className="max-w-[70%]">
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
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-r-md text-sm"
                  >
                    Submit
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
