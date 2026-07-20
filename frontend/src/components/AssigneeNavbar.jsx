import React from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoPerson } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

export default function AssigneeNavbar({
  expanded,
  setExpanded,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
  const displayName = user?.name || storedUser?.name || "Assignee";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center px-5 py-3 mt-4 font-bold transition-colors duration-200 hover:bg-gray-200 ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed top-0 left-0 h-screen bg-gray-100 border-r-2 border-orange-500 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out z-50 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* TOP */}
      <div>
        {/* Logo */}
        <div className="flex items-center px-5 py-4 border-b border-orange-500">
          <img
            src={ceiLogo}
            alt="CEi Logo"
            className="w-10 h-10 object-contain flex-shrink-0"
          />

          <h1
            className={`ml-3 text-xl font-bold whitespace-nowrap transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            CEiVoice
          </h1>
        </div>

        {/* User */}
        <div className="flex items-center px-5 py-5">
          <IoPerson className="text-2xl flex-shrink-0" />

          <div
            className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="font-bold border-b border-black pb-1">
              {user?.name || "Assignee"}
            </div>

            <div className="text-sm mt-1">Assignee</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <NavLink to="/assignee_dashboard" className={linkStyle}>
            <BsGraphUp className="text-2xl flex-shrink-0" />

            <span
              className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              Dashboard
            </span>
          </NavLink>

          <NavLink to="/assignee_historylog" className={linkStyle}>
            <MdOutlineAccessTime className="text-2xl flex-shrink-0" />

            <span
              className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              History Log
            </span>
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-5 py-4 font-bold hover:bg-gray-200 transition"
        >
          <IoIosLogOut className="text-2xl flex-shrink-0" />

          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}