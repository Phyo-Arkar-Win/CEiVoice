import React, { useEffect, useState } from "react";
import UserNavbar from "../components/userNavbar";
import api from "../api/axios";

export default function SubmitReq() {
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load user email once
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setEmail(user.email);
    }
  }, []);

  // Auto clear message/error
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (!issue.trim()) {
      setError("Please describe your issue.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/submit", {
        email,
        issue,
      });

      setMessage("Ticket submitted successfully! Please check your email.");
      setIssue("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          "
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Submit a Request
          </h2>

          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Email</h3>
            <p className="mb-6 text-gray-700 break-all">{email}</p>

            <h3 className="text-lg sm:text-xl font-semibold mb-2">Issue</h3>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Please describe your issue in detail..."
              className="
                w-full
                min-h-[180px]
                sm:min-h-[220px]
                md:min-h-[300px]
                p-4
                border-2
                border-orange-400
                rounded-xl
                resize-none
                outline-none
                focus:ring-2
                focus:ring-orange-300
                transition
              "
            />
          </div>

          {message && (
            <p className="text-green-600 font-semibold text-center mt-6">
              {message}
            </p>
          )}

          {error && (
            <p className="text-red-600 font-semibold text-center mt-6">
              {error}
            </p>
          )}

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="
                bg-orange-500
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-orange-600
                active:scale-95
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}