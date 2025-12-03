import { X, Edit2, Trash2, Download, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";
import { getFileDownloadUrl } from "@/lib/api";

interface FileMenuModalProps {
  item: FileItem;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FileMenuModal({ item, onClose, onRename, onDelete }: FileMenuModalProps) {
  const downloadUrl = getFileDownloadUrl(item.path, item.id);

  const copyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    alert("Link Copied!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm glass-card bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="font-medium text-white truncate pr-4">{item.name}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-2 space-y-1">
          {/* Download (Only for files) */}
          {item.type === "file" && (
            <a 
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
              onClick={onClose}
            >
              <Download size={18} className="text-cyan-400" />
              Download
            </a>
          )}
          
          {/* Copy Link */}
           {item.type === "file" && (
            <button 
              onClick={copyLink}
              className="flex items-center gap-3 w-full p-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left"
            >
              <Copy size={18} className="text-emerald-400" />
              Copy Link
            </button>
           )}

          <div className="h-px bg-zinc-800 my-1 mx-3" />

          {/* Rename */}
          <button 
            onClick={onRename}
            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-left"
          >
            <Edit2 size={18} className="text-blue-400" />
            Rename
          </button>

          {/* Delete */}
          <button 
            onClick={onDelete}
            className="flex items-center gap-3 w-full p-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
