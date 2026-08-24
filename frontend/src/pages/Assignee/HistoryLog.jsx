import React, { useEffect, useState } from "react";
import AssigneeNavbar from "@/components/AssigneeNavbar";
import api from "../../api/axios";

export default function Assignee_Historylog() {
  const [expanded, setExpanded] = useState(false);

  const [statusLogs, setStatusLogs] = useState([]);
  const [assigneeLogs, setAssigneeLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get ID safely
  // ───────────────────────────────────────────────────────────────────────────

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "object") {
      return String(
        value?._id ||
        value?.id ||
        ""
      );
    }

    return String(value);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get Ticket ID safely
  // ───────────────────────────────────────────────────────────────────────────

  const getTicketId = (log) => {
    if (!log) {
      return "";
    }

    // First try ticket object / ticket ID
    const ticketId = getId(log?.ticket);

    if (ticketId) {
      return ticketId;
    }

    // Then try ticketId directly
    return getId(log?.ticketId);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get Ticket Name safely
  // ───────────────────────────────────────────────────────────────────────────

  const getTicketName = (ticket) => {
    if (!ticket) {
      return "-";
    }

    if (typeof ticket === "object") {
      return (
        ticket?.title ||
        ticket?.name ||
        ticket?.subject ||
        ticket?.issue ||
        ticket?._id ||
        ticket?.id ||
        "-"
      );
    }

    return String(ticket);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get User Name safely
  // ───────────────────────────────────────────────────────────────────────────

  const getUserName = (user, fallback = "None") => {
    if (!user) {
      return fallback;
    }

    if (typeof user === "object") {
      return (
        user?.name ||
        user?.email ||
        user?.username ||
        user?._id ||
        user?.id ||
        fallback
      );
    }

    return String(user);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get Date Safely
  // ───────────────────────────────────────────────────────────────────────────

  const getDateTime = (log) => {
    if (!log) {
      return "-";
    }

    const rawDate =
      log?.timestamp ||
      log?.createdAt ||
      log?.updatedAt ||
      log?.date;

    if (!rawDate) {
      return "-";
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return String(rawDate);
    }

    return date.toLocaleString();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Helper: Get "By" User
  // ───────────────────────────────────────────────────────────────────────────

  const getChangedBy = (log, fallback = "System") => {
    if (!log) {
      return fallback;
    }

    // Possible fields depending on your HistoryLog schema
    if (log?.by) {
      return getUserName(log.by, fallback);
    }

    if (log?.user) {
      return getUserName(log.user, fallback);
    }

    if (log?.changedBy) {
      return getUserName(log.changedBy, fallback);
    }

    if (log?.createdBy) {
      return getUserName(log.createdBy, fallback);
    }

    return fallback;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Fetch Ticket Names
  // ───────────────────────────────────────────────────────────────────────────

  const fetchTicketNames = async (logs) => {
    const ticketCache = {};

    if (!Array.isArray(logs) || logs.length === 0) {
      return ticketCache;
    }

    // Get unique ticket IDs safely
    const uniqueTicketIds = [
      ...new Set(
        logs
          .map((log) => getTicketId(log))
          .filter(Boolean)
      ),
    ];

    console.log(
      "Unique ticket IDs:",
      uniqueTicketIds
    );

    await Promise.all(
      uniqueTicketIds.map(async (ticketId) => {
        try {
          const response = await api.get(
            `/tickets/${encodeURIComponent(ticketId)}`
          );

          const ticket =
            response?.data?.ticket;

          if (ticket) {
            ticketCache[ticketId] =
              getTicketName(ticket);
          } else {
            ticketCache[ticketId] =
              ticketId;
          }

        } catch (error) {
          console.warn(
            `Could not fetch ticket ${ticketId}:`,
            error?.response?.data ||
            error?.message ||
            error
          );

          // If ticket cannot be loaded,
          // show ticket ID instead.
          ticketCache[ticketId] =
            ticketId;
        }
      })
    );

    return ticketCache;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Format Status History
  // ───────────────────────────────────────────────────────────────────────────

  const formatStatusLogs = (
    rawLogs,
    ticketNames
  ) => {
    if (!Array.isArray(rawLogs)) {
      return [];
    }

    return rawLogs.map((log, index) => {
      const ticketId =
        getTicketId(log);

      // If ticket is populated as object
      let ticketName = getTicketName(
        log?.ticket
      );

      // If ticket wasn't populated,
      // use fetched ticket name.
      if (
        ticketName === "-" &&
        ticketId
      ) {
        ticketName =
          ticketNames?.[ticketId] ||
          ticketId;
      }

      // Sometimes ticket can be just an ID string
      if (
        typeof log?.ticket !== "object" &&
        ticketId
      ) {
        ticketName =
          ticketNames?.[ticketId] ||
          ticketId;
      }

      return {
        id:
          getId(log?._id) ||
          `${ticketId}-${index}`,

        ticketId:
          ticketId || "-",

        ticketName:
          ticketName || "-",

        datetime:
          getDateTime(log),

        oldStatus:
          log?.fromStatus ||
          log?.oldStatus ||
          "-",

        newStatus:
          log?.toStatus ||
          log?.newStatus ||
          "-",

        by:
          getChangedBy(log, "System"),
      };
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Format Assignee History
  // ───────────────────────────────────────────────────────────────────────────

  const formatAssigneeLogs = (
    rawLogs,
    ticketNames
  ) => {
    if (!Array.isArray(rawLogs)) {
      return [];
    }

    return rawLogs.map((log, index) => {
      const ticketId =
        getTicketId(log);

      let ticketName = getTicketName(
        log?.ticket
      );

      if (
        ticketName === "-" &&
        ticketId
      ) {
        ticketName =
          ticketNames?.[ticketId] ||
          ticketId;
      }

      if (
        typeof log?.ticket !== "object" &&
        ticketId
      ) {
        ticketName =
          ticketNames?.[ticketId] ||
          ticketId;
      }

      return {
        id:
          getId(log?._id) ||
          `${ticketId}-${index}`,

        ticketId:
          ticketId || "-",

        ticketName:
          ticketName || "-",

        datetime:
          getDateTime(log),

        oldAssignee:
          getUserName(
            log?.fromAssignee,
            "None"
          ),

        newAssignee:
          getUserName(
            log?.toAssignee,
            "None"
          ),

        by:
          getChangedBy(log, "Admin"),
      };
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Fetch History Logs
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        console.log(
          "================================"
        );
        console.log(
          "FETCHING ASSIGNEE HISTORY"
        );
        console.log(
          "================================"
        );

        const res = await api.get(
          "/assignee/history"
        );

        console.log(
          "History API response:",
          res?.data
        );

        if (!mounted) {
          return;
        }

        // ────────────────────────────────────────────────────────────────────
        // Get Status Logs
        // ────────────────────────────────────────────────────────────────────
        console.log("Fuck this", res.data)
        const rawStatusLogs =
          Array.isArray(
            res?.data?.statusHistoryLog
          )
            ? res.data.statusHistoryLog
            : [];

        // ────────────────────────────────────────────────────────────────────
        // Get Assignee Logs
        // ────────────────────────────────────────────────────────────────────

        const rawAssigneeLogs =
          Array.isArray(
            res?.data?.assigneeHistoryLog
          )
            ? res.data.assigneeHistoryLog
            : [];

        console.log(
          "Raw status logs:",
          rawStatusLogs
        );

        console.log(
          "Raw assignee logs:",
          rawAssigneeLogs
        );

        // ────────────────────────────────────────────────────────────────────
        // Combine Logs
        // ────────────────────────────────────────────────────────────────────

        const allLogs = [
          ...rawStatusLogs,
          ...rawAssigneeLogs,
        ];

        console.log(
          "All history logs:",
          allLogs
        );

        // ────────────────────────────────────────────────────────────────────
        // Fetch Ticket Names
        // ────────────────────────────────────────────────────────────────────

        let ticketNames = {};

        try {
          ticketNames =
            await fetchTicketNames(
              allLogs
            );
        } catch (ticketError) {
          console.error(
            "Ticket name fetching failed:",
            ticketError
          );

          // Do not allow ticket-name
          // failure to break history.
          ticketNames = {};
        }

        console.log(
          "Ticket names:",
          ticketNames
        );

        // ────────────────────────────────────────────────────────────────────
        // Format Logs
        // ────────────────────────────────────────────────────────────────────

        const formattedStatus =
          formatStatusLogs(
            rawStatusLogs,
            ticketNames
          );

        const formattedAssignee =
          formatAssigneeLogs(
            rawAssigneeLogs,
            ticketNames
          );

        console.log(
          "Formatted status logs:",
          formattedStatus
        );

        console.log(
          "Formatted assignee logs:",
          formattedAssignee
        );

        if (!mounted) {
          return;
        }

        setStatusLogs(
          formattedStatus
        );

        setAssigneeLogs(
          formattedAssignee
        );

      } catch (error) {
        console.error(
          "================================"
        );

        console.error(
          "FAILED TO FETCH HISTORY LOGS"
        );

        console.error(
          "================================"
        );

        console.error(
          "Error:",
          error
        );

        console.error(
          "Error message:",
          error?.message
        );

        console.error(
          "Server response:",
          error?.response?.data
        );

        console.error(
          "HTTP status:",
          error?.response?.status
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load history logs."
        );

        setStatusLogs([]);
        setAssigneeLogs([]);

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      mounted = false;
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ─────────────────────────────────────────────────────────────────────
          Sidebar
      ───────────────────────────────────────────────────────────────────── */}

      <AssigneeNavbar
        expanded={expanded}
        setExpanded={setExpanded}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          Main Content
      ───────────────────────────────────────────────────────────────────── */}

      <main
        className={`min-h-screen p-4 md:p-10 transition-all duration-300 ${
          expanded
            ? "ml-64"
            : "ml-20"
        }`}
      >

        {/* ───────────────────────────────────────────────────────────────────
            Page Title
        ─────────────────────────────────────────────────────────────────── */}

        <h1 className="text-xl md:text-2xl font-semibold mb-6">
          History Log
        </h1>

        {/* ───────────────────────────────────────────────────────────────────
            Error Message
        ─────────────────────────────────────────────────────────────────── */}

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            Loading
        ─────────────────────────────────────────────────────────────────── */}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Loading history logs...
          </div>
        ) : (

          <div className="grid grid-cols-1 gap-8">

            {/* ═══════════════════════════════════════════════════════════════
                STATUS HISTORY
            ═══════════════════════════════════════════════════════════════ */}

            <div className="bg-gray-100 rounded-xl shadow p-6">

              <h2 className="text-xl font-semibold mb-4">
                Status Change
              </h2>

              <div className="overflow-x-auto rounded-lg border bg-white">

                <table className="w-full min-w-[950px]">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-4 py-3 text-left">
                        Ticket ID
                      </th>

                      <th className="px-4 py-3 text-left">
                        Ticket Name
                      </th>

                      <th className="px-4 py-3 text-left">
                        Date/Time
                      </th>

                      <th className="px-4 py-3 text-left">
                        Old Status
                      </th>

                      <th className="px-4 py-3 text-left">
                        New Status
                      </th>

                      <th className="px-4 py-3 text-left">
                        By
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {statusLogs.length > 0 ? (

                      statusLogs.map(
                        (log, index) => (

                          <tr
                            key={
                              log.id ||
                              `${log.ticketId}-${index}`
                            }
                            className="border-t hover:bg-gray-50"
                          >

                            {/* Ticket ID */}

                            <td className="px-4 py-3">
                              {log.ticketId}
                            </td>

                            {/* Ticket Name */}

                            <td className="px-4 py-3 font-medium">
                              {log.ticketName}
                            </td>

                            {/* Date */}

                            <td className="px-4 py-3">
                              {log.datetime}
                            </td>

                            {/* Old Status */}

                            <td className="px-4 py-3">

                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {log.oldStatus}
                              </span>

                            </td>

                            {/* New Status */}

                            <td className="px-4 py-3">

                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {log.newStatus}
                              </span>

                            </td>

                            {/* By */}

                            <td className="px-4 py-3">
                              {log.by}
                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan={6}
                          className="text-center py-6 text-gray-500"
                        >
                          No status logs found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* ═══════════════════════════════════════════════════════════════
                ASSIGNEE HISTORY
            ═══════════════════════════════════════════════════════════════ */}

            <div className="bg-gray-100 rounded-xl shadow p-6">

              <h2 className="text-xl font-semibold mb-4">
                Assignee Change
              </h2>

              <div className="overflow-x-auto rounded-lg border bg-white">

                <table className="w-full min-w-[950px]">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-4 py-3 text-left">
                        Ticket ID
                      </th>

                      <th className="px-4 py-3 text-left">
                        Ticket Name
                      </th>

                      <th className="px-4 py-3 text-left">
                        Date/Time
                      </th>

                      <th className="px-4 py-3 text-left">
                        Old Assignee
                      </th>

                      <th className="px-4 py-3 text-left">
                        New Assignee
                      </th>

                      <th className="px-4 py-3 text-left">
                        By
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {assigneeLogs.length > 0 ? (

                      assigneeLogs.map(
                        (log, index) => (

                          <tr
                            key={
                              log.id ||
                              `${log.ticketId}-${index}`
                            }
                            className="border-t hover:bg-gray-50"
                          >

                            {/* Ticket ID */}

                            <td className="px-4 py-3">
                              {log.ticketId}
                            </td>

                            {/* Ticket Name */}

                            <td className="px-4 py-3 font-medium">
                              {log.ticketName}
                            </td>

                            {/* Date */}

                            <td className="px-4 py-3">
                              {log.datetime}
                            </td>

                            {/* Old Assignee */}

                            <td className="px-4 py-3">

                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {log.oldAssignee}
                              </span>

                            </td>

                            {/* New Assignee */}

                            <td className="px-4 py-3">

                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                {log.newAssignee}
                              </span>

                            </td>

                            {/* By */}

                            <td className="px-4 py-3">
                              {log.by}
                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan={6}
                          className="text-center py-6 text-gray-500"
                        >
                          No assignee logs found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
} 