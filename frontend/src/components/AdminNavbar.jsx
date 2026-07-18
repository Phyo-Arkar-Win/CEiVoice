import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoMailOpenSharp, IoTicket, IoPerson } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";

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
    `flex items-center py-3 mt-4 px-6 font-bold whitespace-nowrap hover:bg-gray-200 transition ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <div className="group sticky top-0 self-start h-screen w-20 hover:w-64 shrink-0 bg-gray-100 border-r-2 border-orange-500 flex flex-col transition-all duration-300 overflow-hidden z-40">

      {/* TOP SECTION */}
      <div className="flex-1 overflow-hidden">
        {/* LOGO */}
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

        {/* USER */}
<div className="flex items-center py-3 mt-4 px-6">
  <IoPerson className="text-2xl min-w-[28px]" />
  <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="font-bold whitespace-nowrap border-b border-black pb-1">{name}</div>
    <div className="text-sm mt-1">Admin</div>
  </div>
</div>

        {/* NAVIGATION */}
        <div className="flex flex-col py-4 text-lg mt-4">

          <NavLink to="/admin_dashboard" className={linkStyle}>
            <BsGraphUp className="text-2xl min-w-[28px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Dashboard
            </span>
          </NavLink>

          <NavLink to="/drafts" className={linkStyle}>
            <IoMailOpenSharp className="text-2xl min-w-[28px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Drafts
            </span>
          </NavLink>

          <NavLink to="/tickets" className={linkStyle}>
            <IoTicket className="text-2xl min-w-[28px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Tickets
            </span>
          </NavLink>

          <NavLink to="/staff" className={linkStyle}>
            <MdManageAccounts className="text-3xl min-w-[28px]" />
            <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Staff Management
            </span>
          </NavLink>

        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
      className="mt-auto flex items-center px-6 py-4 cursor-pointer hover:bg-gray-200 border-t w-full text-left bg-gray-100 font-bold"
      >
        <IoIosLogOut className="text-2xl min-w-[28px]" />
        <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </button>

    </div>
  );
}