"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import LoginScreen from "@/components/auth/LoginScreen";
import Navbar from "@/components/dashboard/Navbar";
import FileGrid from "@/components/dashboard/FileGrid";
import VideoPlayer from "@/components/modals/VideoPlayer";
import FileActionModal from "@/components/modals/FileActionModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import RenameModal from "@/components/modals/RenameModal";
import { getDirectory, getFileDownloadUrl, createNewFolder, renameFileFolder, deleteFileFolder } from "@/lib/api";
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
  
  // UI States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Action Modal States
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- PERSISTENT LOGIN ---
  useEffect(() => {
    const savedPass = localStorage.getItem("tgdrive_pass");
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
      fetchDirectory("/", savedPass);
    }
  }, []);

  const handleLoginSuccess = (pass: string) => {
    localStorage.setItem("tgdrive_pass", pass); // Save to storage
    setPassword(pass);
    setIsAuthenticated(true);
    fetchDirectory("/", pass);
  };

  const handleLogout = () => {
    localStorage.removeItem("tgdrive_pass");
    setIsAuthenticated(false);
    setPassword("");
    setData({ contents: {} });
  };

  // --- API CALLS ---

  const fetchDirectory = async (dirPath: string, pass: string = password) => {
    setLoading(true);
    try {
      const res = await getDirectory(dirPath, pass);
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      }
    } catch (error) {
      console.error("Failed to fetch directory");
    }
    setLoading(false);
  };

  const handleCreateFolder = async (name: string) => {
    setShowCreateFolder(false);
    try {
        await createNewFolder(path, name, password);
        fetchDirectory(path);
    } catch (e) { alert("Failed to create folder"); }
  };

  const handleRename = async (newName: string) => {
    if (!itemToRename) return;
    const fullPath = itemToRename.path + itemToRename.id;
    try {
        await renameFileFolder(fullPath, newName, password);
        setItemToRename(null);
        fetchDirectory(path);
    } catch (e) { alert("Rename failed"); }
  };

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    const fullPath = item.path + item.id;
    try {
        await deleteFileFolder(fullPath, password);
        fetchDirectory(path);
        // If it was the selected file in modal, close it
        if(selectedFile?.id === item.id) setSelectedFile(null);
    } catch (e) { alert("Delete failed"); }
  };

  // --- NAVIGATION & ACTIONS ---

  const handleSearch = (query: string) => {
    if (!query) { fetchDirectory("/"); return; }
    fetchDirectory(`/search_${encodeURIComponent(query)}`);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
        const newPath = path === "/" || path.includes("/search_") 
            ? `/${item.name}/${item.id}` 
            : `${path}/${item.name}/${item.id}`;
        fetchDirectory(newPath);
    } else {
        setSelectedFile(item);
    }
  };

  const handleMenuClick = (item: FileItem, e: React.MouseEvent) => {
    // For now, let's use the browser's native confirm/prompt for simplicity 
    // or trigger the specific modals.
    // Ideally we would show a dropdown, but for simplicity we can trigger actions immediately 
    // or use the FileActionModal for files.
    
    // Better UX: Reuse Logic
    // If it's a file, open the ActionModal (which we will upgrade to have delete/rename)
    // If it's a folder, trigger Rename/Delete immediately via prompt?
    
    // Let's keep it simple: Menu Button -> Shows Actions (We can repurpose FileActionModal or just use prompt)
    // Actually, let's just make the "Three Dots" open the FileActionModal for files,
    // and for folders, we ask "What do you want to do?" (Rename/Delete)
    
    // Simplified Logic: 
    const action = prompt(`Actions for ${item.name}:\nType 'r' to Rename\nType 'd' to Delete`);
    if (action?.toLowerCase() === 'r') setItemToRename(item);
    if (action?.toLowerCase() === 'd') handleDelete(item);
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
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))),
      });
      fetchDirectory(path);
    } catch (error) { alert("Upload Failed"); }
    setIsUploading(false);
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-10">
      
      <Navbar 
        currentPath={path} 
        onBack={handleBack} 
        onUpload={handleUpload} 
        onSearch={handleSearch}
        onHome={() => fetchDirectory("/")}
        onCreateFolder={() => setShowCreateFolder(true)}
        onLogout={handleLogout}
      />

      <main className="pt-36 md:pt-28 px-4 md:px-8 max-w-[1800px] mx-auto">
        {isUploading && (
           <div className="mb-8 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><Upload size={20} className="animate-bounce" /></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span>Uploading File...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
           </div>
        )}

        <FileGrid data={data} onItemClick={handleItemClick} onMenu={handleMenuClick} loading={loading} />
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
        {showCreateFolder && (
            <CreateFolderModal 
                onClose={() => setShowCreateFolder(false)} 
                onCreate={handleCreateFolder} 
            />
        )}
        {itemToRename && (
            <RenameModal
                currentName={itemToRename.name}
                onClose={() => setItemToRename(null)}
                onRename={handleRename}
            />
        )}
      </AnimatePresence>

      {videoUrl && <VideoPlayer src={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
