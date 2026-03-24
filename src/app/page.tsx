import Link from "next/link";
import { BrainCircuit, Code, Database, Cpu, Users, Layout, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-24 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-4xl">
        <BrainCircuit size={64} className="text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text leading-tight">
          Master Your Next Interview
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Experience realistic, voice-first AI interviews. Upload your resume or choose a subject to get personalized questions and actionable feedback.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
          <Link 
            href="/auth/register" 
            className="rounded-xl bg-blue-600 px-10 py-4 font-bold text-white shadow-lg hover:bg-blue-500 transition border border-blue-500/50 hover:shadow-blue-500/25 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            Sign Up Now
          </Link>
          <Link 
            href="/interview/setup" 
            className="rounded-xl bg-white/5 px-10 py-4 font-bold text-white hover:bg-white/10 transition border border-white/10 backdrop-blur-md"
          >
            Start Practice
          </Link>
        </div>

        {/* Subject Preview Section - New Addition */}
        <div className="w-full pt-12 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Adaptive Interviews Available In</p>
           <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
              {[
                { name: "JavaScript", icon: <Code size={14} /> },
                { name: "System Design", icon: <Cpu size={14} /> },
                { name: "Python", icon: <Code size={14} /> },
                { name: "SQL", icon: <Database size={14} /> },
                { name: "Product Management", icon: <TrendingUp size={14} /> },
                { name: "Data Science", icon: <Database size={14} /> },
                { name: "HR & Behavioural", icon: <Users size={14} /> }
              ].map((topic) => (
                <div key={topic.name} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold hover:bg-white/10 hover:border-blue-500/50 transition cursor-default group">
                   <span className="text-blue-500 group-hover:scale-110 transition-transform">{topic.icon}</span>
                   {topic.name}
                </div>
              ))}
              <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold animate-pulse">
                + Strategy & Marketing
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
