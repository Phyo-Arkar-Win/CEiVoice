import React from 'react'
import Navbar from '../components/Navbar'
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'
import { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Signup() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // IMPLEMENT BACKEND TONNNNYYYYY

    alert('Signup successful! Please log in.');

    setTimeout(() => {
      navigate('/login');
    }, 1000);
  }

  // GOOGLE SIGNUP
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/login/google`, {
        token: credentialResponse.credential
      });

      console.log("Backend response:", response.data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert(`Welcome, ${user.name}!`);
      navigate("/");

    } catch (error) {
      console.error("Google login failed at backend:", error);
      alert("Google login failed. Please try again.");
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-300">

        {/* Navbar */}
        <Navbar title="Log in" />

        {/* Centered Card */}
        <div className="py-5 flex justify-center items-center mt-10">
          <div className="bg-[rgb(241,236,236)] w-100 rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold text-center mb-6">
              Sign Up
            </h2>

            <div className="mb-3">
              <label className="block mb-1">Username</label>
              <input
                type="username"
                className="w-full bg-gray-300 rounded-lg p-2 outline-none"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-gray-300 rounded-lg p-2 outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label className="block mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-300 rounded-lg p-2 pr-10 outline-none"
              />
              <button onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-10 cursor-pointer'>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>

            </div>

            {/*Re-enter Password */}
            <div className="mb-6 relative">
              <label className="block mb-1">Re-enter Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-gray-300 rounded-lg p-2 pr-10 outline-none"
              />
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3 top-10 cursor-pointer'>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>

            {/* SignUp Button */}
            <form onSubmit={handleSignup} className="w-full mt-0.5 bg-[rgb(227,82,5)] hover:bg-[rgb(180,65,4)] cursor-pointer text-white flex justify-center py-3 rounded-2xl font-medium mb-4">
              Sign Up
            </form>

            {/* Divider */}
            <div className="flex items-center mb-4">
              <div className="flex-1 h-px bg-gray-400"></div>
              <span className="px-3 text-sm text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin className="cursor-pointer"
                onSuccess={handleGoogleLoginSuccess}
                onError={() => {
                  console.log('Google login failed');
                }}
              />
            </div>

            <div className='flex items-center justify-center mt-2 text-md'>
              <p>Already have an account? <a href="/login" className="text-blue-500 hover:underline ">Login</a></p>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}