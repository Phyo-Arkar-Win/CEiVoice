// ─── Imports ─────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "@/api/axios";
import { useAuth } from "../../context/AuthContext";

// ─── Component ───────────────────────────────────────────────────────────────
export default function Assignee_Ticket_Details() {
  // ── Navigation & Route Params ──────────────────────────────────────────────
  const navigate = useNavigate();
  const { routeTicketId } = useParams();
  const location = useLocation();

  const ticketId = decodeURIComponent(
    routeTicketId || location.state?.ticketId || ""
  );

  const initialTicket = location.state?.ticket || null;

  // ── UI State ───────────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  // ── Ticket Data State ──────────────────────────────────────────────────────
  const [ticket, setTicket] = useState(initialTicket);

  const [status, setStatus] = useState("");

  // Last successfully saved status
  const [savedStatus, setSavedStatus] = useState("");

  // Selected assignee ID
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // All assignees
  const [allAssignees, setAllAssignees] = useState([]);

  const [followersCount, setFollowersCount] = useState(0);

  // ── Comment State ──────────────────────────────────────────────────────────
  const [publicComments, setPublicComments] = useState([]);
  const [internalComments, setInternalComments] = useState([]);

  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("Internal");
  const [activeTab, setActiveTab] = useState("Public");

  // ── Current User Info ──────────────────────────────────────────────────────
  const { user } = useAuth();

  const userEmail = user?.email || "assignee@gmail.com";

  // ─── Helper Functions ──────────────────────────────────────────────────────

  const getUserLabel = (value, fallback = "-") => {
    if (!value) return fallback;

    if (typeof value === "object") {
      return value?.name || value?.email || fallback;
    }

    return String(value);
  };

  const getAssigneeId = (assignee) => {
    if (!assignee) return "";

    if (typeof assignee === "object") {
      return assignee?._id || assignee?.id || "";
    }

    return String(assignee);
  };

  const getCommentSender = (comment) => {
    const commentUser = comment?.user;

    if (commentUser && typeof commentUser === "object") {
      if (commentUser.name) {
        return commentUser.name;
      }

      if (commentUser.email) {
        return commentUser.email;
      }
    }

    if (typeof commentUser === "string") {
      return commentUser;
    }

    return (
      comment?.email ||
      comment?.senderEmail ||
      comment?.name ||
      "Unknown user"
    );
  };

  const getCommentRole = (comment) =>
    comment?.user?.role ||
    comment?.role ||
    comment?.senderRole ||
    "Unknown";

  // ─── Frontend History Helper ───────────────────────────────────────────────

  const saveFrontendStatusHistory = (
    oldStatus,
    newStatus,
    currentTicket
  ) => {
    try {
      if (oldStatus === newStatus) {
        return;
      }

      const existingHistory = JSON.parse(
        localStorage.getItem("frontendStatusHistory") || "[]"
      );

      const historyRecord = {
        ticketId:
          currentTicket?._id ||
          currentTicket?.id ||
          ticketId,

        ticketName:
          currentTicket?.title ||
          currentTicket?.name ||
          "Unknown Ticket",

        timestamp: new Date().toISOString(),

        fromStatus: oldStatus || "Unknown",

        toStatus: newStatus || "Unknown",

        by:
          user?.name ||
          user?.email ||
          userEmail ||
          "System",
      };

      const updatedHistory = [
        ...existingHistory,
        historyRecord,
      ];

      localStorage.setItem(
        "frontendStatusHistory",
        JSON.stringify(updatedHistory)
      );

      console.log("================================");
      console.log("FRONTEND STATUS HISTORY SAVED");
      console.log("================================");
      console.log(historyRecord);
    } catch (error) {
      console.error(
        "Failed to save frontend status history:",
        error
      );
    }
  };

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchTicketAndComments = async () => {
      if (!ticketId) {
        setErrorMessage("Missing ticket id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        console.log("Loading ticket:", ticketId);

        const response = await api.get(
          `/tickets/${ticketId}`
        );

        console.log(
          "Ticket API response:",
          response.data
        );

        const ticketData = response.data?.ticket;

        if (!ticketData) {
          setErrorMessage(
            "Ticket details request returned no ticket."
          );
          return;
        }

        // ── Get all assignees ────────────────────────────────────────────────
        const assigneesFromDb =
          Array.isArray(response.data?.assignees)
            ? response.data.assignees
            : [];

        setAllAssignees(assigneesFromDb);

        // ── Resolve ticket assignees ─────────────────────────────────────────
        let resolvedAssignees =
          Array.isArray(ticketData.assignees)
            ? ticketData.assignees
            : [];

        if (
          assigneesFromDb.length &&
          resolvedAssignees.length
        ) {
          resolvedAssignees =
            resolvedAssignees.map((assignee) => {
              if (
                typeof assignee === "object" &&
                (assignee?.name || assignee?.email)
              ) {
                return assignee;
              }

              const id = getAssigneeId(assignee);

              const found = assigneesFromDb.find(
                (userItem) =>
                  String(userItem?._id) ===
                  String(id)
              );

              return found || assignee;
            });
        }

        const resolvedTicket = {
          ...ticketData,
          assignees: resolvedAssignees,
        };

        setTicket(resolvedTicket);

        // ── Status ──────────────────────────────────────────────────────────
        const currentStatus =
          ticketData.status || "New";

        setStatus(currentStatus);
        setSavedStatus(currentStatus);

        // ── Current Assignee ────────────────────────────────────────────────
        if (resolvedAssignees.length > 0) {
          const currentAssignee =
            resolvedAssignees[
              resolvedAssignees.length - 1
            ];

          const currentAssigneeId =
            getAssigneeId(currentAssignee);

          console.log(
            "Current assignee:",
            currentAssignee
          );

          console.log(
            "Current assignee ID:",
            currentAssigneeId
          );

          setSelectedAssignee(
            currentAssigneeId
          );
        } else {
          setSelectedAssignee("");
        }

        // ── Followers ───────────────────────────────────────────────────────
        setFollowersCount(
          response.data?.followersCount ?? 0
        );

        // ── Comments ────────────────────────────────────────────────────────
        const apiPublic =
          Array.isArray(
            response.data?.publicComments
          )
            ? response.data.publicComments
            : [];

        const apiInternal =
          Array.isArray(
            response.data?.internalComments
          )
            ? response.data.internalComments
            : [];

        const embedded =
          Array.isArray(ticketData.comments)
            ? ticketData.comments
            : [];

        const embeddedPublic =
          embedded.filter(
            (comment) =>
              comment.type === "Public" ||
              comment.visibility === "Public"
          );

        const embeddedInternal =
          embedded.filter(
            (comment) =>
              comment.type === "Internal" ||
              comment.visibility === "Internal"
          );

        setPublicComments(
          [
            ...apiPublic,
            ...embeddedPublic,
          ].sort(
            (a, b) =>
              new Date(
                a.createdAt || a.timestamp
              ) -
              new Date(
                b.createdAt || b.timestamp
              )
          )
        );

        setInternalComments(
          [
            ...apiInternal,
            ...embeddedInternal,
          ].sort(
            (a, b) =>
              new Date(
                a.createdAt || a.timestamp
              ) -
              new Date(
                b.createdAt || b.timestamp
              )
          )
        );

        setCommentError("");
      } catch (error) {
        console.error(
          "Error fetching ticket and comments:",
          error
        );

        console.error(
          "Response:",
          error?.response?.data
        );

        setErrorMessage(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Failed to load ticket details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndComments();
  }, [ticketId]);

  // ─── Computed / Derived Values ─────────────────────────────────────────────

  const assigneeOptions = useMemo(() => {
    if (!Array.isArray(allAssignees)) {
      return [];
    }

    return allAssignees
      .map((assignee) => {
        const id = getAssigneeId(assignee);

        const label =
          assignee?.name ||
          assignee?.email ||
          "Unknown";

        return {
          _id: id,
          label,
        };
      })
      .filter(
        (assignee) => assignee._id
      );
  }, [allAssignees]);

  const filteredComments =
    activeTab === "Public"
      ? publicComments
      : internalComments;

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return "-";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return deadline;
    }

    return date.toLocaleDateString();
  };

  // ── Creator ────────────────────────────────────────────────────────────────

  const creatorFallback =
    ticket?.email
      ? ticket.email.split("@")[0]
      : "-";

  const creatorText = getUserLabel(
    ticket?.creator,
    creatorFallback
  );

  // ── Assignees ──────────────────────────────────────────────────────────────

  const assigneesText =
    Array.isArray(ticket?.assignees) &&
    ticket.assignees.length > 0
      ? ticket.assignees
          .map(
            (assignee) =>
              assignee?.name ||
              assignee?.email ||
              String(assignee) ||
              "Unknown"
          )
          .join(", ")
      : "-";

  // ── Ticket Details ─────────────────────────────────────────────────────────

  const details = [
    {
      label: "Title",
      value: ticket?.title || "-",
    },
    {
      label: "Category",
      value: ticket?.category || "-",
    },
    {
      label: "Deadline",
      value: formatDeadline(ticket?.deadline),
    },
    {
      label: "Followers",
      value: `${followersCount} user${
        followersCount !== 1 ? "s" : ""
      }`,
    },
    {
      label: "Creator",
      value: creatorText,
    },
    {
      label: "Assignees",
      value: assigneesText,
    },
  ];

  const commentTabs = [
    "Public",
    "Internal",
  ];

  // ─── Save Ticket ───────────────────────────────────────────────────────────

  const handleSaveTicket = async () => {
  if (saving) return;

  setSaving(true);
  setSaveMessage("");

  try {
    const response = await api.post(
      "/assignee/update-ticket",
      {
        ticketId: ticket._id,
        status: status,
        reassignedAssigneeId: selectedAssignee,
      }
    );

    console.log("Update response:", response.data);

    setSavedStatus(status);
    setSaveMessage("Ticket updated successfully.");
  } catch (error) {
    console.error(
      "Save error:",
      error.response?.data || error.message
    );

    setSaveMessage(
      error.response?.data?.message ||
      "Failed to save ticket."
    );
  } finally {
    setSaving(false);
  }
};

  // ─── Submit Comment ────────────────────────────────────────────────────────

  const handleSubmitComment =
    async () => {
      const message =
        commentText.trim();

      if (!message) {
        return;
      }

      setCommentSubmitting(true);
      setCommentError("");

      try {
        const response =
          await api.post(
            `/tickets/${ticketId}/comments`,
            {
              ticketId:
                ticket?._id ||
                ticketId,

              commentText:
                message,

              visibility:
                commentType,
            }
          );

        const newComment = {
          ...response.data?.comment,

          user: {
            email: userEmail,

            name:
              response.data?.name ||
              user?.name,
          },

          role:
            response.data?.role ||
            user?.role ||
            "assignee",

          visibility:
            commentType,
        };

        if (
          commentType ===
          "Public"
        ) {
          setPublicComments(
            (previous) => [
              ...previous,
              newComment,
            ]
          );
        } else {
          setInternalComments(
            (previous) => [
              ...previous,
              newComment,
            ]
          );
        }

        setCommentText("");
      } catch (error) {
        console.error(
          "Error submitting comment:",
          error
        );

        console.error(
          "Server response:",
          error?.response?.data
        );

        setCommentError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to submit comment."
        );
      } finally {
        setCommentSubmitting(false);
      }
    };

  // ─── JSX Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">

      {/* ── Sidebar Navigation ─────────────────────────────────────────────── */}
      <AssigneeNavbar
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          expanded
            ? "ml-64"
            : "ml-20"
        }`}
      >
        <div className="p-4 md:p-6">

          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">

            {/* ── Back Button ─────────────────────────────────────────────── */}
            <button
              onClick={() =>
                navigate(
                  "/assignee_dashboard"
                )
              }
              className="text-orange-500 text-lg hover:text-orange-600 mb-2"
            >
              ← Back
            </button>

            {/* ── Ticket Title ───────────────────────────────────────────── */}
            <h1 className="text-xl font-semibold text-center mb-6">
              {ticket?.title ||
                ticket?._id ||
                "Ticket-001"}
            </h1>

            {loading ? (
              <p className="text-gray-600 text-center text-sm">
                Loading ticket...
              </p>
            ) : (
              <>
                {/* ── Error Banner ────────────────────────────────────────── */}
                {errorMessage && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* ── Ticket Details + Status ─────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  <div className="lg:col-span-2 text-sm space-y-2">

                    {details.map(
                      (item) => (
                        <p
                          key={
                            item.label
                          }
                        >
                          <span className="font-semibold">
                            {
                              item.label
                            }:
                          </span>{" "}
                          {
                            item.value
                          }
                        </p>
                      )
                    )}

                  </div>

                  {/* ── Status ───────────────────────────────────────────── */}
                  <div>

                    <label className="font-semibold text-sm block mb-1">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value
                        )
                      }
                      disabled={
                        savedStatus ===
                          "Solved" ||
                        savedStatus ===
                          "Failed"
                      }
                      className="w-full border border-gray-400 rounded-md px-3 py-1 text-sm max-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {/* New */}
                      {savedStatus ===
                        "New" && (
                        <>
                          <option value="New">
                            New
                          </option>

                          <option value="Solving">
                            Solving
                          </option>

                          <option value="Solved">
                            Solved
                          </option>

                          <option value="Failed">
                            Failed
                          </option>
                        </>
                      )}

                      {/* Solving */}
                      {savedStatus ===
                        "Solving" && (
                        <>
                          <option value="Solving">
                            Solving
                          </option>

                          <option value="Solved">
                            Solved
                          </option>

                          <option value="Failed">
                            Failed
                          </option>
                        </>
                      )}

                      {/* Solved / Failed */}
                      {(
                        savedStatus ===
                          "Solved" ||
                        savedStatus ===
                          "Failed"
                      ) && (
                        <option
                          value={
                            savedStatus
                          }
                        >
                          {
                            savedStatus
                          }
                        </option>
                      )}

                    </select>

                  </div>
                </div>

                {/* ── Issue Description ───────────────────────────────────── */}
                <div className="mt-6">

                  <p className="text-sm">

                    <span className="font-semibold">
                      Issue:
                    </span>{" "}

                    {ticket?.issue ||
                      "-"}

                  </p>

                </div>

                {/* ── Reassign & Save ─────────────────────────────────────── */}
                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  {/* Reassign */}
                  <div className="flex items-center gap-3">

                    <label className="font-semibold text-sm">
                      Reassign to
                    </label>

                    <select
                      value={
                        selectedAssignee
                      }
                      onChange={(e) =>
                        setSelectedAssignee(
                          e.target.value
                        )
                      }
                      className="border border-gray-400 rounded-md px-3 py-1 text-sm min-w-[200px]"
                    >

                      <option value="">
                        Select assignee
                      </option>

                      {assigneeOptions.map(
                        (assignee) => (
                          <option
                            key={
                              assignee._id
                            }
                            value={
                              assignee._id
                            }
                          >
                            {
                              assignee.label
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* Save */}
                  <button
                    onClick={
                      handleSaveTicket
                    }
                    disabled={
                      saving ||
                      !ticket
                    }
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-6 py-1 rounded-md text-sm"
                  >
                    {saving
                      ? "Saving..."
                      : "Save"}
                  </button>

                </div>

                {/* ── Save Feedback ───────────────────────────────────────── */}
                {saveMessage && (
                  <p
                    className={`mt-3 text-sm ${
                      saveMessage.startsWith(
                        "Failed"
                      )
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {
                      saveMessage
                    }
                  </p>
                )}

                {/* ── Comments Section ────────────────────────────────────── */}
                <div className="border-t border-gray-300 mt-8 pt-6">

                  <h2 className="text-lg font-semibold mb-3">
                    Comments
                  </h2>

                  {/* Tabs */}
                  <div className="flex gap-2">

                    {commentTabs.map(
                      (tab) => (
                        <button
                          key={
                            tab
                          }
                          onClick={() =>
                            setActiveTab(
                              tab
                            )
                          }
                          className={`px-3 py-1 text-sm rounded-t border ${
                            activeTab ===
                            tab
                              ? "bg-white border-orange-500"
                              : "bg-gray-200 border-gray-300"
                          }`}
                        >
                          {
                            tab
                          }
                        </button>
                      )
                    )}

                  </div>

                  {/* Comment List */}
                  <div className="border border-gray-300 bg-white rounded-b-lg rounded-tr-lg p-4 h-[240px] overflow-y-auto">

                    {filteredComments.length ===
                    0 ? (
                      <p className="text-gray-500 text-sm">
                        No{" "}
                        {activeTab.toLowerCase()}{" "}
                        comments yet.
                      </p>
                    ) : (
                      filteredComments.map(
                        (
                          comment,
                          index
                        ) => {

                          const sender =
                            getCommentSender(
                              comment
                            );

                          const role =
                            getCommentRole(
                              comment
                            );

                          const isAssignee =
                            sender
                              .toLowerCase() ===
                              String(
                                userEmail
                              ).toLowerCase() ||
                            sender
                              .toLowerCase() ===
                              String(
                                user?.name ||
                                  ""
                              ).toLowerCase();

                          return (
                            <div
                              key={
                                comment?._id ||
                                index
                              }
                              className={`mb-3 flex ${
                                isAssignee
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >

                              <div className="max-w-[70%]">

                                <p className="text-xs text-gray-600 mb-1">
                                  {
                                    sender
                                  }{" "}
                                  |{" "}
                                  {
                                    role
                                  }
                                </p>

                                <div className="bg-gray-200 rounded-md px-3 py-1 text-sm">
                                  {
                                    comment?.comment ||
                                    comment?.message
                                  }
                                </div>

                              </div>

                            </div>
                          );
                        }
                      )
                    )}

                  </div>

                  {/* Comment Error */}
                  {commentError && (
                    <p className="mt-3 text-sm text-red-600">
                      {
                        commentError
                      }
                    </p>
                  )}

                  {/* Comment Input */}
                  <div className="mt-4 flex">

                    <input
                      type="text"
                      value={
                        commentText
                      }
                      onChange={(e) =>
                        setCommentText(
                          e.target.value
                        )
                      }
                      placeholder="Enter the comment to post it"
                      className="flex-1 border border-orange-400 rounded-l-md px-4 py-2 text-sm outline-none"
                    />

                    {/* Visibility */}
                    <select
                      value={
                        commentType
                      }
                      onChange={(e) =>
                        setCommentType(
                          e.target.value
                        )
                      }
                      className="border-y border-l border-gray-300 px-3 text-sm"
                    >

                      <option value="Internal">
                        Internal
                      </option>

                      <option value="Public">
                        Public
                      </option>

                    </select>

                    {/* Submit */}
                    <button
                      onClick={
                        handleSubmitComment
                      }
                      disabled={
                        commentSubmitting ||
                        !ticket
                      }
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-r-md text-sm"
                    >
                      {commentSubmitting
                        ? "Submitting..."
                        : "Submit"}
                    </button>

                  </div>

                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}