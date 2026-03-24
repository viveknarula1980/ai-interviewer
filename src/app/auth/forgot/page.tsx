"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset link.");
      }
      
      toast.success("Reset link sent! Please check your inbox.");
      setSent(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <BrainCircuit size={48} className="text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Reset Password</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">We'll send you a link to your email to get back into your account</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition" size={20} />
              <input 
                type="email" required placeholder="Email Address" value={email} disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <button 
               type="submit" 
               disabled={loading}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition disabled:bg-blue-600/50"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>

            <p className="text-center text-gray-400 text-sm">
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">Return to Login</Link>
            </p>
          </form>
        ) : (
          <div className="text-center py-8 animate-in fade-in scale-in duration-500">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
             </div>
             <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
             <p className="text-gray-400 leading-relaxed mb-8">We've sent a recovery link to <strong>{email}</strong>. Please check your inbox (and spam folder) to reset your password.</p>
             <Link href="/auth/login" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition">
                Return to Login
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
