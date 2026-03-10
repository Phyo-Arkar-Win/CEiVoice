import React from "react";
import Navbar from "../components/Navbar";
import ceiLogo from "../assets/cei.png";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar title="Log in" />

      <div className="min-h-screen bg-gray-200 p-8">

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={ceiLogo}
              alt="CEi Logo"
              className="w-12 h-12 object-contain"
            />
            <h2 className="text-2xl font-bold">Welcome to CEi Voice</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Submit feedback, requests, or track your tickets easily.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Track Ticket
          </button>
        </div>

        {/* Need Help Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">❓</span>
                <h3 className="text-xl font-bold">Need Help?</h3>
              </div>

              <p className="text-gray-600">
                Quickly submit a request so that we can help you
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Submit Request
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}