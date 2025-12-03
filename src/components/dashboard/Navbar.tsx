import { ArrowLeft, Upload, Search, Cloud } from "lucide-react";
import { useRef, useState } from "react";

interface NavbarProps {
  currentPath: string;
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
}

export default function Navbar({ currentPath, onBack, onUpload, onSearch }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <nav className="fixed top-0 w-full glass z-50 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
          <Cloud size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col">
          <h1 className="font-bold text-white leading-none tracking-tight">TG Drive</h1>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
             <span className="text-cyan-500">root</span>
             {currentPath !== "/" && (
                 <span className="truncate max-w-[150px]">/{currentPath.split('/').slice(1, -1).join('/')}</span>
             )}
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-zinc-500 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-zinc-900/50 border border-zinc-700/50 focus:border-cyan-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-600"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {currentPath !== "/" && !currentPath.includes("/search_") && (
          <button 
            onClick={onBack} 
            className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white border border-zinc-700/50 transition-all"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          onChange={onUpload} 
        />
      </div>
    </nav>
  );
}
