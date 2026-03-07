import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineAccessTime } from "react-icons/md";

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
    `block py-3 mt-4 px-6 font-semibold ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <>
    <div className="h-screen w-64  bg-gray-100 border-r-2 border-orange-500 flex flex-col justify-between">

      {/* TOP SECTION */}
      <div>
        {/* Logo + Title */}
        <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-orange-500">
          <img src={ceiLogo} alt="CEi Logo" className="w-15 h-15 object-contain" />
          <h1 className="text-xl font-bold">CEiVoice</h1>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center py-6 mt-4">
          <span className="border-b text-xl border-black px-2 font-medium">
            {name}
          </span>
          <span className="text-xl mt-1">Assignee</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col py-4 text-xl mt-4">
          <NavLink to="/assignee_dashboard" className={({isActive})=>`${linkStyle({ isActive })} flex gap-2`}>
          <BsGraphUp className="font-bold mt-1" />
          
           Dashboard
          </NavLink>
          
          <NavLink to="/assignee_referral" className={({isActive})=>`${linkStyle({ isActive })} flex gap-2`}>
          <IoPeopleOutline className="font-bold mt-1"/>
            Referral
          </NavLink>

          <NavLink to="/assignee_historylog" className={({isActive})=>`${linkStyle({ isActive })} flex gap-2`}>
            <MdOutlineAccessTime className="font-bold mt-1"/>
            History Log
          </NavLink>

         
        </div>
      </div>

      {/* LOGOUT SECTION */}
      <div
        onClick={handleLogout}
        className="flex items-center text-xl justify-center  gap-2 px-6 py-4 cursor-pointer hover:bg-gray-200">
        <IoIosLogOut className="text-2xl" />
        <span>Logout</span>
      </div>
    </div>
    </>
  );
}