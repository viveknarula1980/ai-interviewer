import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  // Await params object parsing to gracefully extract [id] string
  const { id: idToFetch } = await params;

  const report = await prisma.session.findUnique({
    where: { id: idToFetch },
    include: { qaPairs: { orderBy: { orderIndex: 'asc' } } }
  });

  if (!report || report.userId !== (session.user as any).id) return <p className="p-8 text-center text-red-500 font-bold">Report Not Found or Unauthorized</p>;

  const strengths = report.topStrengths ? JSON.parse(report.topStrengths) : ["Clear articulation", "Strong technical examples", "Good structure"];
  const improvements = report.topImprovements ? JSON.parse(report.topImprovements) : ["Dive deeper into system design", "Use STAR method more strictly"];

  return (
    <div className="flex flex-col min-h-screen bg-background text-white p-4 sm:p-12 max-w-7xl mx-auto">
       <nav className="flex justify-between items-center mb-8">
         <Link href="/history" className="flex items-center gap-2 text-gray-400 hover:text-white transition"><ArrowLeft size={20} /> Back to History</Link>
         <Link href="/interview/setup" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold"><RotateCcw size={20} /> New Interview</Link>
       </nav>

       <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Overall Summary Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-8 rounded-3xl shadow-2xl backdrop-blur-sm flex flex-col justify-center">
             <h1 className="text-3xl font-extrabold mb-4">Interview Performance Report</h1>
             <p className="text-gray-300 leading-relaxed text-lg">{report.summary || "You demonstrated a strong baseline understanding of the subject matter, but missed some key structural communication skills in the behavioural segments."}</p>
          </div>
          
          {/* Score Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Overall Score</p>
             <div className="text-7xl font-black bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
                {report.overallScore}/10
             </div>
             <p className="text-sm font-medium text-green-500 bg-green-500/10 px-4 py-1 rounded-full">Solid Performance</p>
          </div>
       </div>

       {/* Strengths / Improvements */}
       <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-green-500/5 border border-green-500/20 p-8 rounded-3xl">
             <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-green-400"><CheckCircle2 size={24}/> Top 3 Strengths</h3>
             <ul className="space-y-4">
               {strengths.map((str: string, i: number) => (
                 <li key={i} className="flex gap-3 text-gray-300"><div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-sm">{i+1}</div> {str}</li>
               ))}
             </ul>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl">
             <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-red-400"><AlertCircle size={24}/> Top 3 Improvements</h3>
             <ul className="space-y-4">
               {improvements.map((imp: string, i: number) => (
                 <li key={i} className="flex gap-3 text-gray-300"><div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-sm">{i+1}</div> {imp}</li>
               ))}
             </ul>
          </div>
       </div>

       {/* Per-Answer Review Map */}
       <h2 className="text-3xl font-bold border-b border-white/10 pb-6 mb-8">Per-Answer Analysis</h2>
       <div className="space-y-8">
          {report.qaPairs?.map((qa) => (
             <div key={qa.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-black/40 p-6 border-b border-white/10">
                   <h4 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest">Question {qa.orderIndex}</h4>
                   <p className="font-medium text-lg text-white">"{qa.question}"</p>
                </div>
                <div className="p-6 grid lg:grid-cols-2 gap-8">
                   <div>
                      <h5 className="font-bold text-gray-400 mb-2">Your Answer</h5>
                      <p className="text-gray-300 font-light italic bg-white/5 p-4 rounded-lg mb-6 leading-relaxed">"{qa.userTranscript}"</p>
                      
                      <h5 className="font-bold text-green-400 mb-2">Model Ideal Answer</h5>
                      <p className="text-gray-300 font-medium leading-relaxed bg-green-500/10 p-4 border border-green-500/20 rounded-lg">{qa.modelAnswer}</p>
                   </div>
                   <div>
                      <h5 className="font-bold text-gray-400 mb-4">Score Breakdown</h5>
                      <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-center"><span className="text-gray-300">Clarity</span> <span className="font-bold text-blue-400">{qa.scoreClarity}/10</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-300">Depth</span> <span className="font-bold text-blue-400">{qa.scoreDepth}/10</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-300">Relevance</span> <span className="font-bold text-blue-400">{qa.scoreRelevance}/10</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-300">Structure</span> <span className="font-bold text-blue-400">{qa.scoreStructure}/10</span></div>
                      </div>
                      <h5 className="font-bold text-purple-400 mb-2">Targeted Feedback</h5>
                      <p className="text-gray-300 leading-relaxed">{qa.aiFeedback}</p>
                   </div>
                </div>
             </div>
          ))}

          {/* Fallback mock UI if no QA loaded yet */}
          {!report.qaPairs?.length && (
            <div className="p-8 text-center text-gray-400 italic bg-white/5 rounded-2xl">Detailed transcript not captured. Ensure your microphone was active.</div>
          )}
       </div>
    </div>
  );
}
