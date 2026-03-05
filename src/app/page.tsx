"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload, Link as LinkIcon, CheckCircle2, Loader2, Folder, FileText, HardDrive } from "lucide-react";
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
import { isVideoFile, detectSubtitlesForVideo, SubtitleTrack } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [path, setPath] = useState("/");
  const [data, setData] = useState<DirectoryData>({ contents: {} });
  const [loading, setLoading] = useState(false);
  
  const pathRef = useRef(path);
  useEffect(() => { pathRef.current = path; }, [path]);

  // UI States
  const [videoState, setVideoState] = useState<{ src: string; title: string; subtitles: SubtitleTrack[] } | null>(null);
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
  
  const [menuItem, setMenuItem] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);

  // --- REFRESH PROTECTION ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRemoteUploading || isLocalUploading) {
        e.preventDefault();
        e.returnValue = "Upload in progress.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRemoteUploading, isLocalUploading]);

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

  const fetchDirectory = async (dirPath: string, pass: string = password) => {
    setLoading(true);
    try {
      const res = await getDirectory(dirPath, pass);
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      }
    } catch (error) { 
      console.error("Fetch failed", error); 
    }
    setLoading(false);
  };

  // --- REMOTE UPLOAD POLLING ---
  const pollRemoteStatus = async (id: string) => {
    setIsRemoteUploading(true);
    setRemoteProgress(0);
    setRemoteStatus("Initializing...");

    let stage = "download"; 
    let uploadCompleted = false;
    const currentPath = pathRef.current;

    const intervalId = setInterval(async () => {
        try {
            // STAGE 1: CHECK DOWNLOAD PROGRESS
            if (stage === "download") {
                const dlRes = await getFileDownloadProgress(id, password);
                
                if (dlRes.data.status === "ok" && dlRes.data.data) {
                    const [status, current, total] = dlRes.data.data;
                    
                    if (status === "running" || status === "Downloading") {
                        setRemoteStatus("Downloading from URL...");
                        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                        setRemoteProgress(pct);
                    } else if (status === "completed") {
                        setRemoteStatus("Starting Upload...");
                        setRemoteProgress(100);
                        stage = "upload";
                    } else if (status === "error") {
                        clearInterval(intervalId);
                        setIsRemoteUploading(false);
                        alert("Remote Download Failed");
                    }
                }
            }

            // STAGE 2: CHECK TELEGRAM UPLOAD PROGRESS
            if (stage === "upload" && !uploadCompleted) {
                try {
                    const upRes = await getTelegramUploadProgress(id, password);
                    
                    if (upRes.data.status === "ok" && upRes.data.data) {
                        const [status, current, total] = upRes.data.data;

                        if (status === "running") {
                            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                            setRemoteProgress(pct);
                            // --- FIX: Removed the ${pct}% from string here ---
                            setRemoteStatus("Uploading to Telegram..."); 
                        } else if (status === "completed") {
                            uploadCompleted = true;
                            clearInterval(intervalId);
                            setRemoteStatus("Complete! Refreshing...");
                            setRemoteProgress(100);
                            
                            // Aggressive Refresh
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            await fetchDirectory(currentPath);
                            setIsRemoteUploading(false);
                        }
                    } else if (upRes.data.status === "not found") {
                        setRemoteStatus("Preparing upload...");
                    }
                } catch (err) {
                    console.log("Waiting for upload process...");
                }
            }
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, 1500);
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
    } catch (e) { 
        alert("Failed to start remote upload"); 
    }
  };

  // --- STANDARD HANDLERS ---
  const handleCreateFolder = async (name: string) => {
    setShowCreateFolder(false);
    try { 
        await createNewFolder(path, name, password); 
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchDirectory(path); 
    } 
    catch (e) { alert("Failed to create folder"); }
  };

  const executeRename = async (newName: string) => {
    if (!renameItem) return;
    try {
        await renameFileFolder(renameItem.path + renameItem.id, newName, password);
        setRenameItem(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchDirectory(path);
    } catch (e) { alert("Rename failed"); }
  };

  const executeDelete = async () => {
    if (!deleteItem) return;
    try {
        await deleteFileFolder(deleteItem.path + deleteItem.id, password);
        setDeleteItem(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        fetchDirectory(path);
    } catch (e) { alert("Delete failed"); }
  };

  const handleMenuClick = (item: FileItem) => setMenuItem(item);

  const handleItemClick = (item: FileItem) => {
    const itemType = (item as { type?: string }).type || "file";
    const isFolder = itemType !== "file";

    if (isFolder) {
      const basePath = (item.path || "/").replace(/\/$/, "");
      const newPath = `${basePath}/${item.name}/${item.id}`;
      fetchDirectory(newPath);
      return;
    }

    setSelectedFile(item);
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

  const items = Object.values(data.contents || {});
  const folderCount = items.filter((item) => item.type === "folder").length;
  const fileCount = items.filter((item) => item.type === "file").length;
  const totalSize = items
    .filter((item) => item.type === "file")
    .reduce((acc, item) => acc + (item.size || 0), 0);

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
      await new Promise(resolve => setTimeout(resolve, 2000));
      fetchDirectory(path);
    } catch (error) { alert("Upload Failed"); }
    setIsLocalUploading(false);
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-10 relative">
      <div className="mesh-overlay" />
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
        
        {/* Local Upload */}
        {isLocalUploading && (
           <div className="mb-4 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400"><Upload size={20} className="animate-bounce" /></div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span>Uploading...</span><span>{localUploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" style={{ width: `${localUploadProgress}%` }} />
                </div>
              </div>
           </div>
        )}

        {/* Remote Upload */}
        {isRemoteUploading && (
           <div className="mb-8 glass p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 border-l-4 border-l-emerald-500">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                {remoteStatus === "Initializing..." || remoteStatus === "Preparing Upload..." ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : remoteStatus === "Complete! Refreshing..." ? (
                    <CheckCircle2 size={20} className="animate-pulse" />
                ) : (
                    <LinkIcon size={20} className="animate-pulse" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm font-medium text-zinc-300">
                    <span className="flex items-center gap-2">
                        {remoteStatus}
                    </span>
                    <span>{remoteProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]" style={{ width: `${remoteProgress}%` }} />
                </div>
              </div>
           </div>
        )}

        <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass rounded-2xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center"><Folder size={18} /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Folders</p>
              <p className="text-lg font-semibold text-zinc-100">{folderCount}</p>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-300 flex items-center justify-center"><FileText size={18} /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Files</p>
              <p className="text-lg font-semibold text-zinc-100">{fileCount}</p>
            </div>
          </div>
          <div className="glass rounded-2xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center"><HardDrive size={18} /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Visible Size</p>
              <p className="text-lg font-semibold text-zinc-100">{(totalSize / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
        </section>

        <FileGrid data={data} onItemClick={handleItemClick} onMenu={handleMenuClick} loading={loading} />
      </main>

      <AnimatePresence>
        {selectedFile && (
            <FileActionModal 
                file={selectedFile}
                downloadUrl={getFileDownloadUrl(selectedFile.path, selectedFile.id)}
                onClose={() => setSelectedFile(null)}
                onStream={isVideoFile(selectedFile.name) ? () => {
                    const subtitles = detectSubtitlesForVideo(selectedFile, Object.values(data.contents || {}), getFileDownloadUrl);
                    setVideoState({
                      src: getFileDownloadUrl(selectedFile.path, selectedFile.id),
                      title: selectedFile.name,
                      subtitles,
                    });
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

      {videoState && (
        <VideoPlayer
          src={videoState.src}
          title={videoState.title}
          subtitles={videoState.subtitles}
          onClose={() => setVideoState(null)}
        />
      )}
    </div>
  );
}
