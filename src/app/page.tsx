"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload, Link as LinkIcon, CheckCircle2, Loader2 } from "lucide-react";
import LoginScreen from "@/components/auth/LoginScreen";
import Navbar from "@/components/dashboard/Navbar";
import FileGrid from "@/components/dashboard/FileGrid";
import VideoPlayer from "@/components/modals/VideoPlayer";
import FileActionModal from "@/components/modals/FileActionModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import RenameModal from "@/components/modals/RenameModal";
import FileMenuModal from "@/components/modals/FileMenuModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import RemoteUploadModal from "@/components/modals/RemoteUploadModal";
import { 
  getDirectory, getFileDownloadUrl, createNewFolder, renameFileFolder, 
  deleteFileFolder, startRemoteUpload, getFileDownloadProgress, getTelegramUploadProgress 
} from "@/lib/api";
import { FileItem, DirectoryData } from "@/lib/types";
import { isVideoFile } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Navigation & Data
  const [path, setPath] = useState("/");
  const [data, setData] = useState<DirectoryData>({ contents: {} });
  const [loading, setLoading] = useState(false);
  
  // Use a ref for path to ensure the polling function always uses the latest path
  const pathRef = useRef(path);
  useEffect(() => { pathRef.current = path; }, [path]);

  // UI States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Local Upload State
  const [localUploadProgress, setLocalUploadProgress] = useState(0);
  const [isLocalUploading, setIsLocalUploading] = useState(false);

  // Remote Upload State
  const [isRemoteUploading, setIsRemoteUploading] = useState(false);
  const [remoteProgress, setRemoteProgress] = useState(0);
  const [remoteStatus, setRemoteStatus] = useState(""); 

  // Modal Visibility
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRemoteUpload, setShowRemoteUpload] = useState(false);
  
  // File Menu / Operation States
  const [menuItem, setMenuItem] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);

  // --- 1. REFRESH PROTECTION ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRemoteUploading || isLocalUploading) {
        e.preventDefault();
        e.returnValue = "Upload in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRemoteUploading, isLocalUploading]);

  // --- 2. PERSISTENT LOGIN ---
  useEffect(() => {
    const savedPass = localStorage.getItem("tgdrive_pass");
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
      fetchDirectory("/", savedPass);
    }
  }, []);

  const handleLoginSuccess = (pass: string) => {
    localStorage.setItem("tgdrive_pass", pass);
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

  // --- 3. DATA FETCHING ---
  const fetchDirectory = async (dirPath: string, pass: string = password) => {
    setLoading(true);
    try {
      const res = await getDirectory(dirPath, pass);
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      }
    } catch (error) { console.error("Fetch failed"); }
    setLoading(false);
  };

  // --- 4. ROBUST REMOTE UPLOAD POLLING ---
  const pollRemoteStatus = async (id: string) => {
    setIsRemoteUploading(true);
    setRemoteProgress(0);
    setRemoteStatus("Initializing...");

    let stage = "download"; // Stages: 'download' -> 'transition' -> 'upload'
    let retryCount = 0;
    const MAX_RETRIES = 30; // 30 seconds grace period

    const poll = setInterval(async () => {
        try {
            // STAGE 1: DOWNLOAD FROM URL
            if (stage === "download") {
                const dlRes = await getFileDownloadProgress(id, password);
                
                if (dlRes.data.status === "ok" && dlRes.data.data) {
                    const [status, current, total] = dlRes.data.data;
                    
                    if (status === "running") {
                        setRemoteStatus("Downloading from URL...");
                        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                        setRemoteProgress(pct);
                    } else if (status === "completed") {
                        setRemoteStatus("Processing...");
                        setRemoteProgress(100);
                        stage = "transition";
                    } else if (status === "error") {
                        clearInterval(poll);
                        setIsRemoteUploading(false);
                        alert("Remote Download Failed");
                    }
                }
            }

            // STAGE 2: TRANSITION & UPLOAD TO TELEGRAM
            if (stage === "transition" || stage === "upload") {
                const upRes = await getTelegramUploadProgress(id, password);
                
                if (upRes.data.status === "ok" && upRes.data.data) {
                    // We found the upload process!
                    stage = "upload";
                    retryCount = 0; // Reset retries since we found it
                    
                    const [status, current, total] = upRes.data.data;

                    if (status === "running") {
                        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                        setRemoteProgress(pct);
                        
                        if (pct >= 100) {
                            setRemoteStatus("Finalizing...");
                        } else {
                            setRemoteStatus("Uploading to Cloud...");
                        }
                    } else if (status === "completed") {
                        // EXPLICIT SUCCESS
                        clearInterval(poll);
                        setIsRemoteUploading(false);
                        fetchDirectory(pathRef.current); // Force refresh
                        // alert("Upload Complete!"); // Optional: Uncomment if you want an alert
                    }
                } else {
                    // Upload status not found
                    if (stage === "upload") {
                        // We were uploading, but now it's gone.
                        // This usually means it finished and backend cleared the cache.
                        // Assume Success!
                        clearInterval(poll);
                        setIsRemoteUploading(false);
                        fetchDirectory(pathRef.current);
                        console.log("Upload cache cleared, assuming success.");
                    } 
                    else if (stage === "transition") {
                        setRemoteStatus("Preparing Upload...");
                        retryCount++;
                        if (retryCount > MAX_RETRIES) {
                           // Took too long to start, stop polling but don't error out
                           clearInterval(poll);
                           setIsRemoteUploading(false);
                           fetchDirectory(pathRef.current);
                           alert("Task backgrounded. File should appear shortly.");
                        }
                    }
                }
            }
        } catch (e) {
            console.log("Polling network error, retrying...");
        }
    }, 1000);
  };

  const handleRemoteUpload = async (url: string) => {
    setShowRemoteUpload(false);
    try {
        const res = await startRemoteUpload(url, path, password);
        if (res.data.status === "ok") {
            pollRemoteStatus(res.data.id);
        } else {
            alert("Error: " + res.data.status);
        }
    } catch (e) { alert("Failed to start remote upload"); }
  };

  // --- 5. FILE OPERATIONS (Create, Rename, Delete) ---
  const handleCreateFolder = async (name: string) => {
    setShowCreateFolder(false);
    try { await createNewFolder(path, name, password); fetchDirectory(path); } 
    catch (e) { alert("Failed to create folder"); }
  };

  const executeRename = async (newName: string) => {
    if (!renameItem) return;
    try {
        await renameFileFolder(renameItem.path + renameItem.id, newName, password);
        setRenameItem(null);
        fetchDirectory(path);
    } catch (e) { alert("Rename failed"); }
  };

  const executeDelete = async () => {
    if (!deleteItem) return;
    try {
        await deleteFileFolder(deleteItem.path + deleteItem.id, password);
        setDeleteItem(null);
        fetchDirectory(path);
    } catch (e) { alert("Delete failed"); }
  };

  // --- 6. NAVIGATION & SEARCH ---
  const handleMenuClick = (item: FileItem) => setMenuItem(item);

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

  const handleSearch = (query: string) => {
    if (!query) { fetchDirectory("/"); return; }
    fetchDirectory(`/search_${encodeURIComponent(query)}`);
  };

  const handleBack = () => {
    if (path === "/" || path.includes("/search_")) { fetchDirectory("/"); return; }
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 2) fetchDirectory("/");
    else { parts.splice(-2); fetchDirectory("/" + parts.join("/")); }
  };

  // --- 7. LOCAL UPLOAD ---
  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsLocalUploading(true);
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
        onUploadProgress: (p) => setLocalUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))),
      });
      fetchDirectory(path);
    } catch (error) { alert("Upload Failed"); }
    setIsLocalUploading(false);
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-10">
      <Navbar 
        currentPath={path} 
        onBack={handleBack} 
        onUpload={handleLocalUpload} 
        onSearch={handleSearch}
        onHome={() => fetchDirectory("/")}
        onCreateFolder={() => setShowCreateFolder(true)}
        onRemoteUpload={() => setShowRemoteUpload(true)}
        onLogout={handleLogout}
      />

      <main className="pt-36 md:pt-28 px-4 md:px-8 max-w-[1800px] mx-auto">
        
        {/* Local Upload Card */}
        {isLocalUploading && (
           <div className="mb-4 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><Upload size={20} className="animate-bounce" /></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span>Uploading from Device...</span><span>{localUploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" style={{ width: `${localUploadProgress}%` }} />
                </div>
              </div>
           </div>
        )}

        {/* Remote Upload Card */}
        {isRemoteUploading && (
           <div className="mb-8 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-emerald-500">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                {remoteStatus === "Initializing..." || remoteStatus === "Preparing Upload..." ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <LinkIcon size={20} className="animate-pulse" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span className="flex items-center gap-2">
                        {remoteStatus}
                        {remoteStatus === "Finalizing..." && <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" />}
                    </span>
                    <span>{remoteProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]" style={{ width: `${remoteProgress}%` }} />
                </div>
              </div>
           </div>
        )}

        <FileGrid data={data} onItemClick={handleItemClick} onMenu={handleMenuClick} loading={loading} />
      </main>

      <AnimatePresence>
        {/* Modals */}
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
        {menuItem && (
            <FileMenuModal 
                item={menuItem}
                onClose={() => setMenuItem(null)}
                onRename={() => { setRenameItem(menuItem); setMenuItem(null); }}
                onDelete={() => { setDeleteItem(menuItem); setMenuItem(null); }}
            />
        )}
        {renameItem && <RenameModal currentName={renameItem.name} onClose={() => setRenameItem(null)} onRename={executeRename} />}
        {deleteItem && <DeleteConfirmModal itemName={deleteItem.name} onConfirm={executeDelete} onCancel={() => setDeleteItem(null)} />}
        {showCreateFolder && <CreateFolderModal onClose={() => setShowCreateFolder(false)} onCreate={handleCreateFolder} />}
        {showRemoteUpload && <RemoteUploadModal onClose={() => setShowRemoteUpload(false)} onUpload={handleRemoteUpload} />}
      </AnimatePresence>

      {/* Video Player */}
      {videoUrl && <VideoPlayer src={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
