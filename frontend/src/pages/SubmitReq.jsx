import React, { useEffect, useState } from "react"
import UserNavbar from "../components/userNavbar"


export default function SubmitReq() {
    const [email, setEmail ] = useState("")

    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
            setEmail(user.email)
        }
    })

    return(
        <>
        <div className="min-h-screen bg-gray-300 flex flex-col">
        <UserNavbar></UserNavbar>

        {/* This makes remaining space fill */}
        <div className="flex flex-1 justify-center items-start pt-0 mt-10">
            
            <div className="w-11/12 h-full bg-[rgb(241,236,236)] rounded-2xl shadow-lg p-8 flex flex-col">
            
            <h2 className="text-3xl font-bold text-center mb-8">
                Submit a Request
            </h2>

            {/* Content grows */}
            <div className="flex-1 ml-50 mr-50 ">
                <h3 className="text-2xl font-semibold mb-2">Email</h3>
                <p className="mb-6 text-gray-700 text-xl" 
                >{email}</p>

                <h3 className="text-2xl font-semibold mb-2">Issue</h3>
                <textarea
                placeholder="Please describe your issue in detail..."
                className="w-full h-full min-h-[300px] p-4 border-2 border-orange-400 rounded-xl resize-none outline-none"
                />
            </div>

            {/* Button stays bottom */}
            <div className="flex justify-end mt-6 mr-15">
                <button className="bg-orange-500 text-white px-6 py-2 hover:bg-orange-700 cursor-pointer rounded-lg">
                Submit Request
                </button>
            </div>

            </div>

        </div>
        </div>
        </>
    )
}