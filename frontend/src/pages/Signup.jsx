import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { GoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from "../api/axios"

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleNavigateByRole = (role) => {
    if (role === "admin") navigate("/admin_dashboard");
    else if (role === "assignee") navigate("/assignee_dashboard");
    else navigate("/dashboard");
  };

  const handleManualSignup = async (e) => {
    e.preventDefault();
    try {
      // Backend sets cookies and returns user on signup too
      const response = await api.post("/auth/signup", { username, email, password, confirmPassword });
      const { user } = response.data;

      localStorage.setItem("role", user.role);
      handleNavigateByRole(user.role); // auto login after signup since backend sets cookies
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed. Please try again.");
    }
  }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("/auth/login/google", {
        token: credentialResponse.credential
      });
      const { user } = response.data;

      localStorage.setItem("role", user.role);
      handleNavigateByRole(user.role);
    } catch (error) {
      alert("Google login failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <Navbar title="Log in" />

      <div className="py-5 flex justify-center items-center mt-10">
        <div className="bg-[rgb(241,236,236)] w-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          <form onSubmit={handleManualSignup}>
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
                className='absolute right-3 top-10 cursor-pointer'
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

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
                className='absolute right-3 top-10 cursor-pointer'
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-0.5 bg-[rgb(227,82,5)] hover:bg-[rgb(180,65,4)] cursor-pointer text-white flex justify-center py-3 rounded-2xl font-medium mb-4"
            >
              Sign Up
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
              onError={() => console.log('Google login failed')}
            />
          </div>

          <div className='flex items-center justify-center mt-2 text-md'>
            <p>Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}