import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">Delete File?</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Are you sure you want to delete <span className="text-white font-medium">"{itemName}"</span>?<br/>
            This action cannot be undone.
          </p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
