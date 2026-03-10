  import { useEffect, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import AssigneeNavbar from "@/components/AssigneeNavbar";
  import api from "@/api/axios";

  export default function Assignee_Ticket_Details() {

    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [scopes, setScopes] = useState([]);

    const [ticket, setTicket] = useState(null);
    const [publicComments, setPublicComments] = useState([]);
    const [internalComments, setInternalComments] = useState([]);
    const [assignees, setAssignees] = useState([]);

    const [status, setStatus] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState("");

    const [commentText, setCommentText] = useState("");
    const [commentType, setCommentType] = useState("Public");
    const [activeTab, setActiveTab] = useState("Public");

    const [originalStatus, setOriginalStatus] = useState("");

    const [loading, setLoading] = useState(true);

    const getScopeNames = (scopeIds) => {
  if (!scopeIds || scopeIds.length === 0) return "No Scope";

  const names = scopes
    .filter((s) => scopeIds.includes(s._id.toString()))
    .map((s) => s.name);

  return names.length ? names.join(", ") : "No Scope";
};
    // FETCH DATA
    useEffect(() => {
      const fetchTicket = async () => {
        try {
          const res = await api.get(`/assignee/ticketDetails/${ticketId}`);
          console.log(res.data)
          setTicket(res.data.ticket);
          setPublicComments(res.data.publicComments || []);
          setInternalComments(res.data.internalComments || []);
          setAssignees(res.data.assignees || []);

          setStatus(res.data.ticket.status);
          setScopes(res.data.scopes || []);

          setStatus(res.data.ticket.status);
          setOriginalStatus(res.data.ticket.status);
          

        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      fetchTicket();
    }, [ticketId]);


    // COMMENTS LIST
    const comments =
      activeTab === "Public" ? publicComments : internalComments;

    

    // SUBMIT COMMENT
    const handleSubmitComment = async () => {
      if (!commentText) return;

      try {
        const res = await api.post("/assignee/submitComment", {
          ticketId,
          commentText,
          visibility: commentType,
        });

        if (commentType === "Public") {
          setPublicComments([res.data.comment, ...publicComments]);
        } else {
          setInternalComments([res.data.comment, ...internalComments]);
        }

        setCommentText("");

      } catch (err) {
        console.log(err);
      }
    };

    const handleSave = async () => {
  try {

    await api.post("/assignee/saveTicket", {
      ticketId,
      status,
      reassignedAssigneeId: selectedAssignee
    });
    alert("Ticket updated successfully");

  } catch (err) {
    console.log(err);
  }
};
  const statusFlow = {
  New: ["New", "Solving", "Solved", "Failed"],
  Solving: ["Solving", "Solved", "Failed"],
  Solved: ["Solved", "Failed"],
  Failed: ["Failed"],
};

    if (loading) return <p>Loading...</p>;
    if (!ticket) {
    return <div className="p-6 text-lg">Loading ticket...</div>;
  }
    return (
      <div className="min-h-screen flex bg-gray-100">
        <AssigneeNavbar />

        <div className="flex-1 p-6 ml-64">

          <div className="bg-white border rounded-lg shadow-sm p-6">

            <button
              onClick={() => navigate("/assignee_dashboard")}
              className="text-orange-500 mb-3"
            >
              ← Back
            </button>

            <h1 className="text-xl font-semibold text-center mb-6">
              {ticket.title}
            </h1>


            {/* Ticket Details */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">

              <div className="lg:col-span-2 space-y-2">
                <p><b>Title:</b> {ticket.title}</p>
                <p><b>Category:</b> {ticket.category}</p>
                <p><b>Deadline:</b> {ticket.deadline}</p>
                <p><b>Followers:</b> {ticket.followers?.length || 0}</p>
                <p><b>Creator:</b> {ticket.creator?.email}</p>
                <p>
                  <b>Assignees:</b>{" "}
                  {ticket.assignees?.map(a => a.name).join(", ")}
                </p>
              </div>


              {/* STATUS */}

              <div>
                <label className="font-semibold text-sm block mb-1">
                  Status
                </label>

                <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  disabled={originalStatus === "Failed"}
  className="border px-3 py-1 rounded"
>

  {statusFlow[originalStatus].map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}

</select>
              </div>
            </div>


            {/* ISSUE */}

            <div className="mt-6">
              <p><b>Issue:</b> {ticket.issue}</p>
            </div>


            {/* REASSIGN */}

            <div className="mt-6 flex justify-between items-center">

              <div className="flex gap-3 items-center">
                <label className="font-semibold text-sm">
                  Reassign to
                </label>

                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="border px-3 py-1 rounded"
                >
                  <option value="" disabled>
                    Select Assignee
                  </option>
                  {assignees.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} - ({getScopeNames(a.scopes)})
                    </option>
                  ))}
                </select>
              </div>

              <button
              onClick={handleSave}
              className="bg-orange-500 text-white px-6 py-1 rounded">
                Save
              </button>

            </div>



            {/* COMMENTS */}

            <div className="border-t mt-8 pt-6">

              <h2 className="text-lg font-semibold mb-3">
                Comments
              </h2>


              {/* TABS */}

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("Public")}
                  className={`px-3 py-1 border ${
                    activeTab === "Public"
                      ? "border-orange-500"
                      : ""
                  }`}
                >
                  Public
                </button>

                <button
                  onClick={() => setActiveTab("Internal")}
                  className={`px-3 py-1 border ${
                    activeTab === "Internal"
                      ? "border-orange-500"
                      : ""
                  }`}
                >
                  Internal
                </button>
              </div>


              {/* COMMENT LIST */}

              <div className="border p-4 h-[240px] overflow-y-auto">

                {comments.map((c) => (
                  <div key={c._id} className="mb-3">

                    <p className="text-xs text-gray-500">
                      {c.user?.email}
                    </p>

                    <div className="bg-gray-200 px-3 py-1 rounded">
                      {c.comment}
                    </div>

                  </div>
                ))}

              </div>


              {/* COMMENT INPUT */}

              <div className="mt-4 flex">

                <input
                  type="text"
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
                  className="flex-1 border px-3 py-2"
                  placeholder="Enter comment"
                />

                <select
                  value={commentType}
                  onChange={(e) =>
                    setCommentType(e.target.value)
                  }
                  className="border px-3"
                >
                  <option value="Public">Public</option>
                  <option value="Internal">Internal</option>
                </select>

                <button
                  onClick={handleSubmitComment}
                  className="bg-orange-500 text-white px-6"
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