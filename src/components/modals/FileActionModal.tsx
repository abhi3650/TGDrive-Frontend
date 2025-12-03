import { X, Download, Copy, Play, FileText, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile } from "@/lib/utils";
import { useState } from "react";

interface FileActionModalProps {
  file: FileItem;
  downloadUrl: string;
  onClose: () => void;
  onStream?: () => void;
}

export default function FileActionModal({ file, downloadUrl, onClose, onStream }: FileActionModalProps) {
  const isVideo = isVideoFile(file.name);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with Icon */}
        <div className="bg-gradient-to-b from-zinc-800/50 to-transparent p-8 flex flex-col items-center justify-center border-b border-zinc-800/50">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${isVideo ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {isVideo ? <Film size={40} /> : <FileText size={40} />}
          </div>
          
          <h2 className="text-xl font-semibold text-white text-center break-all line-clamp-2 px-4">
            {file.name}
          </h2>
          <p className="text-sm text-zinc-400 mt-2 font-mono bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Actions Body */}
        <div className="p-6 space-y-3">
          
          {/* Stream Option (Video Only) */}
          {isVideo && onStream && (
            <div className="space-y-2">
               <button 
                onClick={onStream}
                className="w-full group flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-purple-500/10 border border-zinc-800 hover:border-purple-500/50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 group-hover:bg-purple-500 text-white rounded-lg transition-colors">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white group-hover:text-purple-400">Stream Video</p>
                    <p className="text-xs text-zinc-500">Play directly in browser</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Download Option */}
          <div className="flex gap-2">
             <a 
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 group flex items-center justify-center gap-2 p-3 bg-white text-black hover:bg-zinc-200 font-medium rounded-xl transition-colors"
              >
                <Download size={18} />
                Download
              </a>
              
              <button 
                onClick={() => copyToClipboard(downloadUrl)}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl transition-colors relative"
                title="Copy Link"
              >
                {copied ? <span className="text-green-400 font-bold text-xs">✔</span> : <Copy size={18} />}
              </button>
          </div>

          {/* Stream Link Copy (If Video) */}
          {isVideo && (
             <button 
             onClick={() => copyToClipboard(downloadUrl)}
             className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2 flex items-center justify-center gap-2 transition-colors"
           >
             <Copy size={12} /> Copy Stream URL
           </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
