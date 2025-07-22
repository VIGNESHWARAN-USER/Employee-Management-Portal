import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import loginimg from '../../assets/login.jpg'; // Adjust path if needed

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and the correct OTP from the previous page's state
  const email = location.state?.email;
  const correctOtp = location.state?.otp; // The OTP to check against
console.log(correctOtp)
  const inputRefs = useRef([]);

  // Redirect if essential data (email or the correct OTP) is missing
  useEffect(() => {
    if (!email || !correctOtp) {
      toast.error("An error occurred. Please start over.");
      navigate('/forgot-password');
    }
  }, [email, correctOtp, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!isNaN(pastedData) && pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[3].focus();
    }
  };

  // --- THIS FUNCTION IS NOW SYNCHRONOUS (NO API CALL) ---
  const handleVerifyOTP = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP.");
      setIsLoading(false);
      return;
    }

    // Simulate a brief delay for a better user experience
    setTimeout(() => {
      // The core verification logic
      if (enteredOtp === String(correctOtp)) {
        toast.success('OTP verified successfully!');
        // Navigate to the reset password page, passing the email along
        navigate('/reset-password', { state: { email } });
      } else {
        toast.error('Invalid OTP. Please try again.');
        setIsLoading(false);
        setOtp(['', '', '', '']); // Clear inputs on error
        inputRefs.current[0].focus(); // Reset focus to the first input
      }
    }, 500); // 0.5-second delay
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex h-screen font-sans">
        {/* Image Pane */}
        <div className="hidden h-full lg:flex items-center justify-center flex-1 bg-white">
          <img src={loginimg} alt="OTP Verification" className="max-w-lg w-full rounded-lg" />
        </div>
        
        {/* Form Pane */}
        <div className="w-full bg-gray-50 lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md w-full p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Check Your Email</h1>
              <p className="text-gray-500">
                We've sent a 4-digit code to <br />
                <strong className="text-black">{email || 'your email'}</strong>
              </p>
            </div>
            
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                ))}
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
             <p className="text-center text-sm text-gray-500">
              Didn't receive the code? <button type="button" className="font-medium text-blue-600 hover:text-blue-500">Resend OTP</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;