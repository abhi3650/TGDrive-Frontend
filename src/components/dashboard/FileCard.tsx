import { FileText, Folder, PlayCircle, Film, Music, Image as ImageIcon, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile } from "@/lib/utils";

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onMenu: (item: FileItem, e: React.MouseEvent) => void;
}

export default function FileCard({ item, onClick, onMenu }: FileCardProps) {
  const isVideo = item.type === "file" && isVideoFile(item.name);
  const isImage = item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isAudio = item.name.match(/\.(mp3|wav|ogg|flac)$/i);

  const getIcon = () => {
    if (item.type === "folder") return <Folder size={46} className="text-amber-400/90 drop-shadow-xl" fill="currentColor" fillOpacity={0.22} />;
    if (isVideo) return <Film size={38} className="text-violet-300" />;
    if (isImage) return <ImageIcon size={38} className="text-pink-300" />;
    if (isAudio) return <Music size={38} className="text-cyan-300" />;
    return <FileText size={38} className="text-zinc-500" />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group glass-card rounded-2xl p-4 relative overflow-visible flex flex-col justify-between aspect-[1/1.1] border border-white/5 hover:border-cyan-300/25"
      onClick={() => onClick(item)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent opacity-70 rounded-2xl pointer-events-none" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenu(item, e);
        }}
        className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800/90 rounded-lg transition-colors z-20"
      >
        <MoreVertical size={16} />
      </button>

      <div className="flex-1 flex items-center justify-center w-full relative z-10 cursor-pointer">
        {getIcon()}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300 pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20">
              <PlayCircle size={24} className="text-white fill-white/20" />
            </div>
          </div>
        )}
      </div>

      <div className="w-full z-10 mt-3 cursor-pointer">
        <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate transition-colors text-center px-1">{item.name}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800/70">
            {item.type === "file" ? formatBytes(item.size) : "DIR"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
