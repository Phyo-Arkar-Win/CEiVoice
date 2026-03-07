import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "@/components/userNavbar";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [email, setEmail ] = useState("")
  
  const location = useLocation();
  const trackingId = location.state?.trackingId;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      setEmail(user.email);
    }
  }, [])


  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
      <UserNavbar />

      {/* Content Wrapper */}
      <div className="flex justify-center px-4 pt-12 pb-16 mt-4">
        <div
          className="
            w-[90%]
            md:w-[80%]
            mx-auto
            bg-[rgb(241,236,236)]
            rounded-2xl
            shadow-xl
            p-6
            sm:p-8
            md:p-10
            flex
            flex-col
            items-center
            text-center
          "
        >
          {/* Success Header */}
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Request Submitted Successfully!
          </h2>

          <p className="text-gray-700 mb-6">
            Thank you for contacting CEiVoice. Your request has been received.
          </p>

          <hr className="w-full my-6 border-gray-400" />

          {/* Tracking Info */}
          <div className="w-full text-left">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Tracking ID: {trackingId}
            </h3>

            <p className="text-gray-700 mb-2">
              We have sent a confirmation email to{" "}
              <span className="font-semibold underline break-all">
                {email}
              </span>
            </p>

            <p className="text-gray-700">
              You can use your tracking ID to check the status of your request anytime.
            </p>
          </div>

          <hr className="w-full my-6 border-gray-400" />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigate("/track")}
              className="
                bg-orange-500
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-orange-600
                active:scale-95
                transition
              "
            >
              Track Ticket
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="
                bg-gray-400
                text-black
                px-8
                py-3
                rounded-lg
                hover:bg-gray-500
                active:scale-95
                transition
              "
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}