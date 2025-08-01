import {React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // To redirect after login

import api from '../../api'
import { Toaster, toast } from 'sonner'; // For toast notifications
import { Mail, KeyRound, Eye, EyeOff } from 'lucide-react'; // For modern icons

import loginimg from '../../assets/login.jpg'; // Ensure this path is correct

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    
    const loginPromise = api.post("/auth/login", { username: email, password:password });

    toast.promise(loginPromise, {
      loading: 'Logging in...',
      success: (response) => {
        // Handle custom success case (201 for invalid password)
        if (response.status === 201) {
          // Manually throw to enter the catch block for custom error toasts
          throw new Error(response.data || "Invalid Password");
        }
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        const userData = response.data.userDetails;
        const role = response.data.userDetails.role;
        localStorage.setItem("userData", JSON.stringify(userData));
        
        if(role === "Admin") setTimeout(() => navigate('/admindashboard'), 1000); 
        else if(role === "Manager") setTimeout(() => navigate('/managerdashboard'), 1000); 
        else if(role === "HR") setTimeout(() => navigate('/hrdashboard'), 1000); 
        else if(role === "Employee") setTimeout(() => navigate('/employeedashboard'), 1000); 
        else throw new Error(`No role found for, ${userData.firstName || 'user'}!`)
        return `Welcome back, ${userData.firstName || 'user'}!`;
      },
      error: (error) => {
        setIsLoading(false); // Re-enable button on error
        // Handle axios errors
        if (error.response) {
            if (error.response.status === 404) {
                return "No account found with this email.";
            }
            return error.response.data.message || "An unexpected error occurred.";
        }
        // Handle custom thrown errors (like our 201 status)
        return error.message || "An error occurred.";
      },
    });
  };

  return (
    <>
      {/* Sonner Toaster for notifications */}
      <Toaster position="top-right" richColors />

      <div className="flex h-screen font-sans">
        {/* Left Pane - Image */}
        <div className="hidden h-full lg:flex items-center justify-center flex-1 bg-white">
          <div className="text-center p-8">
            <img src={loginimg} alt="Login Background" className="max-w-lg w-full rounded-lg" />
          </div>
        </div>

        {/* Right Pane - Login Form */}
        <div className="w-full bg-gray-50 lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md w-full p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-gray-500">Please enter your credentials to log in.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" 
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="pl-10 pr-10 py-2 w-full border rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to ="../forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing In...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;