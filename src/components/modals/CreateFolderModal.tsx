import { X, FolderPlus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderModal({ onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onCreate(name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FolderPlus size={20} className="text-cyan-500" /> New Folder
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="text"
              placeholder="Folder Name"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors mb-6"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors">
                Create
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
