import React from "react";
import Navbar from "../components/Navbar";
import ceiLogo from "../assets/cei.png"
import Fahh from "../assets/Fahh.jpg"
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate("")

  const handleClick = () => {
        navigate('/login')
  }

  return (
    <>
      <Navbar title="Log in" />

      <div className="flex flex-col items-center mt-10">
        <div className="bg-gray-200 rounded-xl shadow-md p-6 w-[800px]">

          <div className="flex items-center gap-3 mb-3">
            <img src={ceiLogo} alt='CEi Logo' className='w-20 h-20 object-contain' />
            <h2 className="text-2xl font-semibold">
              Welcome to CEi Voice
            </h2>
          </div>

          <p className="text-black text-2xl font-bold mb-4">
            Ayin Log In Win Lite San Par
          </p>

          <button
          type="button"
          onClick={handleClick}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-lg font-semibold ">
            Login BigASsNig
          </button>

        </div>
        <div className="bg-gray-200 rounded-xl shadow-md p-6 w-[500px] mt-5">
            <img src={Fahh} alt="FAHHHH" />
        </div>

      </div>
    </>
  );
}