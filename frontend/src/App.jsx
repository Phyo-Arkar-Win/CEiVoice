import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import SubmitReq from './pages/SubmitReq';
import Tracking from './pages/Tracking';
import Dashboard from './pages/Dashboard';
import TrackTicket from './pages/TrackingTicketNL';
// import Signup from './pages/Signup';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/submitrequest" element={<SubmitReq/>} />
          <Route path="/tracking" element={<Tracking/>} />
          <Route path="/trackticket" element={<TrackTicket />} />

          {/* <Route path='/register' element={<Signup />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
