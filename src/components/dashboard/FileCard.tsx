import { FileText, Folder, PlayCircle, Film, Music, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile } from "@/lib/utils";

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
}

export default function FileCard({ item, onClick }: FileCardProps) {
  const isVideo = item.type === "file" && isVideoFile(item.name);
  const isImage = item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isAudio = item.name.match(/\.(mp3|wav|ogg|flac)$/i);

  // Icon Selection
  const getIcon = () => {
    if (item.type === "folder") return <Folder size={48} className="text-yellow-500/80 drop-shadow-xl" fill="currentColor" fillOpacity={0.2} />;
    if (isVideo) return <Film size={40} className="text-purple-400" />;
    if (isImage) return <ImageIcon size={40} className="text-pink-400" />;
    if (isAudio) return <Music size={40} className="text-cyan-400" />;
    return <FileText size={40} className="text-zinc-500" />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => onClick(item)}
      className="group glass-card rounded-2xl p-4 cursor-pointer relative overflow-hidden flex flex-col justify-between aspect-[1/1.1]"
    >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Icon Container */}
        <div className="flex-1 flex items-center justify-center w-full relative z-10">
            {getIcon()}
            {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg">
                        <PlayCircle size={24} className="text-white fill-white/20" />
                    </div>
                </div>
            )}
        </div>

        {/* Text Details */}
        <div className="w-full z-10 mt-3">
            <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate transition-colors text-center px-1">
            {item.name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800/50">
                    {item.type === "file" ? formatBytes(item.size) : "DIR"}
                </span>
            </div>
        </div>
    </motion.div>
  );
}
