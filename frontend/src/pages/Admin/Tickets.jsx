import React, { useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";
import { useNavigate } from "react-router";

export default function Tickets() {
  const navigate = useNavigate("")

  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("Linn Hein Htet");

  const assignees = [
    "Linn Hein Htet",
    "Phyo Arkar Win",
    "Luchit",
    "Yu Yu Khaing",
    "Hsaung Thet Htar",
    "Aung Pyae Song"

  ];

  const title = "Mouse Not Working";
  const category = "Hardware Issue";
  const summary =
    "User reported that their mouse stopped responding. Cursor does not move even after reconnecting.";
  const resolution =
    "1. Check USB connection\n2. Try different port\n3. Restart system\n4. Replace mouse if issue persists";

  const [mergedUsers, setMergedUsers] = useState([
    {
      id: "Ticket-001",
      email: "linnheinhtet@gmail.com",
      description: "Mouse not working",
    },
    {
      id: "Ticket-002",
      email: "linnheinhtet@gmail.com",
      description: "Mouse not working",
    },
    {
      id: "Ticket-003",
      email: "linnheinhtet@gmail.com",
      description: "Mouse not working",
    },
  ]);

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
      assignee,
      summary,
      resolutionPath: resolution,
      mergedTickets: mergedUsers,
    };

    try {

  console.log("Submitting Ticket:", payload);

  const res = await api.post("/tickets/merge", payload);

  const ticketId = res.data?.ticketId || res.data?.id;

  if (ticketId) {
    navigate(`/assignee_ticket/${ticketId}`);
  }

} catch (error) {

  console.log("Backend not ready yet", payload);

}
  };

  return (
    <div className="min-h-screen flex bg-gray-200">

      <AdminNavbar />

      <div className="flex-1 p-10">

        <h1 className="text-2xl font-semibold mb-6">
          Merged Draft Ticket (AI Suggested)
        </h1>

        {/* FORM CARD */}
        <div className="bg-gray-100 rounded-xl shadow p-6 mb-8">

          <div className="flex justify-end mb-3">
            <span className="bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm">
              AI Suggestion
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8">

            {/* TITLE */}
            <div>
              <label className="font-semibold block mb-2">Title</label>
              <div className="w-full h-10 border border-orange-400 rounded-full px-4 flex items-center bg-white">
                {title}
              </div>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="font-semibold block mb-2">Category</label>
              <div className="w-full h-10 border border-orange-400 rounded-full px-4 flex items-center bg-white">
                {category}
              </div>
            </div>

            {/* SUMMARY */}
            <div>
              <label className="font-semibold block mb-2">Summary</label>
              <div className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2 bg-white">
                {summary}
              </div>
            </div>

            {/* RESOLUTION */}
            <div>
              <label className="font-semibold block mb-2">Resolution Path</label>
              <div className="w-full h-32 border border-orange-400 rounded-xl px-4 py-2 whitespace-pre-line bg-white">
                {resolution}
              </div>
            </div>

            {/* DEADLINE */}
            <div>
              <label className="font-semibold block mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* ASSIGNEE */}
            <div>
              <label className="font-semibold block mb-2">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full h-10 border border-orange-400 rounded-full px-4 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {assignees.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* MERGED USERS */}
        <div className="bg-gray-100 rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold mb-4">
            Merged Users:
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

            <button className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
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