import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "@/components/UserNavbar";

const FALLBACK_TICKET = {
  id: "Ticket-001",
  title: "My mouse not working",
  category: "Hardware",
  deadline: "March 3, 2026",
  followers: 3,
  creator: "linnheinhtet@gmail.com",
  assignees: ["someone@gmail.com"],
  issue: "My mouse is not working. I've tried plugging in and out.",
  comments: [
    {
      id: "c1",
      message: "I cannot use mouse.",
      type: "Public",
      senderEmail: "linnheinhtet@gmail.com",
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

const COMMENT_TABS = ["Public", "Internal"];

const getAssigneeLabel = (assignee) =>
  typeof assignee === "string" ? assignee : assignee?.email || assignee?.name || "";

const getUserLabel = (value, fallback = "-") =>
  typeof value === "string" ? value : value?.email || value?.name || fallback;

export default function UserTicketDetails() {
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Public");
  const [activeTab, setActiveTab] = useState("Public");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "user@gmail.com";

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
    { label: "Creator", value: creatorText },
    { label: "Followers", value: followersText },
    { label: "Assignee", value: assigneesText },
  ];

  const handleSubmitComment = () => {
    const message = commentText.trim();
    if (!message) return;

    const newComment = {
      message,
      type: commentType,
      senderEmail: userEmail,
      senderRole: "Follower",
      id: `temp-${Date.now()}`,
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <UserNavbar />

      <div className="max-w-5xl mx-auto mt-6 px-4 pb-8">
        <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-sm overflow-hidden">

          {/* Ticket Section */}
          <div className="p-6">

            <button
              onClick={() => navigate("/track")}
              className="text-orange-500 text-sm hover:text-orange-600 mb-3"
            >
              ← Back
            </button>

            <h1 className="text-xl font-semibold mb-4">
              {ticket?.id || "Ticket-001"}
            </h1>

            {loading ? (
              <p className="text-gray-600 text-sm">Loading ticket...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm">

                {details.map((item) => (
                  <p key={item.label}>
                    <span className="font-semibold">{item.label}:</span> {item.value}
                  </p>
                ))}

                <p className="md:col-span-2">
                  <span className="font-semibold">Issue:</span>{" "}
                  {ticket?.issue || "-"}
                </p>

              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-300 p-6">

            <h2 className="text-lg font-semibold mb-3">Comments</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-2">
              {COMMENT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs rounded-t border ${
                    activeTab === tab
                      ? "bg-white border-orange-500"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Comment Box */}
            <div className="border border-orange-400 bg-gray-100 rounded-xl p-4 h-[240px] overflow-y-auto">

              {filteredComments.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No {activeTab.toLowerCase()} comments yet.
                </p>
              ) : (
                filteredComments.map((comment, index) => {

                  const role = comment?.senderRole || comment?.role || "Follower";
                  const sender =
                    comment?.senderEmail ||
                    comment?.email ||
                    "someone@gmail.com";

                  const isUser =
                    sender.toLowerCase() ===
                    String(userEmail).toLowerCase();

                  return (
                    <div
                      key={comment?.id || index}
                      className={`mb-4 flex ${
                        isUser ? "justify-start" : "justify-end"
                      }`}
                    >

                      <div className="max-w-[65%]">

                        <p className="text-xs text-gray-700 mb-1">
                          {sender} | {role}
                        </p>

                        <div className="bg-gray-300 rounded px-3 py-2 text-sm">
                          {comment?.message}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input */}
            <div className="mt-4 flex items-center">

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter the comment to post it"
                className="flex-1 border border-orange-400 rounded-l-lg px-3 py-2 text-sm outline-none"
              />

              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
                className="border-y border-l border-gray-300 px-2 py-2 text-sm"
              >
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
              </select>

              <button
                onClick={handleSubmitComment}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-r-lg text-sm"
              >
                Submit
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}