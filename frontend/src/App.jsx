import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrackTicket from './pages/TrackingTicketNL';

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
import AdminTicketDetails from "./pages/Admin/AdminTicketDetails";

// Assignee
import Assignee_Dashboard from "./pages/Assignee/AssigneeDashboard"
import Assignee_Historylog from './pages/Assignee/HistoryLog';
import Assignee_Ticket_Details from './pages/Assignee/AssigneeTicketDetails';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/trackticket" element={<TrackTicket />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitReq />} />
        <Route path="/track" element={<Tracking />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/user_ticket_detail/:routeTicketId" element={<UserTicketDetails />} />

        {/* Admin Routes */}
        <Route path="/admin_dashboard" element={<Admin_Dashboard />} />
        <Route path="/drafts" element={<Draft />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/drafts/merge" element={<MergeDraftToNew />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin_ticket_details/:routeTicketId" element={<AdminTicketDetails />} />

        {/* Assignee Routes */}
        <Route path="/assignee_dashboard" element={<Assignee_Dashboard />} />
        <Route path="/assignee_historylog" element={<Assignee_Historylog />} />
        <Route path="/assignee_ticket_details/:routeTicketId" element={<Assignee_Ticket_Details />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;