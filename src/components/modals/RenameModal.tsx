import { X, Edit2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface RenameModalProps {
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export default function RenameModal({ currentName, onClose, onRename }: RenameModalProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== currentName) onRename(name);
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
              <Edit2 size={20} className="text-blue-500" /> Rename
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="text"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors mb-6"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
                Save
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
