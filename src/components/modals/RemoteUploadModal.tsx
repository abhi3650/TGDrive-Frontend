import { X, Link as LinkIcon, DownloadCloud } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface RemoteUploadModalProps {
  onClose: () => void;
  onUpload: (url: string) => void;
}

export default function RemoteUploadModal({ onClose, onUpload }: RemoteUploadModalProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUpload(url.trim()); // Trim whitespace
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <LinkIcon size={20} className="text-cyan-500" /> Remote Upload
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-xs text-zinc-400 font-medium ml-1">Direct Download Link</label>
                    <input
                        autoFocus
                        type="url"
                        placeholder="https://example.com/file.mp4"
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-600"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex gap-3 items-start">
                    <DownloadCloud size={18} className="text-cyan-400 mt-0.5" />
                    <p className="text-xs text-cyan-200/80 leading-relaxed">
                        The server will download this file and upload it to your TG Drive automatically. You can close this window after starting.
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors">
                Start Upload
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
