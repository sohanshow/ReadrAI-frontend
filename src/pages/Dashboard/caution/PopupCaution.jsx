// eslint-disable-next-line no-unused-vars
import React from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";

const PopupCaution = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-zinc-900 border border-red-500/50 rounded-lg p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-semibold">Caution</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-zinc-200">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 
                   border border-red-500/50 rounded-lg py-2 px-4 transition-colors"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
};

PopupCaution.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PopupCaution;
