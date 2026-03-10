import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";

export default function MergeDraftToNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const mergedTicket = location.state?.mergedTicket || null;
  const selectedTickets = location.state?.tickets || [];


  const [mergedUsers, setMergedUsers] = useState([]);
  const [assignees, setAssignees] = useState([]);

  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {

  if (mergedTicket) {

    setTitle(mergedTicket.title || "");
    setCategory(mergedTicket.category || "");
    setSummary(mergedTicket.summary || "");

    setResolution(
      Array.isArray(mergedTicket.resolution_path)
        ? mergedTicket.resolution_path.join("\n")
        : mergedTicket.resolution_path || ""
    );

  }

}, [mergedTicket]);

  // Load selected tickets
  useEffect(() => {

    const mapped = selectedTickets.map(ticket => ({
      id: ticket._id,
      email: ticket.email || "",
      description: ticket.title || ""
    }));

    setMergedUsers(mapped);

  }, [selectedTickets]);

  // Fetch assignees from DB
  useEffect(() => {

    const fetchAssignees = async () => {

      try {

        const res = await api.get("/admin/assignee");
        setAssignees(res.data.data || res.data);

      } catch (err) {

        console.error("Error fetching assignees:", err);

      }

    };

    fetchAssignees();

  }, []);

  // Unmerge
  const unmergeUser = async (ticketId) => {
    console.log(mergedTicket)

  try {
    const res = await api.post("/tickets/merge/unlink", {
      mergedTicket: mergedTicket,
      ticketToUnlinkId: ticketId
    });
    
    const updatedMergedTicket = res.data.mergedTicket;

    // rebuild merged users list from backend result
    const updatedUsers = selectedTickets
      .filter(ticket =>
        updatedMergedTicket.mergedTickets.includes(ticket._id)
      )
      .map(ticket => ({
        id: ticket._id,
        email: ticket.email || "",
        description: ticket.title || ""
      }));

    setMergedUsers(prev => prev.filter(user => user.id !== ticketId));

  } catch (error) {

    console.error("Unmerge error:", error);

  }

};

  // Submit merged ticket
  const handleSubmit = async () => {

    const mergedTicketData = {
      title,
      category,
      deadline,
      assignee,
      summary,
      resolutionPath: resolution.split("\n"),
      mergedTickets: mergedUsers.map(u => u.id)
    };

    const payload = {
      mergedTicket: mergedTicketData
    }

    console.log("payload:", payload)

    try {

      const res = await api.post("/tickets/merge", payload);

      console.log("merge result:", res.data)

      alert("Merged ticket submitted!");

      navigate("/tickets")

    } catch (error) {

      console.error("Submit error:", error);

    }

  };

  return (
    <div className="h-screen flex bg-gray-200 overflow-hidden">

      <AdminNavbar />

      <div className="flex-1 p-4 md:p-10 min-w-0 overflow-y-auto">

        <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">
          Merge Drafts to New Ticket
        </h1>

        {/* FORM */}

        <div className="bg-gray-100 rounded-xl shadow p-4 md:p-6 mb-6 md:mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

            <div>
              <label className="font-semibold block mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Resolution Path</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Assignee</label>

              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4"
              >

                <option value="">Select Assignee</option>

                {assignees.map(person => (
                  <option key={person._id} value={person._id}>
                    {person.name}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* MERGED USERS TABLE */}

        <div className="bg-gray-100 rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200">

          <h2 className="text-lg font-semibold mb-4">
            Merged Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              <thead>
                <tr>
                  <th className="text-left py-2 font-semibold pr-4 whitespace-nowrap">Request ID</th>
                  <th className="text-left font-semibold pr-4 whitespace-nowrap">User Email</th>
                  <th className="text-left font-semibold">Title</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {mergedUsers.map((user, index) => (

                  <tr key={index} className="border-t border-gray-300">

                    <td className="py-3 text-sm pr-4 whitespace-nowrap">{user.id}</td>
                    <td className="text-sm pr-4 whitespace-nowrap">{user.email || "-"}</td>
                    <td className="text-sm max-w-[200px] sm:max-w-xs truncate pr-4">{user.description || "-"}</td>

                    <td className="text-right pr-2">
                      <button
                        onClick={() => unmergeUser(user.id)}
                        className="bg-gray-300 px-3 py-1.5 md:px-4 md:py-1 rounded text-sm md:text-base hover:bg-gray-400 transition-colors cursor-pointer"
                      >
                        Unmerge
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">

            <button
              onClick={() => navigate('/drafts')}
              className="bg-gray-300 px-6 py-3 sm:py-2 rounded font-medium hover:bg-gray-400 transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="bg-orange-600 text-white px-6 py-3 sm:py-2 rounded font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto text-center cursor-pointer"
            >
              Submit Ticket
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}