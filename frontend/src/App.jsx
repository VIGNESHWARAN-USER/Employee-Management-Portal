import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import ForgotPassword from './components/Login/ForgotPassword'; // <-- Import
import VerifyOTP from './components/Login/VerifyOTP';         // <-- Import
import ResetPassword from './components/Login/ResetPassword'; // <-- Import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      
      {/* Add the new routes for the forgot password flow */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}



export default App;