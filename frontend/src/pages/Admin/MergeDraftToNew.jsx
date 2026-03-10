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
      description: ticket.summary || ""
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
        description: ticket.summary || ""
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

    <div className="min-h-screen flex bg-gray-200">

      <AdminNavbar />

      <div className="flex-1 p-10">

        <h1 className="text-2xl font-semibold mb-6">
          Merge Drafts to New Ticket
        </h1>

        {/* FORM */}

        <div className="bg-gray-100 rounded-xl shadow p-6 mb-8">

          <div className="grid grid-cols-2 gap-8">

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

        <div className="bg-gray-100 rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold mb-4">
            Merged Users
          </h2>

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left py-2">Request ID</th>
                <th className="text-left">User Email</th>
                <th className="text-left">Description</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {mergedUsers.map((user, index) => (

                <tr key={index} className="border-t">

                  <td className="py-3">{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.description}</td>

                  <td>
                    <button
                      onClick={() => unmergeUser(user.id)}
                      className="bg-gray-300 px-4 py-1 rounded cursor-pointer"
                    >
                      Unmerge
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <div className="flex justify-end gap-4 mt-6">

            <button
            onClick={() => navigate('/drafts')}
            className="bg-gray-300 px-6 py-2 rounded">
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="bg-orange-600 text-white px-6 py-2 rounded"
            >
              Submit Ticket
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}