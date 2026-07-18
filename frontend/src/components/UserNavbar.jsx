import React, { useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

export default function UserNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkStyle = ({ isActive }) =>
    isActive ? "text-orange-500 font-bold" : "text-black font-bold hover:text-orange-500 transition-colors";

  return (
    <div className="w-full bg-white border-b border-orange-500">

      {/* TOP BAR */}

      <div className="flex items-center justify-between px-4 py-3">

        {/* Left Section (Logo + Links) */}
        <div className="flex items-center gap-8 md:gap-12">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={ceiLogo} className="w-10 h-10 object-contain"/>
            <span className="font-bold text-xl min-w-max">CEiVoice</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-bold text-lg">

            <NavLink to="/dashboard" className={linkStyle}>
              Dashboard
            </NavLink>

            <NavLink to="/submit" className={linkStyle}>
              Submit Request
            </NavLink>

            <NavLink to="/track" className={linkStyle}>
              Tracking Ticket
            </NavLink>

          </div>
        </div>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-8">

          <div className="flex flex-col items-center text-sm">
            <span className="border-b border-black px-4 pb-0.5">{user?.name || "User"}</span>
            <span className="text-gray-600 text-xs mt-0.5">User</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-800 hover:text-orange-600 font-medium"
          >
            <IoIosLogOut size={22}/>
            Logout
          </button>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <HiX size={26}/> : <HiMenu size={26}/>}
        </button>

      </div>


      {/* MOBILE MENU */}

      {open && (

        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4 font-medium">

          <NavLink to="/dashboard" onClick={()=>setOpen(false)} className={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/submit" onClick={()=>setOpen(false)} className={linkStyle}>
            Submit Request
          </NavLink>

          <NavLink to="/track" onClick={()=>setOpen(false)} className={linkStyle}>
            Tracking Ticket
          </NavLink>

          <div className="border-t pt-3 flex justify-between items-center">

            <div className="flex flex-col text-sm">
              <span className="font-medium">{user?.name || "User"}</span>
              <span className="text-gray-600 text-xs text-left">User</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-800 hover:text-orange-600"
            >
              <IoIosLogOut size={22}/>
              Logout
            </button>

          </div>

        </div>

      )}

    </div>
  );
}