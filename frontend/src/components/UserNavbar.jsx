import React, { useEffect, useState } from 'react'
import ceiLogo from '../assets/cei.png'
import { IoIosLogOut } from "react-icons/io";
import { NavLink, useNavigate} from "react-router-dom"

export default function UserNavbar() {
    const[name, setName] = useState("")

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
            setName(user.name)
        }
    })

    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')

        navigate("/login")
    }
    

  return (
      <>
      <div className="w-full flex justify-between items-center bg-white px-6 py-3 border-b-2 border-orange-500">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-4">

    <img 
      src={ceiLogo} 
      alt="CEi Logo" 
      className="w-10 h-10 object-contain"
    />

    <h1 className="text-xl font-bold">
      CEiVoice
    </h1>

    {/* Navigation Links */}
    <div className="hidden md:flex items-center gap-8 ml-8 text-lg font-semibold">

      <NavLink to="/dashboard"
        className={({ isActive }) =>
          isActive ? "text-orange-500" : "text-black"
        }>
        Dashboard
      </NavLink>

      <NavLink to="/submitrequest"
        className={({ isActive }) =>
          isActive ? "text-orange-500" : "text-black"
        }>
        Submit Request
      </NavLink>

      <NavLink to="/tracking"
        className={({ isActive }) =>
          isActive ? "text-orange-500" : "text-black"
        }>
        Tracking Ticket
      </NavLink>

    </div>
  </div>

  {/* RIGHT SIDE name/logout */}
  <div className="flex items-center gap-6 text-sm md:text-base">

    <div className="flex flex-col items-center">
      <span className="border-b border-black px-2">
        {name}
      </span>
      <span>User</span>
    </div>

    <div className="flex items-center cursor-pointer">
      <IoIosLogOut onClick={handleLogout} className="text-xl" />
      <button onClick={handleLogout} className="ml-2">
        Logout
      </button>
    </div>

  </div>

</div>
      </>
    )
  }
