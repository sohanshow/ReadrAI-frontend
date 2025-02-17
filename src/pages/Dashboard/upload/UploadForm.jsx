import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Play,
  Pause,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Thermometer,
  Timer,
} from "lucide-react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { backendURL } from "../../../utils/backendURL";
import { getToken, getUser } from "../../../utils/auth";
import ProgressBar from "./components/progress_bar";

const UploadForm = ({ file, onClose, onSuccess }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState({
    phase: null,
    progress: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const socketRef = useRef(null);
  const token = getToken();

  const [temperature, setTemperature] = useState(1);
  const [speed, setSpeed] = useState(1);

  const user = getUser();

  const setupSocket = (fileId) => {
    try {
      socketRef.current = io(backendURL, {
        transports: ["websocket"],
        upgrade: false,
      });

      const progressChannel = `pdf-progress-${user.email}-${fileId}`;

      socketRef.current.on("connect", () => {
        // console.log("Socket connected in UploadForm");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error in UploadForm:", error);
      });

      socketRef.current.on(progressChannel, (progress) => {
        // console.log("Progress update received:", progress);
        setProcessingProgress({
          phase: progress.phase,
          progress: (progress.current / progress.total) * 100,
        });

        if (progress.phase === "audio" && progress.current === progress.total) {
          setStatus("success");
          setTimeout(() => {
            onSuccess({ fileId });
          }, 1500);
        }
      });
    } catch (error) {
      console.error("Socket setup error:", error);
    }
  };

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch(`${backendURL}/files/voices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch voices");
        const data = await response.json();
        setVoices(data);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setErrorMessage("Failed to load voices. Please try again.");
        setStatus("error");
      }
    };

    fetchVoices();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  //--- starts to upload the file and generate audio for the file -----//
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVoice) return;

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentAudioId(null);
    }

    setStatus("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("voiceId", selectedVoice);
    formData.append("temperature", temperature.toString());
    formData.append("speed", speed.toString());

    try {
      const response = await fetch(`${backendURL}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setStatus("processing");
      setupSocket(data.fileId);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Failed to upload file");
      setStatus("error");
    }
  };

  //----- Plays the audio sample for each Voice ---//
  const toggleAudioSample = (sampleUrl, voiceId) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentAudioId(null);
      return;
    }

    const newAudio = new Audio(sampleUrl);
    newAudio.onended = () => {
      setCurrentAudioId(null);
      audioRef.current = null;
    };
    newAudio.play();
    audioRef.current = newAudio;
    setCurrentAudioId(voiceId);
  };

  const getProgress = () => {
    if (status === "uploading") {
      return <ProgressBar phase="upload" progress={uploadProgress} />;
    }

    if (status === "processing") {
      return (
        <ProgressBar
          phase={processingProgress.phase || "extraction"}
          progress={processingProgress.progress}
        />
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="text-zinc-400" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-white">Upload File</h3>
              <p className="text-sm text-zinc-400">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            disabled={status === "uploading" || status === "processing"}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400"
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Select Voice</label>
            <div className="space-y-2">
              {voices.map((voice) => (
                <div
                  key={voice.value}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-colors
                    ${
                      selectedVoice === voice.value
                        ? "bg-blue-500/10 border border-blue-500/50"
                        : "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                    }
                  `}
                >
                  <label className="flex items-center flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="voice"
                      value={voice.value}
                      checked={selectedVoice === voice.value}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="hidden"
                      disabled={status !== "idle"}
                    />
                    <div>
                      <div className="font-medium text-white">{voice.name}</div>
                      <div className="text-sm text-zinc-400">
                        {voice.gender} • {voice.style} • {voice.accent}
                      </div>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAudioSample(voice.sample, voice.value)}
                    disabled={status !== "idle"}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${
                        currentAudioId === voice.value
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {currentAudioId === voice.value ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New Temperature Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Thermometer size={16} />
                Temperature
              </label>
              <span className="text-sm text-zinc-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-2
                       appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 
                       [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none"
              disabled={status !== "idle"}
            />
          </div>

          {/* New Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400 flex items-center gap-2">
                <Timer size={16} />
                Speed
              </label>
              <span className="text-sm text-zinc-400">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-2
                       appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 
                       [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none"
              disabled={status !== "idle"}
            />
          </div>

          {getProgress()}

          <button
            type="submit"
            disabled={!selectedVoice || status !== "idle"}
            className={`
              w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2
              ${
                !selectedVoice || status !== "idle"
                  ? "bg-blue-500/50 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }
              transition-colors duration-200
            `}
          >
            {status === "idle" && (
              <>
                <Upload size={18} />
                Upload File
              </>
            )}
            {status === "uploading" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Uploading...
              </>
            )}
            {status === "processing" && "Processing..."}
            {status === "success" && (
              <>
                <Check size={18} />
                Success!
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle size={18} />
                Failed
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

UploadForm.propTypes = {
  file: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UploadForm;
