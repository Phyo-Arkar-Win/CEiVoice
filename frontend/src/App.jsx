import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
// import Signup from './pages/Signup';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<></>} />

          {/* <Route path='/register' element={<Signup />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
