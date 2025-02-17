import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../../utils/auth";
import { backendURL } from "../../utils/backendURL";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { open as openEmbed } from "@play-ai/agent-web-sdk";
import { viteEmbedCode } from "../../utils/viteCode";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReadingArena = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const token = getToken();

  useEffect(() => {
    let cleanup;
    const currentPageText = fileData?.pages[currentPage - 1]?.text || "";

    if (currentPageText) {
      try {
        // Remove any existing elements with playai class
        const existingEmbed = document.querySelector(".playai-web-embed");
        if (existingEmbed) {
          existingEmbed.remove();
        }

        // Initialize new instance
        cleanup = openEmbed(viteEmbedCode, {
          customGreeting:
            "Go ahead and ask me anything from this page of the PDF document.",
          prompt: currentPageText,
        });
      } catch (error) {
        console.error("PlayAI initialization error:", error);
      }
    }

    // Cleanup function
    return () => {
      if (cleanup) {
        const existingEmbed = document.querySelector(".playai-web-embed");
        if (existingEmbed) {
          existingEmbed.remove();
        }
      }
    };
  }, [fileData, currentPage]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadPdfData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fileResponse, urlResponse] = await Promise.all([
          fetch(`${backendURL}/files/${fileId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendURL}/files/${fileId}/view-url`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!fileResponse.ok || !urlResponse.ok) {
          throw new Error("Failed to load PDF data");
        }

        const [fileData, urlData] = await Promise.all([
          fileResponse.json(),
          urlResponse.json(),
        ]);

        setFileData(fileData);
        setPdfUrl({
          url: urlData.url,
          httpHeaders: { "Content-Type": "application/pdf" },
          withCredentials: false,
        });
      } catch (error) {
        console.error("Error loading PDF:", error);
        setError("Failed to load PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      loadPdfData();
    }
  }, [fileId, token]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentPage]);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };

  // Navigation with keyboard arrows
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight") {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, numPages]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !dragging) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeekStart = () => setDragging(true);
  const handleSeekEnd = () => setDragging(false);

  const handleSeek = (e) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setProgress(percentage);

      if (!dragging) {
        audioRef.current.currentTime =
          (percentage / 100) * audioRef.current.duration;
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (currentPage < numPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const currentAudioUrl = fileData?.pages[currentPage - 1]?.audioUrl;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handlePreviousPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPdfWidth = () => {
    // Adjusted width calculations for better containment
    if (windowWidth < 640) return windowWidth - 48; // More padding on mobile
    if (windowWidth < 1024) return 720; // Tablet size
    return 800; // Desktop size - more contained
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/20 blur-[100px]" />
      <div className="fixed top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[100px]" />

      {/* Floating Controls */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 transition-colors
                   backdrop-blur-sm border border-zinc-800 group relative
                   before:content-['To_Dashboard'] before:absolute before:top-full before:left-1/2
                   before:-translate-x-1/2 before:mt-2 before:px-2 before:py-1 before:rounded
                   before:bg-zinc-800 before:text-zinc-200 before:text-sm before:opacity-0
                   before:transition-opacity hover:before:opacity-100 before:whitespace-nowrap"
        >
          <ArrowLeft
            size={20}
            className="text-zinc-400 group-hover:text-white transition-colors"
          />
        </button>
      </div>

      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <span className="text-zinc-400 text-sm px-3 py-1.5 rounded-lg bg-zinc-900/90 backdrop-blur-sm border border-zinc-800">
          {currentPage} / {numPages || "..."}
        </span>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-900/90 backdrop-blur-sm border border-zinc-800">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
            className="p-1.5 rounded-md hover:bg-zinc-800/90 transition-colors group"
          >
            <ZoomOut
              size={18}
              className="text-zinc-400 group-hover:text-white transition-colors"
            />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.2, 2))}
            className="p-1.5 rounded-md hover:bg-zinc-800/90 transition-colors group"
          >
            <ZoomIn
              size={18}
              className="text-zinc-400 group-hover:text-white transition-colors"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-32 min-h-screen flex justify-center items-start">
        <div className="relative max-w-6xl w-full px-4 md:px-8">
          <div className="relative flex justify-center">
            {/* Left Navigation Button */}
            <div className="hidden md:block absolute -left-16 top-1/2 -translate-y-1/2 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage <= 1}
                className="w-10 h-10 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                         flex items-center justify-center backdrop-blur-sm
                         border border-zinc-800 group relative
                         before:content-['Previous_Page'] before:absolute before:left-full
                         before:ml-2 before:px-2 before:py-1 before:rounded
                         before:bg-zinc-800 before:text-zinc-200 before:text-sm
                         before:opacity-0 before:transition-opacity hover:before:opacity-100
                         before:whitespace-nowrap"
              >
                <ChevronLeft
                  size={20}
                  className="text-zinc-400 group-hover:text-white transition-colors"
                />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
              <div
                className="max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 
                            [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-track]:bg-zinc-800/30"
              >
                {pdfUrl && (
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    loading={
                      <div className="w-full h-[80vh] flex items-center justify-center text-zinc-400">
                        Loading PDF...
                      </div>
                    }
                    error={
                      <div className="w-full h-[80vh] flex items-center justify-center text-red-400">
                        Error loading PDF. Please try again.
                      </div>
                    }
                  >
                    <Page
                      pageNumber={currentPage}
                      width={getPdfWidth()}
                      scale={scale}
                      loading={
                        <div className="w-full h-[80vh] flex items-center justify-center text-zinc-400">
                          Loading page...
                        </div>
                      }
                    />
                  </Document>
                )}
              </div>
            </div>

            {/* Right Navigation Button */}
            <div className="hidden md:block absolute -right-16 top-1/2 -translate-y-1/2 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentPage < numPages) setCurrentPage(currentPage + 1);
                }}
                disabled={currentPage >= numPages}
                className="w-10 h-10 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                         flex items-center justify-center backdrop-blur-sm
                         border border-zinc-800 group relative
                         before:content-['Next_Page'] before:absolute before:right-full
                         before:mr-2 before:px-2 before:py-1 before:rounded
                         before:bg-zinc-800 before:text-zinc-200 before:text-sm
                         before:opacity-0 before:transition-opacity hover:before:opacity-100
                         before:whitespace-nowrap"
              >
                <ChevronRight
                  size={20}
                  className="text-zinc-400 group-hover:text-white transition-colors"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-24 left-0 right-0 z-20 flex justify-center gap-4 px-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          className="p-3 rounded-lg bg-zinc-900/90 text-zinc-400 hover:text-white 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors 
                   backdrop-blur-sm border border-zinc-800"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= numPages}
          className="p-3 rounded-lg bg-zinc-900/90 text-zinc-400 hover:text-white 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors 
                   backdrop-blur-sm border border-zinc-800"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Audio Player */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:bottom-8 md:-translate-x-1/2 z-50 
                   bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-3 shadow-xl"
      >
        <div className="flex items-center gap-4 w-full md:w-[400px]">
          <button
            onClick={togglePlayPause}
            disabled={!currentAudioUrl}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              currentAudioUrl
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-zinc-700 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>

          <div className="text-sm text-zinc-400 flex-shrink-0">
            {currentPage}/{numPages || "..."}
          </div>

          <div
            ref={progressRef}
            className="relative h-4 flex-1 cursor-pointer"
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onMouseLeave={handleSeekEnd}
            onMouseMove={dragging ? handleSeek : undefined}
            onClick={handleSeek}
          >
            <div className="absolute inset-0 bg-zinc-800/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500/20"
                style={{ width: `${progress}%` }}
              />
            </div>

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing"
              style={{ left: `calc(${progress}% - 6px)` }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          </div>
        </div>

        {currentAudioUrl && (
          <audio
            ref={audioRef}
            src={currentAudioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnd}
            onLoadStart={() => setProgress(0)}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ReadingArena;
