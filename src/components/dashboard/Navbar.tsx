import { ArrowLeft, Upload, Search, Cloud } from "lucide-react";
import { useRef, useState } from "react";

interface NavbarProps {
  currentPath: string;
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
  onHome: () => void; // <--- NEW PROP
}

export default function Navbar({ currentPath, onBack, onUpload, onSearch, onHome }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <nav className="fixed top-0 w-full glass z-50 px-4 md:px-8 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 md:gap-4 transition-all">
      
      {/* 1. Logo Section (Clickable) */}
      <div 
        className="flex items-center gap-3 order-1 cursor-pointer group" 
        onClick={onHome} // <--- CLICK HANDLER ADDED
      >
        <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20 shrink-0 group-hover:scale-105 transition-transform">
          <Cloud size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col">
          <h1 className="font-bold text-white leading-none tracking-tight text-lg group-hover:text-cyan-400 transition-colors">TG Drive</h1>
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono mt-0.5 max-w-[120px] overflow-hidden">
             <span className="text-cyan-500 shrink-0">root</span>
             {currentPath !== "/" && (
                 <span className="truncate">/{currentPath.split('/').slice(1, -1).join('/')}</span>
             )}
          </div>
        </div>
      </div>

      {/* 2. Actions Section */}
      <div className="flex items-center gap-2 order-2 md:order-3 ml-auto md:ml-0">
        {currentPath !== "/" && !currentPath.includes("/search_") && (
          <button 
            onClick={onBack} 
            className="p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white border border-zinc-700/50 transition-all"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          onChange={onUpload} 
        />
      </div>

      {/* 3. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 order-3 md:order-2 mt-1 md:mt-0">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-zinc-500" />
        </div>
        <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-zinc-900/50 border border-zinc-700/50 focus:border-cyan-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-600"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

    </nav>
  );
}
