<<<<<<< HEAD
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
=======
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
        <Route path="/register" element={<Signup />} />
        {/* <Route path='/register' element={<Signup />} /> */}
    </Routes>
    </BrowserRouter>
>>>>>>> 9870920 (SUPAnig)
    </>
  )
}

<<<<<<< HEAD
export default App
=======
export default App;
>>>>>>> 9870920 (SUPAnig)
