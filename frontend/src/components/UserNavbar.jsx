import React, { useEffect, useState } from "react";
import ceiLogo from "../assets/cei.png";
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

export default function UserNavbar() {

  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

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
    isActive ? "text-orange-500 font-semibold" : "text-gray-700";

  return (
    <div className="w-full bg-white border-b border-orange-500">

      {/* TOP BAR */}

      <div className="flex items-center justify-between px-4 py-3">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={ceiLogo} className="w-8 h-8"/>
          <span className="font-bold text-lg">CEiVoice</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">

          <NavLink to="/dashboard" className={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/submit" className={linkStyle}>
            Submit Request
          </NavLink>

          <NavLink to="/track" className={linkStyle}>
            Track Ticket
          </NavLink>

        </div>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-6">

          <div className="text-sm">
            <span className="border-b border-black px-2">{name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-700 hover:text-orange-600"
          >
            <IoIosLogOut size={20}/>
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
            Track Ticket
          </NavLink>

          <div className="border-t pt-3 flex justify-between items-center">

            <span className="text-sm">{name}</span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-700"
            >
              <IoIosLogOut size={20}/>
              Logout
            </button>

          </div>

        </div>

      )}

    </div>
  );
}