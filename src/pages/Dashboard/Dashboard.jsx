import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, FileText, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./upload/UploadForm";
import ProgressBar from "./upload/components/progress_bar";
import { backendURL } from "../../utils/backendURL";
import { getToken, getUser } from "../../utils/auth";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import PopupCaution from "./caution/PopupCaution.jsx";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingFiles, setProcessingFiles] = useState({});
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const token = getToken();

  const user = getUser();

  // Seting up WebSocket connection for real-time file processing updates
  const setupWebSocket = () => {
    try {
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // Initialize new socket connection
      socketRef.current = io(backendURL, {
        transports: ["websocket"],
        upgrade: false,
      });
      // Socket connection event handlers
      socketRef.current.on("connect", () => {
        // console.log("Dashboard socket connected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Dashboard socket connection error:", error);
      });
      // Setting up listeners for each file that's still processing
      files.forEach((file) => {
        if (!file.processingComplete) {
          const progressChannel = `pdf-progress-${user.email}-${file._id}`;

          socketRef.current.on(progressChannel, (progress) => {
            // console.log(`Progress update for file ${file._id}:`, progress);
            setProcessingFiles((prev) => ({
              ...prev,
              [file._id]: {
                phase: progress.phase,
                progress: (progress.current / progress.total) * 100,
              },
            }));

            // Refresh file list when processing completes
            if (
              progress.phase === "audio" &&
              progress.current === progress.total
            ) {
              fetchFiles();
            }
          });
        }
      });
    } catch (error) {
      console.error("Dashboard socket setup error:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setupWebSocket();
  }, [files]);

  // Fetch list of user's files from the server
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${backendURL}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setFiles(data);

      // Calculate processing status for files still being processed
      const processing = {};
      data.forEach((file) => {
        if (!file.processingComplete) {
          processing[file._id] = {
            phase: "extraction",
            progress: (file.processedPages / file.totalPages) * 100,
          };
        }
      });
      setProcessingFiles(processing);
    } catch (error) {
      console.error("Error fetching files:", error);
      setPopupMessage("Failed to load files");
      setShowPopup(true);
    }
  };

  // Validate uploaded file type and size
  const validateFile = (file) => {
    if (!file.type.includes("pdf")) {
      setPopupMessage("Only PDF files are allowed");
      setShowPopup(true);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPopupMessage("File size must be less than 10MB");
      setShowPopup(true);
      return false;
    }

    return true;
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    // Ensure only one file is uploaded at a time
    if (droppedFiles.length > 1) {
      setPopupMessage("Please upload only one file at a time");
      setShowPopup(true);
      return;
    }

    const file = droppedFiles[0];
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  // Handle file input change event
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUploadSuccess = (fileData) => {
    setSelectedFile(null);
    fetchFiles();
    navigate(`/reading-arena/${fileData.fileId}`);
  };

  const { logout } = useAuth();

  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    try {
      await fetch(`${backendURL}/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      setPopupMessage("Failed to delete file");
      setShowPopup(true);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-white to-zinc-400 text-transparent bg-clip-text">
            Please Upload a File to Begin
          </h1>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-12
            transition-all duration-200 ease-in-out
            flex flex-col items-center justify-center gap-4
            ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50"
            }
          `}
        >
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <PlusCircle size={48} className="text-zinc-400" />
            <p className="text-zinc-400 text-lg mt-4">
              Drag and drop or click to upload
            </p>
            <p className="text-zinc-500 text-sm mt-2">PDF only, max 10MB</p>
          </label>
        </div>
      </motion.div>
    </div>
  );

  const FileGrid = () => (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50 hover:bg-zinc-800/50 cursor-pointer transition-colors group"
        >
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="flex items-center justify-center h-40">
              <PlusCircle
                size={48}
                className="text-zinc-400 group-hover:text-zinc-300 transition-colors"
              />
            </div>
            <p className="text-center text-zinc-400 mt-4">Upload New File</p>
          </label>
        </motion.div>

        {files.map((file) => (
          <motion.div
            key={file._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors relative group"
          >
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/reading-arena/${file._id}`)}
            >
              <div className="flex items-center justify-center h-40">
                <FileText size={48} className="text-zinc-400" />
              </div>
              <p className="text-center text-zinc-400 mt-4">{file.fileName}</p>
              {processingFiles[file._id] && (
                <div className="mt-4">
                  <ProgressBar
                    phase={processingFiles[file._id].phase}
                    progress={processingFiles[file._id].progress}
                  />
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(file._id);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800/50 text-zinc-500 
                         hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 
                         group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
      />

      {/* Gradient Circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/20 blur-[100px]" />
      <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10">
        <div className="p-8 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold"
          >
            <span className="bg-gradient-to-r from-blue-100 to-white text-transparent bg-clip-text">
              ReaderAI
            </span>
          </motion.div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 
            bg-zinc-900/50 hover:bg-red-500/10 
            border border-zinc-800 rounded-lg 
            text-zinc-400 hover:text-red-400 
            transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {files.length === 0 ? <EmptyState /> : <FileGrid />}
      </div>

      <AnimatePresence>
        {showPopup && (
          <PopupCaution
            message={popupMessage}
            onClose={() => setShowPopup(false)}
          />
        )}
        {selectedFile && (
          <UploadForm
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
