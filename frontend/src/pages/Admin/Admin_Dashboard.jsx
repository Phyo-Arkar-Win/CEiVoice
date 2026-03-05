import React, { useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";

export default function Admin_Dashboard() {

  const [options, setOptions] = useState([
    "IT Support",
    "Finance",
    "Engineering",
    "Hardware",
    "Software",
  ]);

  const [selected, setSelected] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newScope, setNewScope] = useState("");

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

  const addScope = () => {
    if (newScope.trim() !== "") {
      setOptions([...options, newScope]);
      setSelected([...selected, newScope]);
      setNewScope("");
      setShowInput(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNavbar />

      <div className="p-6 w-80 space-y-3">

        <label className="text-gray-700 font-medium">Scope:</label>

        {/* Dropdown */}
        <select
          onChange={handleSelect}
          className="w-full px-4 py-2 rounded-lg bg-gray-200 focus:outline-none"
        >

          {options.map((opt, index) => (
            <option key={index} value={opt}>
              {opt}
            </option>
          ))}

          <option value="NEW_SCOPE">+ New Scope</option>
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

        {/* Input appears only when New Scope is selected */}
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
  );
}