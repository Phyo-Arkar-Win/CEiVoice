import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center py-3 mt-4 px-6 font-bold whitespace-nowrap ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <div
      className="group h-screen w-20 hover:w-64 bg-gray-100 border-r-2 border-orange-500 flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      {/* TOP SECTION */}
      <div>
        {/* Logo + Title */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-500">
          <img
            src={ceiLogo}
            alt="CEi Logo"
            className="w-10 h-10 object-contain"
          />

          <h1 className="text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            CEiVoice
          </h1>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center py-6 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="border-b text-xl border-black px-2 font-medium">
            {name}
          </span>
          <span className="text-xl mt-1">Admin</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col py-4 text-lg mt-4">

          <NavLink to="/admin_dashboard" className={linkStyle}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Dashboard
            </span>
          </NavLink>

          <NavLink to="/drafts" className={linkStyle}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Drafts
            </span>
          </NavLink>

          <NavLink to="/tickets" className={linkStyle}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Tickets
            </span>
          </NavLink>

          <NavLink to="/staff" className={linkStyle}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Staff Management
            </span>
          </NavLink>

        </div>
      </div>

      {/* LOGOUT SECTION */}
      <div
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-6 py-4 cursor-pointer hover:bg-gray-200"
      >
        <IoIosLogOut className="text-2xl" />

        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </div>
    </div>
  );
}