import { File, Folder, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile } from "@/lib/utils";

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
}

export default function FileCard({ item, onClick }: FileCardProps) {
  const isVideo = item.type === "file" && isVideoFile(item.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(item)}
      className="group relative bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/60 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-3 aspect-square"
    >
      <div className="flex-1 flex items-center justify-center w-full relative">
        {item.type === "folder" ? (
          <Folder 
            size={60} 
            className="text-amber-500/80 drop-shadow-lg group-hover:text-amber-400 transition-colors" 
            fill="currentColor" 
            fillOpacity={0.2} 
          />
        ) : (
          <div className="relative">
            <File 
              size={50} 
              className="text-slate-500 group-hover:text-cyan-400 transition-colors" 
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle size={20} className="text-white fill-black/50" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full text-center">
        <p className="text-sm font-medium truncate w-full text-slate-300 group-hover:text-white transition-colors">
          {item.name}
        </p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-mono">
          {item.type === "file" ? formatBytes(item.size) : "Folder"}
        </p>
      </div>
    </motion.div>
  );
}
