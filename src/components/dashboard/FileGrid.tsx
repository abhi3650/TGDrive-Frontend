import { AnimatePresence } from "framer-motion";
import { FileItem, DirectoryData } from "@/lib/types";
import FileCard from "./FileCard";
import { FolderOpen } from "lucide-react";

interface FileGridProps {
  data: DirectoryData;
  onItemClick: (item: FileItem) => void;
  onMenu: (item: FileItem, e: React.MouseEvent) => void;
  loading: boolean;
}

export default function FileGrid({ data, onItemClick, onMenu, loading }: FileGridProps) {
  const items = Object.values(data.contents || {});

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl aspect-[1/1.08]"></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 glass rounded-3xl border border-white/5">
        <FolderOpen size={68} className="mb-4 opacity-25" />
        <p className="text-lg text-zinc-300">This folder is empty</p>
        <p className="text-sm text-zinc-500 mt-1">Upload files or create a folder to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <FileCard key={item.id} item={item} onClick={onItemClick} onMenu={onMenu} />
        ))}
      </AnimatePresence>
    </div>
  );
}
