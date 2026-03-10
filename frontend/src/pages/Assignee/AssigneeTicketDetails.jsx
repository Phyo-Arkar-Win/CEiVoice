import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";

export default function Assignee_Ticket_Details() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("New");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "assignee@gmail.com";


  const getAssigneeLabel = (assignee) =>
    typeof assignee === "string" ? assignee : assignee?.email || assignee?.name || "";

  const getUserLabel = (value, fallback = "-") =>
    typeof value === "string" ? value : value?.email || value?.name || fallback;

  const applyTicketData = (data) => {
    setTicket(data);
    setComments(Array.isArray(data.comments) ? data.comments : []);
    setStatus(data.status || "New");
    setSelectedAssignee(getAssigneeLabel(data.assignees?.[0]));
  };

  useEffect(() => {
    applyTicketData(fallbackTicket);
    setLoading(false);
  }, []);

  const assigneeOptions = useMemo(() => {
    if (!Array.isArray(ticket?.assignees)) return [];
    return ticket.assignees.map(getAssigneeLabel).filter(Boolean);
  }, [ticket]);

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
  const commentTabs = ["Public", "Internal"];

  const handleSaveTicket = () => {
    setTicket((prev) =>
      prev
        ? {
            ...prev,
            status,
            assignees: selectedAssignee ? [selectedAssignee] : prev.assignees,
          }
        : prev
    );
  };

  const handleSubmitComment = () => {
    const message = commentText.trim();
    if (!message) return;
    const newComment = {
      message,
      type: commentType,
      senderEmail: userEmail,
      senderRole: "Assignee",
      id: `temp-${Date.now()}`,
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
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

          <h1 className="text-xl font-semibold text-center mb-6">{fallbackTicket.id}</h1>

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
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1 rounded-md text-sm"
                >
                  Save
                </button>
              </div>

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
                      const role = comment?.senderRole || comment?.role || "Follower";
                      const sender = comment?.senderEmail || comment?.email || "someone@gmail.com";
                      const isAssignee =
                        String(role).toLowerCase() === "assignee" ||
                        sender.toLowerCase() === String(userEmail).toLowerCase();

                      return (
                        <div
                          key={comment?.id || index}
                          className={`mb-3 flex ${isAssignee ? "justify-end" : "justify-start"}`}
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
