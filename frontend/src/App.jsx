import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';


import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";


// User
import Dashboard from "./pages/User/Dashboard";
import SubmitReq from "./pages/User/SubmitReq";
import Tracking from "./pages/User/Tracking";
import Confirmation from "./pages/User/Confirmation";
import UserTicketDetails from "./pages/User/UserTicketDetails";

// Admin
import Admin_Dashboard from "./pages/Admin/AdminDashboard";
import Draft from "./pages/Admin/Draft";
import Staff from "./pages/Admin/StaffManagement";
import Tickets from "./pages/Admin/Tickets";
import MergeDraftToNew from "./pages/Admin/MergeDraftToNew";
import Admin_Ticket_Details from "./pages/Admin/AdminTicketDetails";

// Assignee
import Assignee_Dashboard from "./pages/Assignee/AssigneeDashboard"
import Assignee_Referral from './pages/Assignee/Referral';
import Assignee_Historylog from './pages/Assignee/HistoryLog';
import Assignee_Ticket_Details from './pages/Assignee/AssigneeTicketDetails';

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/trackticket" element={<TrackTicket />} />

                    {/* User Route */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={["user"]}> 
                            <Dashboard />
                        </ProtectedRoute>} />
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
                    <Route path="/user_ticket_details/:routeTicketId" element={
                        <ProtectedRoute allowedRoles={["user"]}>
                            <UserTicketDetails />
                        </ProtectedRoute>} />

                    {/* Admin Route */}
                    <Route path='/admin_dashboard' element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Admin_Dashboard />
                        </ProtectedRoute>} />

                    <Route path='/drafts' element={<ProtectedRoute allowedRoles={["admin"]}><Draft/></ProtectedRoute>}/>
                    <Route path='/tickets' element={<ProtectedRoute allowedRoles={["admin"]}><Tickets/></ProtectedRoute>}/>
                    <Route path='/drafts/merge' element={<ProtectedRoute allowedRoles={["admin"]}><MergeDraftToNew/></ProtectedRoute>}/>
                    <Route path='/staff' element={<ProtectedRoute allowedRoles={["admin"]}><Staff /></ProtectedRoute>} />

                    <Route path='/admin_ticket_details/:routeTicketId' element= {
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Admin_Ticket_Details/>
                        </ProtectedRoute>}/>
                    
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

                    <Route path='/ticket_details/:ticketId' element= {
                        <ProtectedRoute allowedRoles={['assignee']}>
                            <Assignee_Ticket_Details/>
                        </ProtectedRoute>}/>
                    
                    {/* UNAUTHORIZED PAGE */}
                    <Route path="/unauthorized" element={<Unauthorized />} />

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
