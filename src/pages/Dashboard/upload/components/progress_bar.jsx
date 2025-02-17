import { motion } from "framer-motion";
import PropTypes from "prop-types";

const ProgressBar = ({ phase, progress, showPercentage = true }) => {
  const getPhaseText = () => {
    switch (phase) {
      case "upload":
        return "Uploading file...";
      case "extraction":
        return "Extracting text. Please wait...";
      case "audio":
        return "Generating audio. Please wait...";
      default:
        return "Processing. Please wait...";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400">{getPhaseText()}</span>
          {phase === "audio" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          )}
        </div>
        {showPercentage && (
          <span className="text-zinc-400">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  phase: PropTypes.oneOf(["upload", "extraction", "audio"]).isRequired,
  progress: PropTypes.number.isRequired,
  showPercentage: PropTypes.bool,
};

export default ProgressBar;
