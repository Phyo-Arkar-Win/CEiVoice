import React, { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";
import { LuPencil } from "react-icons/lu";

export default function StaffManagement() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [assignees, setAssignees] = useState([]);
  const [options, setOptions] = useState([]);

  const [selected, setSelected] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newScope, setNewScope] = useState("");

  // =========================
  // Fetch Assignees
  // =========================
  const fetchAssignees = async () => {
    try {
      const res = await api.get("/recruit");
      setAssignees(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // Fetch Scopes
  // =========================
  const fetchScopes = async () => {
    try {
      const res = await api.get("/scopes");

      // Backend returns array of scope objects
      const scopeNames = res.data.map((s) => s.name);

      setOptions(scopeNames);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // Select Scope
  // =========================
  const handleSelect = (e) => {
    const value = e.target.value;

    if (value === "NEW_SCOPE") {
      setShowInput(true);
      return;
    }

    if (!selected.includes(value)) {
      setSelected([...selected, value]);
    }
  };

  // =========================
  // Add Scope (save to DB)
  // =========================
  const addScope = async () => {

    if (!newScope.trim()) return;

    try {

      const res = await api.post("/scopes", {
        name: newScope
      });

      setOptions([...options, res.data.data.name]);
      setSelected([...selected, res.data.data.name]);

      setNewScope("");
      setShowInput(false);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // Assign User
  // =========================
  const assignUser = async () => {
    try {

      await api.post("/recruit", {
        name,
        email,
        scopes: selected
      });

      fetchAssignees();

      setName("");
      setEmail("");
      setSelected([]);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // Load Data
  // =========================
  useEffect(() => {
    fetchAssignees();
    fetchScopes();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      <AdminNavbar />

      <div className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Staff Management
        </h1>

        {/* =========================
           Add Assignee
        ========================== */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="font-semibold text-2xl mb-6">
            Add new Assignee
          </h2>

          <div className="grid grid-cols-2 gap-6">

            {/* Name */}
            <div>
              <label className="text-sm text-gray-600">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-200 rounded"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-200 rounded"
              />
            </div>

            {/* Scope */}
            <div className="space-y-3">

              <label className="text-sm text-gray-600">
                Scope
              </label>

              <select
                onChange={handleSelect}
                className="w-full px-4 py-2 rounded-lg bg-gray-200"
              >

                <option>Select Scope</option>

                {options.map((opt, index) => (
                  <option key={index} value={opt}>
                    {opt}
                  </option>
                ))}

                <option value="NEW_SCOPE">
                  + New Scope
                </option>

              </select>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">

                {selected.map((item, index) => (

                  <span
                    key={index}
                    className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>

                ))}

              </div>

              {/* New Scope Input */}
              {showInput && (

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    placeholder="Enter new scope"
                    className="border px-3 py-2 rounded w-full"
                  />

                  <button
                    onClick={addScope}
                    className="bg-orange-500 text-white px-4 rounded"
                  >
                    Add
                  </button>

                </div>

              )}

            </div>

          </div>

          <button
            onClick={assignUser}
            className="mt-6 bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600"
          >
            Assign
          </button>

        </div>

        {/* =========================
           Existing Assignees
        ========================== */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="font-semibold text-lg mb-6">
            Existing Assignees
          </h2>

          <table className="w-full text-sm">

            <thead className="text-gray-600">
              <tr className="text-left">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Scope</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>

            <tbody>

              {assignees.map((user) => (

                <tr key={user._id} className="border-t text-lg">

                  <td className="py-2">
                    {user.name}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.scopes?.map(scope => scope.name).join(", ")}
                  </td>

                  <td>
                    <LuPencil className="text-xl cursor-pointer" />
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}