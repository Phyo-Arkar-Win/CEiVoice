import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleNavigateByRole = (role) => {
    if (role === "admin") navigate("/admin_dashboard");
    else if (role === "assignee") navigate("/assignee_dashboard");
    else navigate("/dashboard");
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user } = response.data; // cookies set automatically by backend

      localStorage.setItem("role", user.role);
      handleNavigateByRole(user.role);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("/auth/login/google", {
        token: credentialResponse.credential,
      });
      const { user } = response.data; // cookies set automatically by backend

      localStorage.setItem("role", user.role);
      handleNavigateByRole(user.role);
    } catch (error) {
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-300">
      <Navbar title="Sign up" />

      <div className="py-6 flex justify-center items-center mt-16">
        <div className="bg-[rgb(241,236,236)] w-96 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form onSubmit={handleManualLogin}>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-300 rounded-lg p-2 outline-none"
                required
              />
            </div>

            <div className="mb-6 relative">
              <label className="block mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-300 rounded-lg p-2 pr-10 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-0.5 bg-[rgb(227,82,5)] hover:bg-[rgb(180,65,4)] cursor-pointer text-white py-3 rounded-2xl font-medium mb-4"
            >
              Login
            </button>
          </form>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-400"></div>
            <span className="px-3 text-sm text-gray-600">or</span>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => console.log("Google login failed")}
            />
          </div>

          <div className="flex items-center justify-center mt-2 text-md">
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}