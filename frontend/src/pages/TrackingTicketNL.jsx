import { useState } from "react";
import api from "../api/axios";
import ceiLogo from "../assets/cei.png";
import noSearchImg from "../assets/no_search.png";
import error_img from "../assets/error_img.png";
import NavBarNoLogin from "../components/NavbarNoLogin";


export default function TrackTicket() {
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("")

  const onSearch = async (e) => {
    e.preventDefault();
    setError("");
    setTicket(null);    

    if (!trackingId.trim() || !email.trim()) {
      setStatus("error");
      setError("Please enter both Tracking ID and Email.");
      return;
    }

    try {
      setStatus("loading");

      const res = await api.post("/api/tickets/track", {
        trackingId,
        email,
      });

      setTicket(res.data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.message ||
          "Ticket not found. Please check your Tracking ID and Email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">

      <div className="bg-white border-b-2 border-orange-500 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={ceiLogo} alt="CEi Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-semibold text-black">CEiVoice</h1>
        </div>

        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
          onClick={() => window.location.href = "/login"}
        >
          Log in
        </button>
      </div>

      <div className="max-w-5xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-center text-2xl font-semibold mb-6">
          Track your ticket
        </h2>

        <form
          onSubmit={onSearch}
          className="flex flex-col md:flex-row gap-4 items-end justify-center"
        >
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-medium mb-1">Tracking ID</label>
            <input
              className="border rounded-xl px-4 py-2 focus:outline-none border-orange-500"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-medium mb-1">Email</label>
            <input
              type="email"
              className="border rounded-xl px-4 py-2 focus:outline-none border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl cursor-pointer"
          >
            {status === "loading" ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="mt-10 border rounded-2xl p-8 min-h-250px flex items-center justify-center">

          {status === "idle" && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <p className="text-gray-600 max-w-md">
                Enter your ticket’s tracking ID number above and click
                <strong> “Search” </strong>
                to find the status of your request.
              </p>

              <img
                src={noSearchImg}
                alt="No Search"
                className="w-48 object-contain"
              />
            </div>
          )}

          {status === "error" && (
              <div className="flex items-center gap-3 text-red-500 font-medium">
                <img
                    src={error_img}
                    alt="Error"
                    className="w-6 h-6 object-contain"      
                    />
                <span>{error}</span>
            </div>
          )}

          {status === "success" && ticket && (
            <div className="text-center space-y-3">
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Category:</strong> {ticket.category}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Last Updated:</strong> {ticket.updatedAt}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}