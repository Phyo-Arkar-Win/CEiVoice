import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoPerson } from "react-icons/io5";

export default function AssigneeNavbar() {
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
    `flex items-center gap-4 py-3 px-5 mt-2 font-semibold whitespace-nowrap ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <div className="group fixed top-0 left-0 h-screen w-20 hover:w-64 bg-gray-100 border-r-2 border-orange-500 flex flex-col transition-all duration-300 ease-in-out">

      <div className="flex flex-col flex-1">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b-2 border-orange-500">
          <img src={ceiLogo} className="w-15 h-15 object-contain" />

          <h1 className="text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            CEiVoice
          </h1>
        </div>

        {/* User */}
        {/* User */}
<div className="flex flex-col items-center py-4 mt-4">

  {/* Profile icon when collapsed */}
  <IoPerson  className="text-3xl group-hover:hidden" />

  {/* Username when expanded */}
  <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <span className="border-b text-lg border-black px-2 font-medium">
      {name}
    </span>
    <span className="text-md mt-1">Assignee</span>
  </div>

</div>

        {/* Links */}
        <div className="flex flex-col text-lg mt-4">

          <NavLink to="/assignee_dashboard" className={linkStyle}>
            <BsGraphUp className="text-2xl min-w-[24px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Dashboard
            </span>
          </NavLink>

          <NavLink to="/assignee_referral" className={linkStyle}>
            <IoPeopleOutline className="text-2xl min-w-[24px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Referral
            </span>
          </NavLink>

          <NavLink to="/assignee_historylog" className={linkStyle}>
            <MdOutlineAccessTime className="text-2xl min-w-[24px]" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              History Log
            </span>
          </NavLink>

        </div>

      </div>

      {/* Logout */}
      <div
        onClick={handleLogout}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-200 text-lg border-t"
      >
        <IoIosLogOut className="text-2xl min-w-[24px]" />

        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
      </div>

    </div>
  );
}