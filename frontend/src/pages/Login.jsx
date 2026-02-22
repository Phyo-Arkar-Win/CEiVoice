import React from 'react'
import Navbar from '../components/Navbar'
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode'
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {

    const [showPassword, setShowPassword] = useState(false);

    // GOOGLE LOGIN
    const handleGoogleLoginSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);

        console.log(decoded);

        alert(`Welcome, ${decoded.name}`);

        `YOU ON YOUR OWN TONYYYYYYYY 
        sa dr pr, I don't know how to implement this, HELPPP`
    }

    return(
        <>
        <div className="min-h-screen bg-gray-300">

      {/* Navbar */}
      <Navbar title="Sign up" />

      {/* Centered Card */}
      <div className="py-6 flex justify-center items-center mt-16">
        <div className="bg-[rgb(241,236,236)] w-96 rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-center mb-6">
            Login
          </h2>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-gray-300 rounded-lg p-2 outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-gray-300 rounded-lg p-2 pr-10 outline-none"
            />
            <button onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-10 cursor-pointer'>{showPassword ? <FaEyeSlash/> : <FaEye/>}</button>
          </div>

          {/* Login Button */}
          <button className="w-full mt-0.5 bg-[rgb(227,82,5)] hover:bg-[rgb(180,65,4)] cursor-pointer text-white py-3 rounded-2xl font-medium mb-4">
            Login
          </button>

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
            <p>Don't have an account? <a href="/register" className="text-blue-500 hover:underline ">Sign up</a></p>
          </div>

        </div>
      </div>

    </div>
    </>
    )
}