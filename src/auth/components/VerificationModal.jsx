import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import CountdownTimer from "./CountdonwTimer";

const VerificationModal = ({ email, onClose, onVerify }) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Focus on input field when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await onVerify(code);
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleExpire = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Prevent clicks from propagating through the modal
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl p-8 w-full max-w-md border border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 select-none">
          <h2 className="text-xl font-semibold text-white">
            Verify your email
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-zinc-400 mb-2 select-none">
          We&apos;ve sent a verification code to{" "}
          <span className="text-white font-medium">{email}</span>
        </p>
        <div className="mb-6 select-none">
          <CountdownTimer duration={300} onExpire={handleExpire} />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              className="w-48 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                       text-white placeholder-zinc-500 backdrop-blur-sm text-center text-xl tracking-widest
                       font-mono"
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center select-none"
            >
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium
                     rounded-lg relative overflow-hidden group hover:from-blue-500 hover:to-blue-600
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            <span
              className={`inline-flex items-center transition-all duration-200
                          ${isSubmitting ? "opacity-0" : "opacity-100"}`}
            >
              Verify Code
            </span>
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

VerificationModal.propTypes = {
  email: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
};

export default VerificationModal;
