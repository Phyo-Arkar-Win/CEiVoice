import React from 'react'
import AssigneeNavbar from '@/components/AssigneeNavbar'

export default function Assignee_Referral() {
  return (
    <div className='flex bg-gray-100 min-h-screen'>
      <AssigneeNavbar />
      <div className='flex-1 p-4 md:p-8 min-w-0 overflow-hidden'>
        <div className='bg-white shadow rounded-xl p-4 md:p-6 mb-6 w-full'>
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Referrals</h2>
          <div className='text-lg md:text-2xl text-gray-600'> 
            Sate Nyit Sayr 
          </div>
        </div>
      </div>
    </div>
  )
}
