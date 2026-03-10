import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { BsGraphUp } from "react-icons/bs";
import { IoMailOpenSharp, IoTicket } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";

export default function AdminNavbar() {

  const [name, setName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

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
    `flex items-center py-3 px-6 font-bold ${
      isActive ? "text-orange-500" : "text-black"
    }`;

  return (
    <>
      {/* ================= MOBILE TOPBAR ================= */}

      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-orange-500">

        <div className="flex items-center gap-2">
          <img src={ceiLogo} className="w-8 h-8"/>
          <span className="font-bold">CEiVoice</span>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <HiX size={26}/> : <HiMenu size={26}/>}
        </button>

      </div>


      {/* ================= MOBILE MENU ================= */}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 border-r-2 border-orange-500 transform transition-transform duration-300 z-50 md:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-500">
          <img src={ceiLogo} className="w-10 h-10"/>
          <h1 className="font-bold text-lg">CEiVoice</h1>
        </div>

        <div className="flex flex-col items-center py-6">
          <span className="border-b border-black px-2">{name}</span>
          <span className="text-sm mt-1">Admin</span>
        </div>

        <nav className="flex flex-col">

          <NavLink to="/admin_dashboard" className={linkStyle} onClick={()=>setMobileOpen(false)}>
            <BsGraphUp className="text-xl mr-3"/> Dashboard
          </NavLink>

          <NavLink to="/drafts" className={linkStyle} onClick={()=>setMobileOpen(false)}>
            <IoMailOpenSharp className="text-xl mr-3"/> Drafts
          </NavLink>

          <NavLink to="/tickets" className={linkStyle} onClick={()=>setMobileOpen(false)}>
            <IoTicket className="text-xl mr-3"/> Tickets
          </NavLink>

          <NavLink to="/staff" className={linkStyle} onClick={()=>setMobileOpen(false)}>
            <MdManageAccounts className="text-xl mr-3"/> Staff
          </NavLink>

        </nav>

        <div
          onClick={handleLogout}
          className="absolute bottom-0 w-full flex items-center gap-2 px-6 py-4 hover:bg-gray-200 cursor-pointer"
        >
          <IoIosLogOut className="text-xl"/> Logout
        </div>

      </div>


      {/* ================= TABLET SIDEBAR ================= */}

      <div
        className={`hidden md:flex lg:hidden flex-col bg-gray-100 border-r-2 border-orange-500 transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}`}
      >

        <div className="flex items-center justify-between px-3 py-4 border-b border-orange-500">

          <img src={ceiLogo} className="w-8 h-8"/>

          <button onClick={()=>setCollapsed(!collapsed)}>
            <HiMenu/>
          </button>

        </div>

        <nav className="flex flex-col mt-4">

          <NavLink to="/admin_dashboard" className={linkStyle}>
            <BsGraphUp className="text-xl mr-3"/>
            {!collapsed && "Dashboard"}
          </NavLink>

          <NavLink to="/drafts" className={linkStyle}>
            <IoMailOpenSharp className="text-xl mr-3"/>
            {!collapsed && "Drafts"}
          </NavLink>

          <NavLink to="/tickets" className={linkStyle}>
            <IoTicket className="text-xl mr-3"/>
            {!collapsed && "Tickets"}
          </NavLink>

          <NavLink to="/staff" className={linkStyle}>
            <MdManageAccounts className="text-xl mr-3"/>
            {!collapsed && "Staff"}
          </NavLink>

        </nav>

        <div
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-6 py-4 hover:bg-gray-200 cursor-pointer"
        >
          <IoIosLogOut className="text-xl"/>
          {!collapsed && "Logout"}
        </div>

      </div>


      {/* ================= DESKTOP SIDEBAR ================= */}

      <div className="hidden lg:flex flex-col w-64 bg-gray-100 border-r-2 border-orange-500">

        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-500">
          <img src={ceiLogo} className="w-10 h-10"/>
          <h1 className="text-xl font-bold">CEiVoice</h1>
        </div>

        <div className="flex flex-col items-center py-6">
          <span className="border-b border-black px-2">{name}</span>
          <span className="text-sm mt-1">Admin</span>
        </div>

        <nav className="flex flex-col">

          <NavLink to="/admin_dashboard" className={linkStyle}>
            <BsGraphUp className="text-xl mr-3"/> Dashboard
          </NavLink>

          <NavLink to="/drafts" className={linkStyle}>
            <IoMailOpenSharp className="text-xl mr-3"/> Drafts
          </NavLink>

          <NavLink to="/tickets" className={linkStyle}>
            <IoTicket className="text-xl mr-3"/> Tickets
          </NavLink>

          <NavLink to="/staff" className={linkStyle}>
            <MdManageAccounts className="text-xl mr-3"/> Staff
          </NavLink>

        </nav>

        <div
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 px-6 py-4 hover:bg-gray-200 cursor-pointer"
        >
          <IoIosLogOut className="text-xl"/> Logout
        </div>

      </div>
    </>
  );
}