import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import api from "../../api/axios";
import { LuPencil } from "react-icons/lu";
import { IoClose, IoChevronDown } from "react-icons/io5";

export default function StaffManagement() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [assignees, setAssignees] = useState([]);
  const [options, setOptions] = useState([]);

  const [selected, setSelected] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newScope, setNewScope] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");

  // =========================
  // Fetch Assignees
  // =========================
  const fetchAssignees = async () => {
    try {
      const res = await api.get("/admin/assignees");
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

  const removeSelected = (value) => {
    setSelected((prev) => prev.filter((v) => v !== value));
  };

  const handleEditAssignee = (user) => {
    setName(user.name || "");
    setEmail(user.email || "");
    setSelected(Array.isArray(user.scopes) ? user.scopes : []);
    setOriginalEmail(user.email || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setName("");
    setEmail("");
    setSelected([]);
    setOriginalEmail("");
    setIsEditing(false);
  };

  // =========================
  // Add Scope
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
      await api.post("/admin/assignees", {
        name,
        email,
        scopes: selected,
        originalEmail: originalEmail || email,
      });

      fetchAssignees();

      cancelEdit();
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
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      <AdminNavbar />

      <div className="flex-1 p-4 md:p-6 min-w-0 overflow-y-auto">

        <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
          Staff Management
        </h1>

        {/* ================= Add Assignee ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">

          <h2 className="font-semibold text-lg md:text-2xl mb-4 md:mb-6">
            {isEditing ? "Edit Assignee" : "Add new Assignee"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Name */}

            <div>
              <label className="text-sm text-gray-600">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
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
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-200 rounded"
              />
            </div>

            {/* Scope */}

            <div className="space-y-3">

              <label className="text-sm text-gray-600">
                Scope
              </label>

              <div className="relative">
                <select
                  onChange={handleSelect}
                  className="w-full pr-8 px-3 py-2 rounded bg-gray-200 appearance-none"
                >

                  <option>Select Scope</option>

                {options.map((opt, index)=>(
                  <option key={index} value={opt}>
                    {opt}
                  </option>
                ))}

                <option value="NEW_SCOPE">
                  + New Scope
                </option>

              </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <IoChevronDown className="text-base" />
                </span>
              </div>
              {/* Selected Tags */}

              <div className="flex flex-wrap gap-2">

                {selected.map((item, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeSelected(item)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-200 text-orange-700 hover:bg-orange-300"
                      aria-label={`Remove ${item}`}
                    >
                      <IoClose className="text-xs" />
                    </button>
                  </span>
                ))}

              </div>

              {/* New Scope Input */}

              {showInput && (

                <div className="flex flex-col sm:flex-row gap-2 mt-2">

                  <input
                    type="text"
                    value={newScope}
                    onChange={(e)=>setNewScope(e.target.value)}
                    placeholder="Enter new scope"
                    className="border px-3 py-2 rounded w-full border-gray-300"
                  />

                  <button
                    onClick={addScope}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors whitespace-nowrap"
                  >
                    Add
                  </button>

                </div>

              )}

            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
            <button
              onClick={assignUser}
              className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto"
            >
              {isEditing ? "Update Assignee" : "Assign"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            )}
          </div>

        </div>

        {/* ================= Existing Assignees ================= */}

        <div className="bg-white rounded-xl shadow p-4 md:p-6">

          <h2 className="font-semibold text-lg md:text-xl mb-4 md:mb-6">
            Existing Assignees
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">

              <thead className="text-gray-600 border-b border-gray-200">
                <tr className="text-left">
                  <th className="pb-3 pr-4 font-semibold whitespace-nowrap">Name</th>
                  <th className="pb-3 pr-4 font-semibold whitespace-nowrap">Email</th>
                  <th className="pb-3 pr-4 font-semibold whitespace-nowrap">Scope</th>
                  <th className="pb-3 font-semibold text-center w-16 whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody>

                {assignees.map((user) => (

                  <tr key={user._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">

                    <td className="py-3 pr-4 whitespace-nowrap text-base">
                      {user.name}
                    </td>

                    <td className="py-3 pr-4 text-gray-600">
                      {user.email || "-"}
                    </td>

                    <td className="py-3 pr-4 text-gray-600">
                      {Array.isArray(user.scopes)
                        ? user.scopes.join(", ")
                        : "-"}
                    </td>

                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEditAssignee(user)}
                        className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
                        aria-label={`Edit ${user.name}`}
                      >
                        <LuPencil className="text-lg text-gray-500 hover:text-orange-500 transition-colors" />
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>

        </div>

    </div>
    </div>
  );
}
