"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignOutPage() {
  const [isExiting, setIsExiting] = useState(false);

  const handleSignOut = async () => {
    setIsExiting(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#05060f] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center">
          
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
            className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8"
          >
            <ShieldAlert size={40} className="text-red-500" />
          </motion.div>

          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Confirm Sign Out</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
            You're about to end your secure session. Any unsaved interview progress may be lost.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSignOut}
              disabled={isExiting}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {isExiting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-top-white rounded-full animate-spin" />
                  Safely Exiting...
                </>
              ) : (
                <>
                  <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                  End Session
                </>
              )}
            </button>

            <Link
              href="/profile"
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-sm transition-all border border-white/10 flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <p className="mt-8 text-center text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
          Secured by AI-Interviewer Identity Node
        </p>
      </motion.div>
    </div>
  );
}
