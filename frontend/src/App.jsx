import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';


import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";


// User
import Dashboard from './pages/User/Dashboard';
import SubmitReq from './pages/User/SubmitReq';
import Tracking from './pages/User/Tracking';
import Confirmation from "./pages/User/Confirmation"

// Admin
import Admin_Dashboard from './pages/Admin/AdminDashboard';
import Draft from "./pages/Admin/Draft"
import Staff from "./pages/Admin/StaffManagement"
import Tickets from "./pages/Admin/Tickets"

// Assignee
import Assignee_Dashboard from "./pages/Assignee/AssigneeDashboard"
import Assignee_Referral from './pages/Assignee/Referral';
import Assignee_Historylog from './pages/Assignee/HistoryLog';

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Home "/" Route */}
                    <Route path='/' element={<Home/>}/>

                    {/* AUTHENTICATION */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/trackticket" element={<TrackTicket />} />

                    {/* User Route */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={["user"]}> <Dashboard /></ProtectedRoute>} />
                    <Route path="/submit" element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <SubmitReq />
                        </ProtectedRoute>} />

                    <Route path="/track" element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <Tracking />
                        </ProtectedRoute>} />

                    <Route path="/confirmation" element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <Confirmation />
                        </ProtectedRoute>} />

                    {/* Admin Route */}
                    <Route path='/admin_dashboard' element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Admin_Dashboard />
                        </ProtectedRoute>} />

                    <Route path='/drafts' element={<Draft/>}/>
                    <Route path='/tickets' element={<Tickets/>}></Route>
                    <Route path='/staff' element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Staff />
                        </ProtectedRoute>} />

                    {/* Assignee Route */}
                    <Route path='/assignee_dashboard' element={
                        <ProtectedRoute allowedRoles={["assignee"]}>
                            <Assignee_Dashboard />
                        </ProtectedRoute>}/>
                    <Route path='/assignee_referral' element={
                        <ProtectedRoute allowedRoles={["assignee"]}>
                            <Assignee_Referral />
                        </ProtectedRoute>}/>
                    <Route path='/assignee_historylog' element={
                        <ProtectedRoute allowedRoles={["assignee"]}>
                            <Assignee_Historylog />
                        </ProtectedRoute>}/>
                    
                    {/* UNAUTHORIZED PAGE */}
                    <Route path="/unauthorized" element={<Unauthorized />} />

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
