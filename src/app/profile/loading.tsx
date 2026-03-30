"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#05060f] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Brand Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] mb-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <BrainCircuit size={32} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Shimmer loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
             <Loader2 className="animate-spin text-blue-400" size={18} />
             Synchronizing Dashboard...
          </h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Applying your intelligence reports & resumes</p>
        </motion.div>

        {/* Shimmer card placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 w-full max-w-4xl opacity-30">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="h-[140px] rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
