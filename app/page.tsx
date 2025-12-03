"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Folder, File, ArrowLeft, Search, Upload, Plus, Trash2, LogIn, PlayCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [path, setPath] = useState("/");
  const [data, setData] = useState({ contents: {} });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // --- Auth & Initial Load ---
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/checkPassword`, { pass: password });
      if (res.data.status === "ok") {
        setIsAuthenticated(true);
        fetchDirectory("/");
      } else {
        alert("Wrong Password");
      }
    } catch (e) {
      alert("Backend error. Check console.");
    }
  };

  // --- Data Fetching ---
  const fetchDirectory = async (dirPath: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/getDirectory`, {
        path: dirPath,
        password: password,
      });
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // --- Navigation ---
  const handleFolderClick = (folderName: string, id: string) => {
    const newPath = path === "/" ? `/${folderName}/${id}` : `${path}/${folderName}/${id}`;
    fetchDirectory(newPath);
  };

  const handleBack = () => {
    if (path === "/") return;
    const parts = path.split("/");
    // Logic to go back up one level in the custom ID structure
    // Simplifying: Just going to root if deep for this demo, 
    // real implementation requires parsing your ID structure logic specifically
    if(parts.length <= 3) fetchDirectory("/"); 
    else {
        parts.splice(-2); // Remove ID and Name
        fetchDirectory(parts.join("/") || "/");
    }
  };

  // --- File Actions ---
  const handleFileClick = (file: any) => {
    const fileUrl = `${API_URL}/file?path=${file.path}${file.id}`;
    
    // Check if video
    const isVideo = file.name.match(/\.(mp4|mkv|webm|mov)$/i);
    if (isVideo) {
      setPlayingVideo(fileUrl);
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  // --- Upload Logic ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    const formData = new FormData();
    const uniqueId = Math.random().toString(36).substring(7);
    formData.append("file", file);
    formData.append("path", path);
    formData.append("password", password);
    formData.append("id", uniqueId);
    formData.append("total_size", file.size.toString());

    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });
      alert("Upload Complete");
      fetchDirectory(path);
    } catch (error) {
      alert("Upload Failed");
    }
    setUploading(false);
    setUploadProgress(0);
  };

  // --- RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6 text-center">
            TG Drive
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin Access Key"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = Object.values(data.contents || {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-white text-xl">TG</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Drive</h1>
        </div>

        <div className="flex items-center gap-4">
            {path !== "/" && (
                <button onClick={handleBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div className="relative group">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg transition-all border border-slate-700 hover:border-cyan-500/50"
                >
                    <Upload size={18} />
                    <span>Upload</span>
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full text-red-400 transition-colors">
                 <Trash2 size={20} />
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-10">
        
        {/* Breadcrumb / Path Display */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <span className="text-cyan-500">root</span>
            {path !== "/" && <span className="truncate max-w-md"> / {path.split('/').slice(1).join(' / ')}</span>}
        </div>

        {uploading && (
             <div className="mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between mb-2 text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
             </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {items.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => item.type === "folder" ? handleFolderClick(item.name, item.id) : handleFileClick(item)}
                className="group relative bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col items-center justify-between aspect-square"
              >
                <div className="flex-1 flex items-center justify-center w-full">
                    {item.type === "folder" ? (
                        <Folder size={64} className="text-yellow-500/80 drop-shadow-lg group-hover:text-yellow-400 transition-colors" fill="currentColor" fillOpacity={0.2} />
                    ) : (
                        <div className="relative">
                            <File size={56} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                            {item.name.match(/\.(mp4|mkv|mov)$/i) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={24} className="text-white fill-black/50" />
                                </div>
