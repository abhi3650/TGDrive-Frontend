import { useState } from "react";
import { LogIn, Lock } from "lucide-react";
import { checkPassword } from "@/lib/api";

interface LoginScreenProps {
  onSuccess: (pass: string) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await checkPassword(password);
      if (res.data.status === "ok") {
        onSuccess(password);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full" />
        
        <div className="relative z-10 text-center">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 text-cyan-400 border border-cyan-500/20">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400 mb-6 text-sm">Enter your secure key to access the drive.</p>

          <input
            type="password"
            placeholder="Password"
            className={`w-full bg-slate-950 border ${error ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-cyan-500"} rounded-lg px-4 py-3 text-white outline-none transition-all mb-4`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : <><LogIn size={18} /> Login</>}
          </button>
        </div>
      </div>
    </div>
  );
}
