"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Cpu, Briefcase, Users, Code, Server, 
  Presentation, Target, Award, BrainCircuit, ShieldAlert 
} from "lucide-react";

export default function SetupForm({ hasResume }: { hasResume: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"subject" | "resume">(hasResume ? "resume" : "subject");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const subjects = [
    { title: "JavaScript", icon: <Code size={24} />, category: "Technical" },
    { title: "Python", icon: <Server size={24} />, category: "Technical" },
    { title: "SQL", icon: <Cpu size={24} />, category: "Technical" },
    { title: "System Design", icon: <BrainCircuit size={24} />, category: "Technical" },
    { title: "Product Management", icon: <Target size={24} />, category: "Professional" },
    { title: "Data Science", icon: <Briefcase size={24} />, category: "Professional" },
    { title: "HR & Behavioural", icon: <Users size={24} />, category: "Soft Skills" },
    { title: "Marketing Strategy", icon: <Presentation size={24} />, category: "Soft Skills" },
  ];

  const handleStart = () => {
    if (mode === "subject" && !subject) return alert("Select a subject first!");
    
    const params = new URLSearchParams({ mode, difficulty, subject });
    router.push(`/interview/session?${params.toString()}`);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold mb-4">1. Select Mode</h2>
            <div className="flex gap-4">
               <button 
                 onClick={() => setMode("subject")}
                 className={`flex-1 py-4 px-6 rounded-xl border-2 transition flex items-center justify-center gap-3 ${mode === "subject" ? "border-blue-500 bg-blue-500/10 font-bold" : "border-white/10 hover:border-white/30"}`}
               >
                  <Cpu className="text-blue-400" size={20} />
                  Subject-Based
               </button>
               <button 
                 onClick={() => {
                   if (!hasResume) return alert("Please upload a resume in your profile first!");
                   setMode("resume");
                 }}
                 className={`flex-1 py-4 px-6 rounded-xl border-2 transition flex items-center justify-center gap-3 ${mode === "resume" ? "border-purple-500 bg-purple-500/10 font-bold" : "border-white/10 hover:border-white/30 opacity-60"}`}
               >
                  <FileText className="text-purple-400" size={20} />
                  Resume-Based (Personalised)
               </button>
            </div>
            {!hasResume && (
               <div className="mt-3 flex items-center gap-2 text-xs text-amber-500 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <ShieldAlert size={14} /> Resume-based mode is locked. Upload your CV in the profile section to unlock.
               </div>
            )}
          </section>

          {mode === "subject" ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-4">2. Choose Subject</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {subjects.map((sub) => (
                    <button 
                      key={sub.title}
                      onClick={() => setSubject(sub.title)}
                      className={`flex flex-col items-center justify-center p-6 border rounded-xl transition group ${subject === sub.title ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10 hover:border-white/20 hover:bg-white/5"}`}
                    >
                      <div className="text-gray-400 mb-3 group-hover:text-white transition">{sub.icon}</div>
                      <span className="font-semibold text-center">{sub.title}</span>
                      <span className="text-xs text-gray-500 mt-2">{sub.category}</span>
                    </button>
                 ))}
              </div>
            </section>
          ) : (
            <section className="bg-white/5 border border-white/10 p-8 rounded-2xl flex items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <FileText size={120} className="text-purple-500" />
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl">
                 <FileText className="text-purple-400" size={32} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-3">Resume Analysis Active</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">Our AI will parse your uploaded resume and generate highly specific technical and behavioral questions tailored to your exact career history. No fixed subjects apply.</p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-white/5 p-6 rounded-2xl border border-white/10 h-min">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-blue-500/30">
               Difficulty Level
            </h2>
            
            <div className="flex flex-col gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                   key={lvl}
                   onClick={() => setDifficulty(lvl)}
                   className={`p-4 text-left border rounded-xl transition flex items-center justify-between ${difficulty === lvl ? "border-blue-500 bg-blue-500/10 font-bold" : "border-white/10 hover:border-white/30"}`}
                >
                   <span>{lvl}</span>
                   {difficulty === lvl && <Award size={18} className="text-yellow-500" />}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-black/40 rounded-xl text-sm text-gray-400 border border-white/5 italic">
              {difficulty === 'Beginner' && "Foundational concepts, straightforward questions, accessible entry level."}
              {difficulty === 'Intermediate' && "Applied knowledge, scenario-based questions, 2-5 years experience level."}
              {difficulty === 'Advanced' && "Deep architectural expertise, complex trade-offs, 5+ years seniority expected."}
            </div>
          </section>

          <button 
             onClick={handleStart}
             className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-extrabold text-xl shadow-lg border border-white/20 transition transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]"
          >
             Start Interview
          </button>
          
          <p className="text-center text-xs text-gray-500 font-medium">
             By starting, you agree to allow browser microphone access.
          </p>
        </div>
      </div>
  );
}
