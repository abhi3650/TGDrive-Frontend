import { X } from "lucide-react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  src: string;
  onClose: () => void;
}

export default function VideoPlayer({ src, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>
        <div className="aspect-video">
          <video 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
            src={src}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </motion.div>
    </div>
  );
}
