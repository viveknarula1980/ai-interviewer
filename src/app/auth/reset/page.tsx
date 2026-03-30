"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Password reset failed.");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <BrainCircuit size={48} className="text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Update Password</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">Create a new, secure password for your account</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center flex items-center justify-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition" size={20} />
              <input 
                type="password" required placeholder="New Password (min 8 characters)" value={password} disabled={loading || !token}
                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            
            <button 
               type="submit" 
               disabled={loading || !token}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition disabled:bg-blue-600/50"
            >
              {loading ? "Updating..." : "Confirm New Password"}
            </button>
            <p className="text-center text-gray-400 text-sm">
              <Link href="/auth/login" className="text-blue-400 font-semibold underline underline-offset-4">Return to login</Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-8 animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle2 size={40} className="text-green-500" />
             </div>
             <h3 className="text-2xl font-bold mb-2">Password Updated</h3>
             <p className="text-gray-400 mb-8">You can now use your new password to sign in to your dashboard.</p>
             <Link href="/auth/login" className="block w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition">
                Sign In Now
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading update page...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
