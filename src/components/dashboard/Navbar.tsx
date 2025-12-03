import { ArrowLeft, Upload, Trash2, Search } from "lucide-react";
import { useRef } from "react";

interface NavbarProps {
  currentPath: string;
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Navbar({ currentPath, onBack, onUpload }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse path for breadcrumbs
  const pathParts = currentPath.split("/").filter(Boolean);
  // Remove IDs from view (assuming ID is the last part of a folder segment)
  // This is a visual simplification.
  const displayPath = pathParts.length > 0 ? "root / ... / " + pathParts[pathParts.length - 2] : "root"; 

  return (
    <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 px-6 py-4 flex justify-between items-center">
      {/* Logo & Breadcrumbs */}
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 min-w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="font-bold text-white text-lg">TG</span>
        </div>
        
        <div className="flex flex-col">
          <h1 className="font-bold text-white leading-tight">Drive</h1>
          <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
             {currentPath === "/" ? "/" : "..." + currentPath.substring(currentPath.lastIndexOf('/'))}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {currentPath !== "/" && (
          <button 
            onClick={onBack} 
            className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <Search size={16} className="text-slate-500 mr-2"/>
            <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none text-white w-40"/>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-lg transition-all"
        >
          <Upload size={18} />
          <span className="hidden sm:inline text-sm font-medium">Upload</span>
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          onChange={onUpload} 
        />
        
        <button className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </nav>
  );
}
