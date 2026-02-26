import React, { useEffect, useState } from "react";
import UserNavbar from "../components/userNavbar";
import api from "../api/axios";

export default function SubmitReq() {
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      (setEmail(user.email), []);
    }

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
      setError("Please descirbe your issue.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/submit", {
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
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <UserNavbar></UserNavbar>

        {/* This makes remaining space fill */}
        <div className="flex flex-1 justify-center items-start pt-0 mt-10">
          <div className="w-11/12 h-full bg-surface rounded-2xl shadow-lg p-8 flex flex-col">
            <h2 className="text-3xl font-bold text-center mb-8">
              Submit a Request
            </h2>

            {/* Content grows */}
            <div className="flex-1 ml-50 mr-50 ">
              <h3 className="text-2xl font-semibold mb-2">Email</h3>
              <p className="mb-6 text-gray-700 text-xl">{email}</p>

              <h3 className="text-2xl font-semibold mb-2">Issue</h3>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full h-full min-h-75 p-4 border-2 border-orange-400 rounded-xl resize-none outline-none"
              />
            </div>

            {message && (
              <p className="text-green-600 font-semibold text-center mt-4">
                {message}
              </p>
            )}

            {error && (
              <p className="text-red-600 font-semibold text-center mt-4">
                {error}
              </p>
            )}

            {/* Button stays bottom */}
            <div className="flex justify-end mt-6 mr-15">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary-500 text-white px-6 py-2 hover:bg-primary-600 cursor-pointer rounded-lg mr-34"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
