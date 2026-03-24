"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <BrainCircuit size={48} className="text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-gray-400 mt-2 text-center text-sm">Sign up to access your AI Interview sessions from any device</p>
        </div>

        <button 
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/profile' })} 
          className="w-full flex border border-white/20 rounded-xl p-4 hover:bg-white/10 cursor-pointer justify-center mb-6 transition items-center gap-3 bg-white/5 active:scale-95 shadow-lg"
        >
           <span className="font-bold">Continue with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="mx-4 text-gray-500 text-sm">or sign up with email</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <div className="space-y-4">
          <input 
            type="text" required placeholder="Full Name" disabled={loading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" required placeholder="Email Address" disabled={loading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" required placeholder="Password (min 8 chars)" disabled={loading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition disabled:bg-blue-600/50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Already have an account? <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in here</Link>
        </p>
      </form>
    </div>
  );
}
