import { useState } from "react";
import { LogIn, Lock, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="mesh-overlay" />
      <div className="bg-slate-900/55 backdrop-blur-2xl border border-slate-700/40 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-44 bg-cyan-500/20 blur-[80px] rounded-full" />

        <div className="relative z-10 text-center">
          <div className="mx-auto w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-300 border border-cyan-500/20">
            <Lock size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TG Drive</h1>
          <p className="text-slate-400 mb-6 text-sm flex items-center justify-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" /> Secure admin access required
          </p>

          <input
            type="password"
            placeholder="Enter access key"
            className={`w-full bg-slate-950/80 border ${error ? "border-red-500/50 focus:border-red-500" : "border-slate-700/60 focus:border-cyan-500"} rounded-xl px-4 py-3 text-white outline-none transition-all mb-4`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : <><LogIn size={18} /> Login</>}
          </button>
        </div>
      </div>
    </div>
  );
}
