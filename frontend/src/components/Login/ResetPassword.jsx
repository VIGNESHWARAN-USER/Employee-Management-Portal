import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../../api'
import { Toaster, toast } from 'sonner';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import loginimg from '../../assets/login.jpg';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Invalid session. Please start the password reset process again.");
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);

    // --- Replace with your actual API endpoint ---
    const resetPromise = api.post("/api/reset-password", { email, password });

    toast.promise(resetPromise, {
      loading: 'Resetting password...',
      success: () => {
        setTimeout(() => navigate('/login'), 2000);
        return 'Password has been reset successfully! Redirecting to login...';
      },
      error: () => {
        setIsLoading(false);
        return 'Failed to reset password. Please try again.';
      },
    });
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex h-screen font-sans">
        <div className="hidden h-full lg:flex items-center justify-center flex-1 bg-white">
            <img src={loginimg} alt="Reset Password" className="max-w-lg w-full rounded-lg" />
        </div>
        <div className="w-full bg-gray-50 lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md w-full p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Set New Password</h1>
              <p className="text-gray-500">Your new password must be different from previous ones.</p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password Input */}
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="pl-10 pr-10 py-2 w-full border rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  className="pl-10 pr-10 py-2 w-full border rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isLoading ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;