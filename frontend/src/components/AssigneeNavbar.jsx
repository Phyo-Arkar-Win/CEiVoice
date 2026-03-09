import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";

export default function AssigneeNavbar({ collapsed, setCollapsed }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setName(user.name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 py-3 px-6 mt-2 font-semibold ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <div
      className={`fixed top-0 left-0 h-screen ${
        collapsed ? "w-20" : "w-64"
      } bg-gray-100 border-r-2 border-orange-500 flex flex-col transition-all duration-300`}
    >
      <div className="flex flex-col flex-1">

        {/* Logo */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-6 py-4 border-b-2 border-orange-500 cursor-pointer"
        >
          <img src={ceiLogo} className="w-12 h-12 object-contain" />
          {!collapsed && <h1 className="text-xl font-bold">CEiVoice</h1>}
        </div>

        {/* User */}
        {!collapsed && (
          <div className="flex flex-col items-center py-4 mt-4">
            <span className="border-b text-lg border-black px-2 font-medium">
              {name}
            </span>
            <span className="text-md mt-1">Assignee</span>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col text-lg mt-4">
          <NavLink to="/assignee_dashboard" className={linkStyle}>
            <BsGraphUp />
            {!collapsed && "Dashboard"}
          </NavLink>

          <NavLink to="/assignee_referral" className={linkStyle}>
            <IoPeopleOutline />
            {!collapsed && "Referral"}
          </NavLink>

          <NavLink to="/assignee_historylog" className={linkStyle}>
            <MdOutlineAccessTime />
            {!collapsed && "History Log"}
          </NavLink>
        </div>

      </div>

      {/* Logout */}
      <div
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-gray-200 text-lg border-t"
      >
        <IoIosLogOut className="text-2xl" />
        {!collapsed && "Logout"}
      </div>
    </div>
  );
}