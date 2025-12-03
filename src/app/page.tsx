"use client";
import { useState, useEffect } from "react";
import axios from "axios"; // Using direct axios for upload progress
import LoginScreen from "@/components/auth/LoginScreen";
import Navbar from "@/components/dashboard/Navbar";
import FileGrid from "@/components/dashboard/FileGrid";
import VideoPlayer from "@/components/modals/VideoPlayer";
import { getDirectory, getFileDownloadUrl } from "@/lib/api";
import { FileItem, DirectoryData } from "@/lib/types";
import { isVideoFile } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Drive State
  const [path, setPath] = useState("/");
  const [data, setData] = useState<DirectoryData>({ contents: {} });
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    if (isAuthenticated) fetchDirectory(path);
  }, [isAuthenticated]); // removed path from dependency to prevent loop, called manually

  const fetchDirectory = async (dirPath: string) => {
    setLoading(true);
    try {
      const res = await getDirectory(dirPath, password);
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      }
    } catch (error) {
      console.error("Failed to fetch directory");
    }
    setLoading(false);
  };

  const handleLoginSuccess = (pass: string) => {
    setPassword(pass);
    setIsAuthenticated(true);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
        // Construct new path: /ParentName/ParentID/FolderName/FolderID
        // Note: The logic here depends on your backend's specific ID requirement. 
        // Assuming simple concatenation for navigation:
        const newPath = path === "/" ? `/${item.name}/${item.id}` : `${path}/${item.name}/${item.id}`;
        fetchDirectory(newPath);
    } else {
        const url = getFileDownloadUrl(item.path, item.id);
        if (isVideoFile(item.name)) {
            setVideoUrl(url);
        } else {
            window.open(url, "_blank");
        }
    }
  };

  const handleBack = () => {
    if (path === "/") return;
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 2) {
        fetchDirectory("/");
    } else {
        // Remove the last folder name and ID
        parts.splice(-2);
        const newPath = "/" + parts.join("/");
        fetchDirectory(newPath);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    const formData = new FormData();
    const uniqueId = Math.random().toString(36).substring(7);
    formData.append("file", file);
    formData.append("path", path);
    formData.append("password", password);
    formData.append("id", uniqueId);
    formData.append("total_size", file.size.toString());

    try {
      // Using direct axios here to access upload progress event easily
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        },
      });
      fetchDirectory(path); // Refresh folder
    } catch (error) {
      alert("Upload Failed");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-200">
      
      <Navbar currentPath={path} onBack={handleBack} onUpload={handleUpload} />

      <main className="pt-24 px-6 pb-10 max-w-[1600px] mx-auto">
        
        {/* Upload Progress Bar */}
        {isUploading && (
           <div className="mb-8 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between mb-2 text-sm text-cyan-400 font-medium">
                  <span className="flex items-center gap-2">🚀 Uploading...</span>
                  <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                      className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                      style={{ width: `${uploadProgress}%` }}
                  />
              </div>
           </div>
        )}

        <FileGrid data={data} onItemClick={handleItemClick} loading={loading} />
      
      </main>

      {videoUrl && <VideoPlayer src={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
