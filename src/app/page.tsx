"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Upload } from "lucide-react"; // <--- ADDED THIS MISSING IMPORT
import LoginScreen from "@/components/auth/LoginScreen";
import Navbar from "@/components/dashboard/Navbar";
import FileGrid from "@/components/dashboard/FileGrid";
import VideoPlayer from "@/components/modals/VideoPlayer";
import FileActionModal from "@/components/modals/FileActionModal";
import { getDirectory, getFileDownloadUrl } from "@/lib/api";
import { FileItem, DirectoryData } from "@/lib/types";
import { isVideoFile } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [path, setPath] = useState("/");
  const [data, setData] = useState<DirectoryData>({ contents: {} });
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Only load from local storage or check session if needed, for now manual login
  }, []);

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

  const handleSearch = (query: string) => {
    if (!query) {
        fetchDirectory("/");
        return;
    }
    // The backend search path convention from your main.py
    const searchPath = `/search_${encodeURIComponent(query)}`;
    fetchDirectory(searchPath);
  };

  const handleLoginSuccess = (pass: string) => {
    setPassword(pass);
    setIsAuthenticated(true);
    // Initial fetch
    getDirectory("/", pass).then(res => {
        if(res.data.status === "ok") {
            setData(res.data.data);
            setPath("/");
        }
    });
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
        const newPath = path === "/" || path.includes("/search_") 
            ? `/${item.name}/${item.id}` 
            : `${path}/${item.name}/${item.id}`;
        fetchDirectory(newPath);
    } else {
        // Open the Action Modal for files
        setSelectedFile(item);
    }
  };

  const handleBack = () => {
    if (path === "/" || path.includes("/search_")) {
        fetchDirectory("/");
        return;
    }
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 2) {
        fetchDirectory("/");
    } else {
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
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        },
      });
      fetchDirectory(path);
    } catch (error) {
      alert("Upload Failed");
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-10">
      
      <Navbar 
        currentPath={path} 
        onBack={handleBack} 
        onUpload={handleUpload} 
        onSearch={handleSearch}
      />

      <main className="pt-28 px-4 md:px-8 max-w-[1800px] mx-auto">
        
        {isUploading && (
           <div className="mb-8 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                <Upload size={20} className="animate-bounce" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span>Uploading File...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" 
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
              </div>
           </div>
        )}

        <FileGrid data={data} onItemClick={handleItemClick} loading={loading} />
      </main>

      <AnimatePresence>
        {selectedFile && (
            <FileActionModal 
                file={selectedFile}
                downloadUrl={getFileDownloadUrl(selectedFile.path, selectedFile.id)}
                onClose={() => setSelectedFile(null)}
                onStream={isVideoFile(selectedFile.name) ? () => {
                    setVideoUrl(getFileDownloadUrl(selectedFile.path, selectedFile.id));
                    setSelectedFile(null);
                } : undefined}
            />
        )}
      </AnimatePresence>

      {videoUrl && <VideoPlayer src={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
