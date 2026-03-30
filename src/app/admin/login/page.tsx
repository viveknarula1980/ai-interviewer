"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid Admin Credentials");
      setLoading(false);
    } else {
      // Small delay to ensure session is updated
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#03002E] flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-700 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
           <div className="p-4 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <ShieldCheck size={48} />
           </div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin System</h1>
           <p className="text-gray-400 mt-2 font-medium">Restricted Management Access</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
              <div className="relative group-focus-within:scale-[1.01] transition-transform">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="admin@admin.com"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
              <div className="relative group-focus-within:scale-[1.01] transition-transform">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg mt-4"
            >
              {loading ? "Authenticating..." : (
                <span className="flex items-center gap-2 tracking-wide">Enter Admin Dashboard <ArrowRight size={20}/></span>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-10 text-gray-500 text-sm font-medium">
           System Access Only • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
