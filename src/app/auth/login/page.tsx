"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

import { toast } from "sonner";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered")) {
      toast.success("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", { 
      email, 
      password, 
      redirect: false 
    });

    if (res?.error) {
      toast.error("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <BrainCircuit size={48} className="text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">Log in to view your past feedback reports</p>
        </div>

        <button 
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/profile' })} 
          className="w-full flex border border-white/20 rounded-xl p-4 hover:bg-white/10 cursor-pointer justify-center mb-6 transition items-center gap-3 bg-white/5 active:scale-95"
        >
           <span className="font-bold">Continue with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="mx-4 text-gray-500 text-sm">or sign in with email</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <div className="space-y-4">
          <input 
            type="email" required placeholder="Email Address" value={email} disabled={loading}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
            onChange={e => setEmail(e.target.value)}
          />
          <div>
            <input 
              type="password" required placeholder="Password" value={password} disabled={loading}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition disabled:opacity-50"
              onChange={e => setPassword(e.target.value)}
            />
            <div className="text-right mt-2">
              <Link href="/auth/forgot" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Forgot Password?</Link>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition disabled:bg-blue-600/50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Don't have an account? <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4"><div className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl animate-pulse h-[500px]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
