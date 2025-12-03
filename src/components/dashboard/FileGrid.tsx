import { AnimatePresence } from "framer-motion";
import { FileItem, DirectoryData } from "@/lib/types";
import FileCard from "./FileCard";
import { FolderOpen } from "lucide-react";

interface FileGridProps {
  data: DirectoryData;
  onItemClick: (item: FileItem) => void;
  onMenu: (item: FileItem, e: React.MouseEvent) => void; // <--- NEW PROP
  loading: boolean;
}

export default function FileGrid({ data, onItemClick, onMenu, loading }: FileGridProps) {
  const items = Object.values(data.contents || {});

  if (loading) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl aspect-square"></div>
            ))}
        </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
        <FolderOpen size={64} className="mb-4 opacity-20" />
        <p className="text-lg">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <FileCard 
            key={item.id} 
            item={item} 
            onClick={onItemClick} 
            onMenu={onMenu} // <--- PASS IT DOWN
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
