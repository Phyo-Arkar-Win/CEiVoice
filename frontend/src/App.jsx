import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

// User
import Dashboard from './pages/User/Dashboard';
import SubmitReq from './pages/User/SubmitReq';
import Tracking from './pages/User/Tracking';
import Confirmation from "./pages/User/Confirmation"

// Admin
import Admin_Dashboard from './pages/Admin/Admin_Dashboard';

// Assignee
import Assignee_Dashboard from "./pages/Assignee/Assignee_Dashboard"
import Assignee_Referral from './pages/Assignee/Referral';
import Assignee_Historylog from './pages/Assignee/History_log';

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    

                    {/* AUTHENTICATION */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/trackticket" element={<TrackTicket />} />

                    {/* User Route */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/submit" element={<SubmitReq />} />
                    <Route path="/track" element={<Tracking />} />
                    <Route path="/confirmation" element={<Confirmation />} />

                    {/* Admin Route */}
                    <Route path='/admin_dashboard' element={<Admin_Dashboard/>}/>

                    {/* Assignee Route */}
                    <Route path='/assignee_dashboard' element={<Assignee_Dashboard/>}/>
                    <Route path='/assignee_referral' element={<Assignee_Referral/>}/>
                    <Route path='/assignee_historylog' element={<Assignee_Historylog/>}/>

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
