import React from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoPerson } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

export default function AssigneeNavbar() {
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
    `flex items-center py-3 mt-4 px-6 font-bold whitespace-nowrap hover:bg-gray-200 transition ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  const labelStyle =
    "ml-3 opacity-0 md:opacity-100 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap";

  return (
  
    <div
      className="
        group
        sticky
        top-0
        self-start
        h-screen
        w-20
        md:w-64
        hover:w-64
        shrink-0
        bg-gray-100
        border-r-2
        border-orange-500
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        overflow-hidden
        z-40
      "
    >
      {/* TOP SECTION */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-500">
          <img
            src={ceiLogo}
            alt="CEi Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className={`text-xl font-bold ${labelStyle}`}>CEiVoice</h1>
        </div>

        {/* USER INFO */}
        <div className="flex items-center py-3 mt-4 px-6">
          <IoPerson className="text-2xl min-w-[28px]" />

          <div className="ml-3 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-300">
            <div className="font-bold whitespace-nowrap border-b border-black pb-1">
              {displayName}
            </div>
            <div className="text-sm mt-1">Assignee</div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col py-4 text-lg mt-4">
          <NavLink to="/assignee_dashboard" className={linkStyle}>
            <BsGraphUp className="text-2xl min-w-[28px]" />
            <span className={labelStyle}>Dashboard</span>
          </NavLink>

          <NavLink to="/assignee_historylog" className={linkStyle}>
            <MdOutlineAccessTime className="text-2xl min-w-[28px]" />
            <span className={labelStyle}>History Log</span>
          </NavLink>
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center px-6 py-4 cursor-pointer hover:bg-gray-200 border-t w-full text-left bg-gray-100 font-bold"
      >
        <IoIosLogOut className="text-2xl min-w-[28px]" />
        <span className="ml-3 opacity-0 md:opacity-100 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </button>
    </div>
  );
}