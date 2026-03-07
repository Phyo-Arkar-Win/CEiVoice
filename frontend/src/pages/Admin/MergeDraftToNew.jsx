import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";

export default function MergeDraftToNewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const mergedTicketsFromState = location.state?.mergedTickets || [];

  const [title, setTitle] = useState("Mouse Not Working");
  const [category, setCategory] = useState("Hardware Issue");
  const [summary, setSummary] = useState(
    "Multiple users reported that their mouse devices are not responding."
  );
  const [resolution, setResolution] = useState(
    "1. Check USB connection\n2. Try another port\n3. Restart the device\n4. Replace hardware if needed"
  );
  const [deadline, setDeadline] = useState("");
  const [mergedUsers, setMergedUsers] = useState(
    mergedTicketsFromState.length > 0
      ? mergedTicketsFromState.map((ticket, index) => ({
          id: ticket.id,
          email: `user${index + 1}@uni.edu`,
          description: ticket.title,
        }))
      : []
  );

  const unmergeUser = (index) => {
    const updated = [...mergedUsers];
    updated.splice(index, 1);
    setMergedUsers(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      title,
      category,
      deadline,
      summary,
      resolutionPath: resolution,
      mergedTickets: mergedUsers,
    };

    try {
      console.log("Submitting Ticket:", payload);
      await api.post("/tickets/merge", payload);
      alert("Ticket submitted successfully!");
      navigate("/admin/drafts");
    } catch (error) {
      console.log("Backend not ready yet", payload);
      alert("Backend not ready yet, but payload is ready.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-200">
      <AdminNavbar />

      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-6">
          Merged Draft Ticket (AI Suggested)
        </h1>

        <div className="bg-gray-100 rounded-xl shadow p-6 mb-8">
          <div className="flex justify-end mb-3">
            <span className="bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm">
              AI Suggestion
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="font-semibold block mb-2">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2 bg-white resize-none"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Resolution Path</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2 whitespace-pre-line bg-white resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold block mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Merged Requests / Users ({mergedUsers.length})
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
                <tr key={user.id} className="border-t">
                  <td className="py-3">{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.description}</td>
                  <td>
                    <button
                      onClick={() => unmergeUser(index)}
                      className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
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
              onClick={() => navigate("/admin/drafts")}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}