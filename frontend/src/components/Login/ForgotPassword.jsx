import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { Mail, ArrowRight } from 'lucide-react';
import loginimg from '../../assets/login.jpg'; // Adjust path if needed

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // --- Replace with your actual API endpoint ---
    const sendOtpPromise = axios.post("http://localhost:8080/api/forgot-password", { email });

    toast.promise(sendOtpPromise, {
      loading: 'Sending OTP...',
      success: (response) => {
        const otp = response.data;
        navigate('/verify-otp', { state: { email, otp } });
        return 'OTP has been sent to your email!';
      },
      error: (error) => {
        setIsLoading(false);
        if (error.response && error.response.status === 404) {
          return "No account found with this email.";
        }
        return "Failed to send OTP. Please try again.";
      },
    });
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex h-screen font-sans">
        {/* Image Pane */}
        <div className="hidden h-full lg:flex items-center justify-center flex-1 bg-white">
          <div className="text-center p-8">
            <img src={loginimg} alt="Forgot Password" className="max-w-lg w-full rounded-lg" />
          </div>
        </div>

        {/* Form Pane */}
        <div className="w-full bg-gray-50 lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md w-full p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
            </div>
            
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" 
                />
              </div>

              {/* Submit Button */}
              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
             <p className="text-center text-sm text-gray-500">
              Remembered your password? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Back to Login</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;