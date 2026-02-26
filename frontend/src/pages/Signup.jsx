import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleManualSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/signup", {
        username,
        email,
        password,
        confirmPassword,
      });

      console.log("Signup response:", response.data);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      alert(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
    }
  };

  // GOOGLE SIGNUP
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("/login/google", {
        token: credentialResponse.credential,
      });

      console.log("Backend response:", response.data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // alert(`Welcome, ${user.name}!`);
      navigate("/");
    } catch (error) {
      console.error("Google login failed at backend:", error);
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background ">
        {/* Navbar */}
        <Navbar title="Log in" />

        {/* Centered Card */}
        <div className="py-5 flex justify-center items-center mt-10">
          <div className="bg-background w-100 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

            <form onSubmit={handleManualSignup}>
              {/* Username */}
              <div className="mb-3">
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-300 rounded-lg p-2 outline-none"
                  required
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="mb-4 relative">
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
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              {/*Re-enter Password */}
              <div className="mb-6 relative">
                <label className="block mb-1">Re-enter Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-300 rounded-lg p-2 pr-10 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 cursor-pointer"
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              {/* SignUp Button */}
              <button
                type="submit"
                className="w-full mt-0.5 bg-primary-500 hover:bg-primary-600 cursor-pointer text-white flex justify-center py-3 rounded-2xl font-medium mb-4"
              >
                Sign Up
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center mb-4">
              <div className="flex-1 h-px bg-gray-400"></div>
              <span className="px-3 text-sm text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                className="cursor-pointer"
                onSuccess={handleGoogleLoginSuccess}
                onError={() => {
                  console.log("Google login failed");
                }}
              />
            </div>

            <div className="flex items-center justify-center mt-2 text-md">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline ">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
