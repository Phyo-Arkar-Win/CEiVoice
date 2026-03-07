import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
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
import Draft from "./pages/Admin/Draft"
import Staff from "./pages/Admin/StaffManagement"
import Tickets from "./pages/Admin/Tickets"

// Assignee
import Assignee_Dashboard from "./pages/Assignee/Assignee_Dashboard"
import Assignee_Referral from './pages/Assignee/Referral';
import Assignee_Historylog from './pages/Assignee/History_log'; 
import Assignee_Ticket_Details from './pages/Assignee/Assignee_Ticket_Details';
import StaffManagement from './pages/Admin/StaffManagement';

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
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/submit" element={<SubmitReq />} />
                    <Route path="/track" element={<Tracking />} />
                    <Route path="/confirmation" element={<Confirmation />} />

                    {/* Admin Route */}
                    <Route path='/admin_dashboard' element={<Admin_Dashboard/>}/>
                    <Route path='/drafts' element={<Draft/>}/>
                    <Route path='/tickets' element={<Tickets/>}></Route>
                    <Route path='/staff' element={<StaffManagement/>}/>

                    {/* Assignee Route */}
                    <Route path='/assignee_dashboard' element={<Assignee_Dashboard/>}/>
                    <Route path='/assignee_referral' element={<Assignee_Referral/>}/>
                    <Route path='/assignee_historylog' element={<Assignee_Historylog/>}/>
                    <Route path='/assignee_ticket_details' element={<Assignee_Ticket_Details/>}/>
                    <Route path='/assignee_ticket_details/:ticketId' element={<Assignee_Ticket_Details/>}/>

                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App;
