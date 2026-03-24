"use client";

import Link from "next/link";
import { BrainCircuit, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <div className="w-48 h-48 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-12 shadow-2xl backdrop-blur-md">
           <BrainCircuit size={100} className="text-blue-500 opacity-20 absolute" />
           <span className="text-8xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">404</span>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-6">Page Not Found</h1>
        <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium">
          The module you're looking for doesn't exist yet, or the route was mistyped. Let's get you back to the interview dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/" 
            className="flex-1 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-blue-500 transition border border-blue-500/50 flex items-center justify-center gap-2"
          >
            <Home size={20} /> Back Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex-1 rounded-2xl bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10 transition border border-white/10 backdrop-blur-md flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
