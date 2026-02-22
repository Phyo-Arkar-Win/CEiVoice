import React from 'react'
import ceiLogo from '../assets/cei.png'
import { IoIosLogOut } from "react-icons/io";
import { NavLink} from "react-router-dom"

export default function UserNavbar() {
    

  return (
      <>
      <div className="navbar w-full flex justify-between items-center bg-[rgb(255,255,255)] px-4 py-3 border border-b-2 border-[rgb(227,82,5)]">
    <div className="flex items-center gap-2">
      <img 
        src={ceiLogo} 
        alt="CEi Logo" 
        className="w-15 h-15 object-contain"
      /> 
      <h1 className="text-black text text-2xl font-bold font-inter">
      CEiVoice
    </h1>
      <div className="flex items-center gap-15 ml-30 text-2xl font-semibold font-inter ">
        

  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      isActive ? "text-orange-500" : "text-black"
    }
  >
    Dashboard
  </NavLink>

  <NavLink
    to="/submitrequest"
    className={({ isActive }) =>
      isActive ? "text-orange-500" : "text-black"
    }
  >
    Submit Request
  </NavLink>

  <NavLink
    to="/tracking"
    className={({ isActive }) =>
      isActive ? "text-orange-500" : "text-black"
    }
  >
    Tracking Ticket
  </NavLink>

</div>
    </div>
    <div className='flex text-black text-lg'>
        <div className='h-1/2 flex flex-col mr-8'>
            <h1 className='px-4 border-b-1 border-black'>Lin Hein Htet</h1>
            <h1 className='flex justify-center'>User</h1>

        </div>
        <div className='flex items-center cursor-pointer'>
            <IoIosLogOut className="text-3xl" />
            <button className='ml-3 mr-8 cursor-pointer'>
                Logout
            </button>
        </div>
    </div>
  
  </div>
      </>
    )
  }
