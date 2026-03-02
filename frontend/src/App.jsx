import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

import SubmitReq from './pages/User/SubmitReq';
import Tracking from './pages/User/Tracking';
import Dashboard from './pages/User/Dashboard';
import Admin_Dashboard from './pages/Admin/Admin_Dashboard';
// import Signup from './pages/Signup';

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>


                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/submit" element={<SubmitReq />} />
                    <Route path="/track" element={<Tracking />} />
                    <Route path="/trackticket" element={<TrackTicket />} />

                    <Route path='/admin_dashboard' element={<Admin_Dashboard/>}/>

                    {/* <Route path='/register' element={<Signup />} /> */}
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
