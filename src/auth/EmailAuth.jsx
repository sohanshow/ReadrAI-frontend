import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import VerificationModal from "./components/VerificationModal";
import { backendURL } from "../utils/backendURL";
import { useAuth } from "../context/AuthContext";

const EmailAuth = () => {
  // State management for form handling
  const [email, setEmail] = useState(""); // Store email input
  const [showVerification, setShowVerification] = useState(false); // Control verification modal visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state
  const [submitStatus, setSubmitStatus] = useState(null); // Track submission status
  const [errorMessage, setErrorMessage] = useState(""); // Store error messages
  const navigate = useNavigate(); // Hook for navigation

  const { login, isAuthenticated } = useAuth();

  // Watch for authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true); // Start loading state
    setSubmitStatus(null); // Reset submission status
    setErrorMessage(""); // Clear any previous errors

    try {
      // Send request to backend to initiate OTP process
      const response = await fetch(`${backendURL}/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Handle unsuccessful response
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send OTP");
      }
      // If successful, show verification modal
      setSubmitStatus("success");
      setShowVerification(true);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false); // End loading state
    }
  };

  // Handle OTP verification
  const handleVerification = async (code) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(`${backendURL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: code,
        }),
      });

      // Handle unsuccessful verification
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      // On successful verification
      const data = await response.json();
      // Wait for login to complete
      await login(data.access_token, data.user);
    } catch (error) {
      throw error; // Propagate error to be handled by caller
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Gradient Circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/20 blur-[100px]" />
      <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold mb-16"
        >
          <span className="bg-gradient-to-r from-blue-100 to-white text-transparent bg-clip-text">
            ReadrAI
          </span>
        </motion.div>

        <div className="max-w-md mx-auto w-full mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-zinc-400 text-transparent bg-clip-text">
                Welcome to ReadrAI
              </span>
            </h1>

            <p className="text-zinc-400 text-lg">
              Simply Listen and Read your PDF files. Powered by PlayHT and coded
              by Sohan Show
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           text-white placeholder-zinc-500 backdrop-blur-sm"
                  required
                />
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
                  >
                    ✓
                  </motion.div>
                )}
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium
                         rounded-lg relative overflow-hidden transition-colors duration-200"
              >
                <span
                  className={`inline-flex items-center transition-all duration-200
                              ${isSubmitting ? "opacity-0" : "opacity-100"}`}
                >
                  Continue with Email
                </span>
                {isSubmitting && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showVerification && (
          <VerificationModal
            email={email}
            onClose={() => setShowVerification(false)}
            onVerify={handleVerification}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailAuth;
