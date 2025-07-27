import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import ForgotPassword from './components/Login/ForgotPassword'; 
import VerifyOTP from './components/Login/VerifyOTP';        
import ResetPassword from './components/Login/ResetPassword'; 
import AdminDashboard from './components/Dashboard/AdminDashboard';
import HRDashboard from './components/Dashboard/HRDashboard';
import ManagerDashboard from './components/Dashboard/ManagerDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admindashboard" element={<AdminDashboard/>}/>
      <Route path="/hrdashboard" element={<HRDashboard/>}/>
      <Route path="/managerdashboard" element={<ManagerDashboard/>}/>
      <Route path="/employeedashboard" element={<EmployeeDashboard/>}/>
    </Routes>
  );
}



export default App;