import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

import Dashboard from './pages/User/Dashboard';
import SubmitReq from './pages/User/SubmitReq';
import Tracking from './pages/User/Tracking';
import Confirmation from "./pages/User/Confirmation"

import Admin_Dashboard from './pages/Admin/Admin_Dashboard';

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

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
